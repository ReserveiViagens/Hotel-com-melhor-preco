import { PrismaClient } from '@prisma/client';
import { redis } from './cache';

const prisma = new PrismaClient();

export interface SystemMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  requestsPerMinute: number;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
  metadata: Record<string, any>;
}

class MonitoringService {
  private alerts: Alert[] = [];
  private metrics: SystemMetrics[] = [];

  // Coletar métricas do sistema
  async collectMetrics(): Promise<SystemMetrics> {
    const startTime = Date.now();
    
    try {
      // Simular coleta de métricas do sistema
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        responseTime: Math.random() * 1000,
        errorRate: Math.random() * 5,
        activeUsers: await this.getActiveUsers(),
        requestsPerMinute: await this.getRequestsPerMinute()
      };

      this.metrics.push(metrics);
      
      // Manter apenas últimas 1000 métricas
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Verificar alertas baseados nas métricas
      await this.checkAlerts(metrics);

      return metrics;
    } catch (error) {
      console.error('Erro ao coletar métricas:', error);
      throw error;
    }
  }

  // Obter usuários ativos
  private async getActiveUsers(): Promise<number> {
    try {
      const activeUsers = await redis.get('active_users');
      return activeUsers ? parseInt(activeUsers) : 0;
    } catch (error) {
      console.error('Erro ao obter usuários ativos:', error);
      return 0;
    }
  }

  // Obter requisições por minuto
  private async getRequestsPerMinute(): Promise<number> {
    try {
      const requests = await redis.get('requests_per_minute');
      return requests ? parseInt(requests) : 0;
    } catch (error) {
      console.error('Erro ao obter requisições por minuto:', error);
      return 0;
    }
  }

  // Verificar alertas baseados nas métricas
  private async checkAlerts(metrics: SystemMetrics): Promise<void> {
    const alerts: Alert[] = [];

    // Alerta de CPU alto
    if (metrics.cpu > 80) {
      alerts.push({
        id: `cpu_${Date.now()}`,
        type: 'warning',
        message: `CPU usage is high: ${metrics.cpu.toFixed(1)}%`,
        severity: metrics.cpu > 90 ? 'high' : 'medium',
        timestamp: new Date(),
        resolved: false,
        metadata: { cpu: metrics.cpu }
      });
    }

    // Alerta de memória alta
    if (metrics.memory > 85) {
      alerts.push({
        id: `memory_${Date.now()}`,
        type: 'warning',
        message: `Memory usage is high: ${metrics.memory.toFixed(1)}%`,
        severity: metrics.memory > 95 ? 'critical' : 'high',
        timestamp: new Date(),
        resolved: false,
        metadata: { memory: metrics.memory }
      });
    }

    // Alerta de taxa de erro alta
    if (metrics.errorRate > 2) {
      alerts.push({
        id: `error_rate_${Date.now()}`,
        type: 'error',
        message: `Error rate is high: ${metrics.errorRate.toFixed(2)}%`,
        severity: metrics.errorRate > 5 ? 'critical' : 'high',
        timestamp: new Date(),
        resolved: false,
        metadata: { errorRate: metrics.errorRate }
      });
    }

    // Alerta de tempo de resposta alto
    if (metrics.responseTime > 2000) {
      alerts.push({
        id: `response_time_${Date.now()}`,
        type: 'warning',
        message: `Response time is slow: ${metrics.responseTime.toFixed(0)}ms`,
        severity: metrics.responseTime > 5000 ? 'high' : 'medium',
        timestamp: new Date(),
        resolved: false,
        metadata: { responseTime: metrics.responseTime }
      });
    }

    // Adicionar alertas à lista
    this.alerts.push(...alerts);

    // Enviar alertas críticos
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    for (const alert of criticalAlerts) {
      await this.sendAlert(alert);
    }
  }

  // Enviar alerta
  private async sendAlert(alert: Alert): Promise<void> {
    try {
      // TODO: Implementar integração com serviços de notificação
      // - Slack
      // - Email
      // - SMS
      // - PagerDuty
      
      console.log(`🚨 ALERTA CRÍTICO: ${alert.message}`, {
        severity: alert.severity,
        timestamp: alert.timestamp,
        metadata: alert.metadata
      });

      // Salvar alerta no banco
      await prisma.systemAlert.create({
        data: {
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          metadata: JSON.stringify(alert.metadata),
          timestamp: alert.timestamp
        }
      });
    } catch (error) {
      console.error('Erro ao enviar alerta:', error);
    }
  }

  // Obter métricas históricas
  async getHistoricalMetrics(hours: number = 24): Promise<SystemMetrics[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp > cutoff);
  }

  // Obter alertas ativos
  async getActiveAlerts(): Promise<Alert[]> {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Resolver alerta
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // Health check do sistema
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    details: Record<string, any>;
  }> {
    const checks: Record<string, boolean> = {};
    const details: Record<string, any> = {};

    try {
      // Verificar banco de dados
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      checks.database = false;
      details.database = error;
    }

    try {
      // Verificar Redis
      await redis.ping();
      checks.redis = true;
    } catch (error) {
      checks.redis = false;
      details.redis = error;
    }

    try {
      // Verificar APIs externas
      const externalApis = await this.checkExternalAPIs();
      checks.externalAPIs = externalApis;
    } catch (error) {
      checks.externalAPIs = false;
      details.externalAPIs = error;
    }

    // Determinar status geral
    const allChecks = Object.values(checks);
    const failedChecks = allChecks.filter(check => !check).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks === 0) {
      status = 'healthy';
    } else if (failedChecks <= 1) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      details
    };
  }

  // Verificar APIs externas
  private async checkExternalAPIs(): Promise<boolean> {
    try {
      const apis = [
        'https://api.booking.com',
        'https://api.openweathermap.org',
        'https://www.googleapis.com'
      ];

      const results = await Promise.allSettled(
        apis.map(api => fetch(api, { method: 'HEAD', timeout: 5000 }))
      );

      const successful = results.filter(
        result => result.status === 'fulfilled' && result.value.ok
      ).length;

      return successful >= apis.length * 0.8; // 80% das APIs devem estar funcionando
    } catch (error) {
      return false;
    }
  }

  // Gerar relatório de performance
  async generatePerformanceReport(): Promise<{
    summary: Record<string, number>;
    trends: Record<string, 'up' | 'down' | 'stable'>;
    recommendations: string[];
  }> {
    const metrics = await this.getHistoricalMetrics(24);
    
    if (metrics.length === 0) {
      return {
        summary: {},
        trends: {},
        recommendations: []
      };
    }

    // Calcular médias
    const avgCPU = metrics.reduce((sum, m) => sum + m.cpu, 0) / metrics.length;
    const avgMemory = metrics.reduce((sum, m) => sum + m.memory, 0) / metrics.length;
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;

    // Calcular tendências
    const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(Math.floor(metrics.length / 2));

    const getTrend = (first: number[], second: number[]): 'up' | 'down' | 'stable' => {
      const firstAvg = first.reduce((sum, m) => sum + m, 0) / first.length;
      const secondAvg = second.reduce((sum, m) => sum + m, 0) / second.length;
      const diff = secondAvg - firstAvg;
      
      if (Math.abs(diff) < 5) return 'stable';
      return diff > 0 ? 'up' : 'down';
    };

    const cpuTrend = getTrend(
      firstHalf.map(m => m.cpu),
      secondHalf.map(m => m.cpu)
    );

    const responseTimeTrend = getTrend(
      firstHalf.map(m => m.responseTime),
      secondHalf.map(m => m.responseTime)
    );

    // Gerar recomendações
    const recommendations: string[] = [];
    
    if (avgCPU > 70) {
      recommendations.push('Consider scaling up CPU resources or optimizing code');
    }
    
    if (avgMemory > 80) {
      recommendations.push('Memory usage is high, consider increasing memory allocation');
    }
    
    if (avgResponseTime > 1000) {
      recommendations.push('Response times are slow, optimize database queries and caching');
    }
    
    if (avgErrorRate > 1) {
      recommendations.push('Error rate is elevated, investigate and fix issues');
    }

    return {
      summary: {
        avgCPU,
        avgMemory,
        avgResponseTime,
        avgErrorRate
      },
      trends: {
        cpu: cpuTrend,
        responseTime: responseTimeTrend
      },
      recommendations
    };
  }
}

export const monitoringService = new MonitoringService(); 