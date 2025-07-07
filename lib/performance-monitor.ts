import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PerformanceMetric {
  id: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface PerformanceStats {
  avgResponseTime: number;
  totalRequests: number;
  errorRate: number;
  slowestEndpoints: Array<{
    endpoint: string;
    avgResponseTime: number;
    requestCount: number;
  }>;
  hourlyStats: Array<{
    hour: string;
    requests: number;
    avgResponseTime: number;
  }>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 10000; // Manter apenas os últimos 10k registros

  // Registrar métrica de performance
  async recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    try {
      const fullMetric: PerformanceMetric = {
        ...metric,
        id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      // Adicionar à memória
      this.metrics.push(fullMetric);

      // Limitar tamanho do array
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics);
      }

      // Salvar no banco
      await prisma.apiUsage.create({
        data: {
          endpoint: metric.endpoint,
          method: metric.method,
          userId: metric.userId,
          ipAddress: metric.ipAddress,
          userAgent: metric.userAgent,
          responseTime: metric.responseTime,
          statusCode: metric.statusCode
        }
      });

      // Verificar se é uma requisição lenta
      if (metric.responseTime > 1000) { // Mais de 1 segundo
        await this.handleSlowRequest(fullMetric);
      }

      // Verificar se é um erro
      if (metric.statusCode >= 400) {
        await this.handleError(fullMetric);
      }

    } catch (error) {
      console.error('Erro ao registrar métrica:', error);
    }
  }

  // Lidar com requisições lentas
  private async handleSlowRequest(metric: PerformanceMetric): Promise<void> {
    console.warn(`Requisição lenta detectada: ${metric.method} ${metric.endpoint} - ${metric.responseTime}ms`);
    
    // Aqui você pode implementar alertas, logs, etc.
    // Por exemplo, enviar notificação para o admin
  }

  // Lidar com erros
  private async handleError(metric: PerformanceMetric): Promise<void> {
    console.error(`Erro detectado: ${metric.method} ${metric.endpoint} - ${metric.statusCode}`);
    
    // Aqui você pode implementar alertas, logs, etc.
  }

  // Obter estatísticas de performance
  async getPerformanceStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<PerformanceStats> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Obter dados do banco
      const apiUsage = await prisma.apiUsage.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calcular estatísticas
      const totalRequests = apiUsage.length;
      const avgResponseTime = totalRequests > 0 
        ? apiUsage.reduce((sum, req) => sum + (req.responseTime || 0), 0) / totalRequests 
        : 0;
      
      const errorCount = apiUsage.filter(req => (req.statusCode || 0) >= 400).length;
      const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

      // Endpoints mais lentos
      const endpointStats = apiUsage.reduce((acc, req) => {
        const key = `${req.method} ${req.endpoint}`;
        if (!acc[key]) {
          acc[key] = { count: 0, totalTime: 0 };
        }
        acc[key].count++;
        acc[key].totalTime += req.responseTime || 0;
        return acc;
      }, {} as Record<string, { count: number; totalTime: number }>);

      const slowestEndpoints = Object.entries(endpointStats)
        .map(([endpoint, stats]) => ({
          endpoint,
          avgResponseTime: stats.count > 0 ? stats.totalTime / stats.count : 0,
          requestCount: stats.count
        }))
        .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
        .slice(0, 10);

      // Estatísticas por hora
      const hourlyStats = this.calculateHourlyStats(apiUsage);

      return {
        avgResponseTime,
        totalRequests,
        errorRate,
        slowestEndpoints,
        hourlyStats
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de performance:', error);
      return {
        avgResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        slowestEndpoints: [],
        hourlyStats: []
      };
    }
  }

  // Calcular estatísticas por hora
  private calculateHourlyStats(apiUsage: any[]): Array<{ hour: string; requests: number; avgResponseTime: number }> {
    const hourlyData: Record<string, { count: number; totalTime: number }> = {};

    apiUsage.forEach(req => {
      const hour = new Date(req.createdAt).toISOString().slice(0, 13) + ':00';
      if (!hourlyData[hour]) {
        hourlyData[hour] = { count: 0, totalTime: 0 };
      }
      hourlyData[hour].count++;
      hourlyData[hour].totalTime += req.responseTime || 0;
    });

    return Object.entries(hourlyData)
      .map(([hour, stats]) => ({
        hour,
        requests: stats.count,
        avgResponseTime: stats.count > 0 ? stats.totalTime / stats.count : 0
      }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  // Middleware para monitorar requisições
  static async monitorRequest(req: any, res: any, next: any): Promise<void> {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(data: any) {
      const responseTime = Date.now() - startTime;
      
      performanceMonitor.recordMetric({
        endpoint: req.path || req.url,
        method: req.method,
        responseTime,
        statusCode: res.statusCode,
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      originalSend.call(this, data);
    };

    next();
  }

  // Obter métricas em tempo real
  getRealTimeMetrics(): PerformanceMetric[] {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    return this.metrics
      .filter(metric => metric.timestamp.getTime() > oneHourAgo)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Limpar métricas antigas
  async cleanupOldMetrics(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await prisma.apiUsage.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      console.log('Métricas antigas removidas');
    } catch (error) {
      console.error('Erro ao limpar métricas antigas:', error);
    }
  }

  // Obter alertas de performance
  async getPerformanceAlerts(): Promise<Array<{
    type: 'slow' | 'error' | 'high_load';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
  }>> {
    const alerts: Array<{
      type: 'slow' | 'error' | 'high_load';
      message: string;
      severity: 'low' | 'medium' | 'high';
      timestamp: Date;
    }> = [];

    try {
      const stats = await this.getPerformanceStats('1h');

      // Alerta para tempo de resposta alto
      if (stats.avgResponseTime > 2000) {
        alerts.push({
          type: 'slow',
          message: `Tempo de resposta médio alto: ${Math.round(stats.avgResponseTime)}ms`,
          severity: stats.avgResponseTime > 5000 ? 'high' : 'medium',
          timestamp: new Date()
        });
      }

      // Alerta para taxa de erro alta
      if (stats.errorRate > 5) {
        alerts.push({
          type: 'error',
          message: `Taxa de erro alta: ${stats.errorRate.toFixed(1)}%`,
          severity: stats.errorRate > 10 ? 'high' : 'medium',
          timestamp: new Date()
        });
      }

      // Alerta para alta carga
      if (stats.totalRequests > 1000) {
        alerts.push({
          type: 'high_load',
          message: `Alta carga de requisições: ${stats.totalRequests} em 1h`,
          severity: stats.totalRequests > 5000 ? 'high' : 'medium',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Erro ao obter alertas de performance:', error);
    }

    return alerts;
  }
}

export const performanceMonitor = new PerformanceMonitor(); 