import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  variables: string[];
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  segmentId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  sentAt?: Date;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

export interface EmailSegment {
  id: string;
  name: string;
  criteria: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
  }[];
  userCount: number;
}

class EmailMarketingService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Criar template de email
  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const newTemplate = await prisma.emailTemplate.create({
      data: {
        name: template.name,
        subject: template.subject,
        html: template.html,
        text: template.text,
        variables: JSON.stringify(template.variables)
      }
    });

    return {
      ...newTemplate,
      variables: JSON.parse(newTemplate.variables)
    };
  }

  // Criar segmento de usuários
  async createSegment(segment: Omit<EmailSegment, 'id' | 'userCount'>): Promise<EmailSegment> {
    const userCount = await this.countUsersByCriteria(segment.criteria);
    
    const newSegment = await prisma.emailSegment.create({
      data: {
        name: segment.name,
        criteria: JSON.stringify(segment.criteria)
      }
    });

    return {
      ...newSegment,
      criteria: JSON.parse(newSegment.criteria),
      userCount
    };
  }

  // Contar usuários por critérios
  private async countUsersByCriteria(criteria: EmailSegment['criteria']): Promise<number> {
    let whereClause: any = {};

    for (const criterion of criteria) {
      switch (criterion.operator) {
        case 'equals':
          whereClause[criterion.field] = criterion.value;
          break;
        case 'contains':
          whereClause[criterion.field] = { contains: criterion.value };
          break;
        case 'greater_than':
          whereClause[criterion.field] = { gt: criterion.value };
          break;
        case 'less_than':
          whereClause[criterion.field] = { lt: criterion.value };
          break;
        case 'in':
          whereClause[criterion.field] = { in: criterion.value };
          break;
        case 'not_in':
          whereClause[criterion.field] = { notIn: criterion.value };
          break;
      }
    }

    return await prisma.user.count({ where: whereClause });
  }

  // Criar campanha de email
  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'stats'>): Promise<EmailCampaign> {
    const newCampaign = await prisma.emailCampaign.create({
      data: {
        name: campaign.name,
        templateId: campaign.templateId,
        segmentId: campaign.segmentId,
        status: campaign.status,
        scheduledAt: campaign.scheduledAt,
        stats: JSON.stringify({
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0
        })
      }
    });

    return {
      ...newCampaign,
      stats: JSON.parse(newCampaign.stats)
    };
  }

  // Enviar campanha
  async sendCampaign(campaignId: string): Promise<void> {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      include: {
        template: true,
        segment: true
      }
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    // Atualizar status para enviando
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'sending' }
    });

    // Buscar usuários do segmento
    const users = await this.getUsersBySegment(campaign.segmentId);

    // Enviar emails
    for (const user of users) {
      try {
        await this.sendEmailToUser(user, campaign.template);
        
        // Atualizar estatísticas
        await this.updateCampaignStats(campaignId, 'sent');
      } catch (error) {
        console.error(`Erro ao enviar email para ${user.email}:`, error);
        await this.updateCampaignStats(campaignId, 'bounced');
      }
    }

    // Finalizar campanha
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { 
        status: 'completed',
        sentAt: new Date()
      }
    });
  }

  // Enviar email para usuário específico
  private async sendEmailToUser(user: any, template: any): Promise<void> {
    const html = this.replaceVariables(template.html, user);
    const text = this.replaceVariables(template.text, user);
    const subject = this.replaceVariables(template.subject, user);

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: subject,
      html: html,
      text: text,
      headers: {
        'X-Campaign-ID': template.id,
        'X-User-ID': user.id
      }
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Substituir variáveis no template
  private replaceVariables(content: string, user: any): string {
    return content
      .replace(/\{\{name\}\}/g, user.name || '')
      .replace(/\{\{email\}\}/g, user.email || '')
      .replace(/\{\{points\}\}/g, user.points?.toString() || '0')
      .replace(/\{\{level\}\}/g, user.level?.toString() || '1')
      .replace(/\{\{unsubscribe_url\}\}/g, `${process.env.BASE_URL}/unsubscribe?email=${user.email}`);
  }

  // Buscar usuários por segmento
  private async getUsersBySegment(segmentId: string): Promise<any[]> {
    const segment = await prisma.emailSegment.findUnique({
      where: { id: segmentId }
    });

    if (!segment) {
      throw new Error('Segmento não encontrado');
    }

    const criteria = JSON.parse(segment.criteria);
    let whereClause: any = {};

    for (const criterion of criteria) {
      switch (criterion.operator) {
        case 'equals':
          whereClause[criterion.field] = criterion.value;
          break;
        case 'contains':
          whereClause[criterion.field] = { contains: criterion.value };
          break;
        case 'greater_than':
          whereClause[criterion.field] = { gt: criterion.value };
          break;
        case 'less_than':
          whereClause[criterion.field] = { lt: criterion.value };
          break;
        case 'in':
          whereClause[criterion.field] = { in: criterion.value };
          break;
        case 'not_in':
          whereClause[criterion.field] = { notIn: criterion.value };
          break;
      }
    }

    return await prisma.user.findMany({
      where: {
        ...whereClause,
        emailVerified: true,
        unsubscribed: false
      }
    });
  }

  // Atualizar estatísticas da campanha
  private async updateCampaignStats(campaignId: string, statType: keyof EmailCampaign['stats']): Promise<void> {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) return;

    const stats = JSON.parse(campaign.stats);
    stats[statType]++;

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { stats: JSON.stringify(stats) }
    });
  }

  // Enviar email transacional
  async sendTransactionalEmail(to: string, template: string, variables: Record<string, any>): Promise<void> {
    const emailTemplates = {
      welcome: {
        subject: 'Bem-vindo ao Reservei Viagens!',
        html: `
          <h1>Olá {{name}}!</h1>
          <p>Bem-vindo ao Reservei Viagens. Estamos muito felizes em tê-lo conosco!</p>
          <p>Comece explorando nossos hotéis e atrações incríveis.</p>
          <a href="{{base_url}}/hoteis">Ver Hotéis</a>
        `,
        text: `
          Olá {{name}}!
          Bem-vindo ao Reservei Viagens. Estamos muito felizes em tê-lo conosco!
          Comece explorando nossos hotéis e atrações incríveis.
        `
      },
      booking_confirmation: {
        subject: 'Confirmação de Reserva - Reservei Viagens',
        html: `
          <h1>Reserva Confirmada!</h1>
          <p>Olá {{name}}, sua reserva foi confirmada com sucesso.</p>
          <p><strong>Detalhes da reserva:</strong></p>
          <ul>
            <li>Item: {{item_name}}</li>
            <li>Data: {{booking_date}}</li>
            <li>Valor: R$ {{amount}}</li>
          </ul>
        `,
        text: `
          Reserva Confirmada!
          Olá {{name}}, sua reserva foi confirmada com sucesso.
          Detalhes da reserva:
          - Item: {{item_name}}
          - Data: {{booking_date}}
          - Valor: R$ {{amount}}
        `
      },
      password_reset: {
        subject: 'Redefinição de Senha - Reservei Viagens',
        html: `
          <h1>Redefinição de Senha</h1>
          <p>Olá {{name}}, você solicitou a redefinição de sua senha.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <a href="{{reset_url}}">Redefinir Senha</a>
          <p>Este link expira em 1 hora.</p>
        `,
        text: `
          Redefinição de Senha
          Olá {{name}}, você solicitou a redefinição de sua senha.
          Acesse o link para criar uma nova senha: {{reset_url}}
          Este link expira em 1 hora.
        `
      }
    };

    const emailTemplate = emailTemplates[template as keyof typeof emailTemplates];
    if (!emailTemplate) {
      throw new Error(`Template ${template} não encontrado`);
    }

    const html = this.replaceVariables(emailTemplate.html, variables);
    const text = this.replaceVariables(emailTemplate.text, variables);

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: to,
      subject: emailTemplate.subject,
      html: html,
      text: text
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Gerar relatório de campanhas
  async generateCampaignReport(campaignId: string): Promise<{
    campaign: EmailCampaign;
    metrics: {
      openRate: number;
      clickRate: number;
      bounceRate: number;
      unsubscribeRate: number;
    };
  }> {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    const stats = JSON.parse(campaign.stats);
    const metrics = {
      openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
      clickRate: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0,
      bounceRate: stats.sent > 0 ? (stats.bounced / stats.sent) * 100 : 0,
      unsubscribeRate: stats.sent > 0 ? (stats.unsubscribed / stats.sent) * 100 : 0
    };

    return {
      campaign: {
        ...campaign,
        stats
      },
      metrics
    };
  }
}

export const emailMarketingService = new EmailMarketingService(); 