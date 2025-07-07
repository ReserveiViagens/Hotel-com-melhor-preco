import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Verificar token JWT
function verifyToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, (process.env as any).JWT_SECRET || 'fallback-secret') as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Listar campanhas de email
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Simular dados de campanhas de email
    const campaigns = [
      {
        id: '1',
        name: 'Newsletter Semanal - Janeiro',
        subject: 'Ofertas especiais para suas próximas férias!',
        type: 'newsletter',
        status: 'sent',
        templateId: '1',
        segmentId: '1',
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        stats: {
          sent: 1250,
          delivered: 1230,
          opened: 492,
          clicked: 87,
          bounced: 20,
          unsubscribed: 3
        }
      },
      {
        id: '2',
        name: 'Promoção Fim de Semana',
        subject: 'Últimas vagas! 50% OFF em hotéis selecionados',
        type: 'promotional',
        status: 'scheduled',
        templateId: '2',
        segmentId: '2',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0
        }
      },
      {
        id: '3',
        name: 'Boas-vindas Novos Clientes',
        subject: 'Bem-vindo à Reservei Viagens! 🎉',
        type: 'welcome',
        status: 'sending',
        templateId: '3',
        segmentId: '3',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        stats: {
          sent: 45,
          delivered: 44,
          opened: 23,
          clicked: 8,
          bounced: 1,
          unsubscribed: 0
        }
      }
    ];

    // Filtrar por tipo e status se especificado
    let filteredCampaigns = campaigns;
    if (type) {
      filteredCampaigns = filteredCampaigns.filter(c => c.type === type);
    }
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status);
    }

    return NextResponse.json({
      campaigns: filteredCampaigns,
      stats: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
        totalSubscribers: 1250,
        avgOpenRate: 39.2,
        avgClickRate: 7.1,
        totalSent: 18500
      }
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova campanha
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.name || !data.subject || !data.type || !data.templateId || !data.segmentId) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    // Simular criação de campanha
    const newCampaign = {
      id: Date.now().toString(),
      name: data.name,
      subject: data.subject,
      type: data.type,
      status: 'draft',
      templateId: data.templateId,
      segmentId: data.segmentId,
      scheduledAt: data.scheduledAt || null,
      createdAt: new Date().toISOString(),
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      }
    };

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 