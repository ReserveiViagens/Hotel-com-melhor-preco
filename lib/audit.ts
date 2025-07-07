import { PrismaClient } from '@prisma/client';
import { redis } from './cache';

const prisma = new PrismaClient();

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityEvent {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_credentials' | 'data_tampering';
  userId?: string;
  ipAddress?: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AuditService {
  // Log de atividade normal
  async logActivity(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          details: JSON.stringify(details),
          ipAddress,
          userAgent,
          severity,
          timestamp: new Date()
        }
      });

      // Cache para análise rápida
      const key = `audit:${userId}:${action}`;
      await redis.incr(key);
      await redis.expire(key, 3600); // 1 hora
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  }

  // Log de evento de segurança
  async logSecurityEvent(
    type: 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_credentials' | 'data_tampering',
    details: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    userId?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          type,
          userId,
          ipAddress,
          details: JSON.stringify(details),
          severity,
          timestamp: new Date()
        }
      });

      // Alertas para eventos críticos
      if (severity === 'critical' || severity === 'high') {
        await this.sendSecurityAlert(type, details, severity, userId, ipAddress);
      }

      // Cache para análise de padrões
      const key = `security:${type}:${ipAddress || 'unknown'}`;
      await redis.incr(key);
      await redis.expire(key, 3600); // 1 hora
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error);
    }
  }

  // Detectar atividade suspeita
  async detectSuspiciousActivity(userId: string, action: string): Promise<boolean> {
    try {
      const key = `audit:${userId}:${action}`;
      const count = await redis.get(key);
      const activityCount = count ? parseInt(count) : 0;

      // Limites para diferentes ações
      const limits: Record<string, number> = {
        'mission_complete': 50, // Máximo 50 missões por hora
        'event_progress': 30,   // Máximo 30 progressos por hora
        'login_attempt': 10,    // Máximo 10 tentativas por hora
        'api_request': 200,     // Máximo 200 requisições por hora
      };

      const limit = limits[action] || 100;
      
      if (activityCount > limit) {
        await this.logSecurityEvent('suspicious_activity', {
          userId,
          action,
          count: activityCount,
          limit
        }, 'high', userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao detectar atividade suspeita:', error);
      return false;
    }
  }

  // Verificar padrões de fraude
  async detectFraudPatterns(userId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
    score: number;
  }> {
    try {
      const reasons: string[] = [];
      let score = 0;

      // Verificar velocidade de progresso
      const recentMissions = await prisma.userMission.findMany({
        where: {
          userId,
          completedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
          }
        }
      });

      if (recentMissions.length > 20) {
        reasons.push('Muitas missões completadas em pouco tempo');
        score += 30;
      }

      // Verificar padrão de horários
      const hourCounts = new Array(24).fill(0);
      recentMissions.forEach(mission => {
        const hour = new Date(mission.completedAt!).getHours();
        hourCounts[hour]++;
      });

      const maxHourly = Math.max(...hourCounts);
      if (maxHourly > 5) {
        reasons.push('Atividade concentrada em um período muito curto');
        score += 25;
      }

      // Verificar eventos de segurança
      const securityEvents = await prisma.securityEvent.findMany({
        where: {
          userId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      if (securityEvents.length > 5) {
        reasons.push('Múltiplos eventos de segurança');
        score += 20;
      }

      // Verificar IPs diferentes
      const uniqueIPs = await prisma.auditLog.findMany({
        where: {
          userId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        select: {
          ipAddress: true
        },
        distinct: ['ipAddress']
      });

      if (uniqueIPs.length > 3) {
        reasons.push('Múltiplos IPs em pouco tempo');
        score += 15;
      }

      const isSuspicious = score >= 50;

      if (isSuspicious) {
        await this.logSecurityEvent('suspicious_activity', {
          userId,
          score,
          reasons
        }, score >= 80 ? 'critical' : 'high', userId);
      }

      return {
        isSuspicious,
        reasons,
        score
      };
    } catch (error) {
      console.error('Erro ao detectar padrões de fraude:', error);
      return {
        isSuspicious: false,
        reasons: [],
        score: 0
      };
    }
  }

  // Obter relatório de auditoria
  async getAuditReport(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    action?: string
  ): Promise<{
    totalActivities: number;
    securityEvents: number;
    suspiciousActivities: number;
    topActions: Array<{ action: string; count: number }>;
    recentEvents: AuditLog[];
  }> {
    try {
      const where: any = {};
      if (userId) where.userId = userId;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = startDate;
        if (endDate) where.timestamp.lte = endDate;
      }
      if (action) where.action = action;

      const [totalActivities, securityEvents, suspiciousActivities] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.securityEvent.count({ where: { userId } }),
        prisma.auditLog.count({ 
          where: { 
            ...where, 
            severity: { in: ['high', 'critical'] } 
          } 
        })
      ]);

      // Top ações
      const topActions = await prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: {
          action: true
        },
        orderBy: {
          _count: {
            action: 'desc'
          }
        },
        take: 10
      });

      // Eventos recentes
      const recentEvents = await prisma.auditLog.findMany({
        where,
        orderBy: {
          timestamp: 'desc'
        },
        take: 50
      });

      return {
        totalActivities,
        securityEvents,
        suspiciousActivities,
        topActions: topActions.map(item => ({
          action: item.action,
          count: item._count.action
        })),
        recentEvents: recentEvents.map(event => ({
          ...event,
          details: JSON.parse(event.details)
        }))
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de auditoria:', error);
      return {
        totalActivities: 0,
        securityEvents: 0,
        suspiciousActivities: 0,
        topActions: [],
        recentEvents: []
      };
    }
  }

  // Enviar alerta de segurança
  private async sendSecurityAlert(
    type: string,
    details: Record<string, any>,
    severity: string,
    userId?: string,
    ipAddress?: string
  ): Promise<void> {
    // TODO: Implementar integração com sistema de notificações
    console.log(`🚨 ALERTA DE SEGURANÇA: ${type}`, {
      severity,
      userId,
      ipAddress,
      details,
      timestamp: new Date()
    });
  }
}

export const auditService = new AuditService(); 