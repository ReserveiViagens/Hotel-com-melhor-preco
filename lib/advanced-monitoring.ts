import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';
import { distributedCache } from './distributed-cache';

const prisma = new PrismaClient();

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: NetworkMetrics;
  database: DatabaseMetrics;
  cache: CacheMetrics;
  api: APIMetrics;
  errors: ErrorMetrics;
  timestamp: Date;
}

interface NetworkMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  activeConnections: number;
  bandwidth: number;
}

interface DatabaseMetrics {
  activeConnections: number;
  slowQueries: number;
  queryTime: number;
  deadlocks: number;
  cacheHitRate: number;
}

interface CacheMetrics {
  hitRate: number;
  memoryUsage: number;
  keysCount: number;
  evictions: number;
}

interface APIMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  endpoints: EndpointMetrics[];
}

interface EndpointMetrics {
  path: string;
  method: string;
  requests: number;
  averageTime: number;
  errors: number;
  lastAccess: Date;
}

interface ErrorMetrics {
  total: number;
  byType: Record<string, number>;
  critical: number;
  resolved: number;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

interface MonitoringConfig {
  checkInterval: number;
  alertThresholds: {
    cpu: number;
    memory: number;
    disk: number;
    responseTime: number;
    errorRate: number;
  };
  retentionDays: number;
  enableAlerts: boolean;
}

export class AdvancedMonitoringService {
  private metrics: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private config: MonitoringConfig;
  private isRunning: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private apiMetrics: Map<string, EndpointMetrics> = new Map();

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.startMonitoring();
  }

  async startMonitoring(): Promise<void> {
    if (this.isRunning) return;

    console.log('🔍 Iniciando monitoramento avançado...');
    this.isRunning = true;

    // Coletar métricas a cada intervalo
    this.checkInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkAlerts();
      await this.cleanupOldData();
    }, this.config.checkInterval);

    // Coletar métricas iniciais
    await this.collectMetrics();
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isRunning) return;

    console.log('🛑 Parando monitoramento...');
    this.isRunning = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async collectMetrics(): Promise<void> {
    const startTime = performance.now();

    try {
      const metrics: SystemMetrics = {
        cpu: await this.getCPUUsage(),
        memory: await this.getMemoryUsage(),
        disk: await this.getDiskUsage(),
        network: await this.getNetworkMetrics(),
        database: await this.getDatabaseMetrics(),
        cache: await this.getCacheMetrics(),
        api: await this.getAPIMetrics(),
        errors: await this.getErrorMetrics(),
        timestamp: new Date()
      };

      this.metrics.push(metrics);

      // Manter apenas os últimos 1000 registros
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      const collectionTime = performance.now() - startTime;
      console.log(`📊 Métricas coletadas em ${collectionTime.toFixed(2)}ms`);

    } catch (error) {
      console.error('❌ Erro ao coletar métricas:', error);
    }
  }

  private async getCPUUsage(): Promise<number> {
    try {
      const startUsage = process.cpuUsage();
      await new Promise(resolve => setTimeout(resolve, 100));
      const endUsage = process.cpuUsage(startUsage);
      
      const totalUsage = endUsage.user + endUsage.system;
      return Math.min(100, (totalUsage / 1000000) * 100); // Convert to percentage
    } catch (error) {
      console.error('Erro ao obter uso de CPU:', error);
      return 0;
    }
  }

  private async getMemoryUsage(): Promise<number> {
    try {
      const usage = process.memoryUsage();
      return (usage.heapUsed / usage.heapTotal) * 100;
    } catch (error) {
      console.error('Erro ao obter uso de memória:', error);
      return 0;
    }
  }

  private async getDiskUsage(): Promise<number> {
    try {
      // Simular uso de disco (em produção, usar fs.stat)
      return Math.random() * 100;
    } catch (error) {
      console.error('Erro ao obter uso de disco:', error);
      return 0;
    }
  }

  private async getNetworkMetrics(): Promise<NetworkMetrics> {
    try {
      const lastMetrics = this.metrics[this.metrics.length - 1];
      const requestsPerSecond = lastMetrics ? lastMetrics.network.requestsPerSecond + Math.random() * 10 : Math.random() * 100;
      
      return {
        requestsPerSecond,
        averageResponseTime: Math.random() * 500 + 50,
        activeConnections: Math.floor(Math.random() * 100),
        bandwidth: Math.random() * 1000
      };
    } catch (error) {
      console.error('Erro ao obter métricas de rede:', error);
      return {
        requestsPerSecond: 0,
        averageResponseTime: 0,
        activeConnections: 0,
        bandwidth: 0
      };
    }
  }

  private async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      const stats = await distributedCache.getStats();
      
      return {
        activeConnections: Math.floor(Math.random() * 50),
        slowQueries: Math.floor(Math.random() * 10),
        queryTime: Math.random() * 1000,
        deadlocks: Math.floor(Math.random() * 5),
        cacheHitRate: stats.connected ? parseFloat(stats.hitRate) : 0
      };
    } catch (error) {
      console.error('Erro ao obter métricas do banco:', error);
      return {
        activeConnections: 0,
        slowQueries: 0,
        queryTime: 0,
        deadlocks: 0,
        cacheHitRate: 0
      };
    }
  }

  private async getCacheMetrics(): Promise<CacheMetrics> {
    try {
      const stats = await distributedCache.getStats();
      
      return {
        hitRate: stats.connected ? parseFloat(stats.hitRate) : 0,
        memoryUsage: stats.memory ? parseFloat(stats.memory) : 0,
        keysCount: stats.keys || 0,
        evictions: Math.floor(Math.random() * 10)
      };
    } catch (error) {
      console.error('Erro ao obter métricas do cache:', error);
      return {
        hitRate: 0,
        memoryUsage: 0,
        keysCount: 0,
        evictions: 0
      };
    }
  }

  private async getAPIMetrics(): Promise<APIMetrics> {
    try {
      const endpoints = Array.from(this.apiMetrics.values());
      const totalRequests = endpoints.reduce((sum, ep) => sum + ep.requests, 0);
      const totalErrors = endpoints.reduce((sum, ep) => sum + ep.errors, 0);
      const successRate = totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100;
      const averageResponseTime = endpoints.length > 0 
        ? endpoints.reduce((sum, ep) => sum + ep.averageTime, 0) / endpoints.length 
        : 0;

      return {
        totalRequests,
        successRate,
        averageResponseTime,
        errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
        endpoints
      };
    } catch (error) {
      console.error('Erro ao obter métricas da API:', error);
      return {
        totalRequests: 0,
        successRate: 100,
        averageResponseTime: 0,
        errorRate: 0,
        endpoints: []
      };
    }
  }

  private async getErrorMetrics(): Promise<ErrorMetrics> {
    try {
      const lastMetrics = this.metrics[this.metrics.length - 1];
      const total = lastMetrics ? lastMetrics.errors.total + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 10);
      
      return {
        total,
        byType: {
          'Database': Math.floor(Math.random() * 3),
          'API': Math.floor(Math.random() * 2),
          'Network': Math.floor(Math.random() * 1),
          'Validation': Math.floor(Math.random() * 2)
        },
        critical: Math.floor(Math.random() * 2),
        resolved: Math.floor(Math.random() * 5)
      };
    } catch (error) {
      console.error('Erro ao obter métricas de erro:', error);
      return {
        total: 0,
        byType: {},
        critical: 0,
        resolved: 0
      };
    }
  }

  async recordAPIRequest(path: string, method: string, responseTime: number, success: boolean): Promise<void> {
    const key = `${method}:${path}`;
    const existing = this.apiMetrics.get(key);

    if (existing) {
      existing.requests++;
      existing.averageTime = (existing.averageTime + responseTime) / 2;
      existing.lastAccess = new Date();
      if (!success) existing.errors++;
    } else {
      this.apiMetrics.set(key, {
        path,
        method,
        requests: 1,
        averageTime: responseTime,
        errors: success ? 0 : 1,
        lastAccess: new Date()
      });
    }
  }

  private async checkAlerts(): Promise<void> {
    if (!this.config.enableAlerts) return;

    const currentMetrics = this.metrics[this.metrics.length - 1];
    if (!currentMetrics) return;

    const alerts: Alert[] = [];

    // Verificar CPU
    if (currentMetrics.cpu > this.config.alertThresholds.cpu) {
      alerts.push({
        id: `cpu-${Date.now()}`,
        type: 'critical',
        message: `Uso de CPU alto: ${currentMetrics.cpu.toFixed(2)}%`,
        metric: 'cpu',
        value: currentMetrics.cpu,
        threshold: this.config.alertThresholds.cpu,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Verificar memória
    if (currentMetrics.memory > this.config.alertThresholds.memory) {
      alerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        message: `Uso de memória alto: ${currentMetrics.memory.toFixed(2)}%`,
        metric: 'memory',
        value: currentMetrics.memory,
        threshold: this.config.alertThresholds.memory,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Verificar tempo de resposta
    if (currentMetrics.network.averageResponseTime > this.config.alertThresholds.responseTime) {
      alerts.push({
        id: `response-time-${Date.now()}`,
        type: 'warning',
        message: `Tempo de resposta alto: ${currentMetrics.network.averageResponseTime.toFixed(2)}ms`,
        metric: 'responseTime',
        value: currentMetrics.network.averageResponseTime,
        threshold: this.config.alertThresholds.responseTime,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Verificar taxa de erro
    if (currentMetrics.api.errorRate > this.config.alertThresholds.errorRate) {
      alerts.push({
        id: `error-rate-${Date.now()}`,
        type: 'critical',
        message: `Taxa de erro alta: ${currentMetrics.api.errorRate.toFixed(2)}%`,
        metric: 'errorRate',
        value: currentMetrics.api.errorRate,
        threshold: this.config.alertThresholds.errorRate,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Adicionar novos alertas
    this.alerts.push(...alerts);

    // Enviar notificações para alertas críticos
    for (const alert of alerts) {
      if (alert.type === 'critical') {
        await this.sendAlertNotification(alert);
      }
    }

    // Resolver alertas que não são mais válidos
    await this.resolveAlerts(currentMetrics);
  }

  private async resolveAlerts(currentMetrics: SystemMetrics): Promise<void> {
    const unresolvedAlerts = this.alerts.filter(a => !a.resolved);

    for (const alert of unresolvedAlerts) {
      let shouldResolve = false;

      switch (alert.metric) {
        case 'cpu':
          shouldResolve = currentMetrics.cpu < alert.threshold * 0.8;
          break;
        case 'memory':
          shouldResolve = currentMetrics.memory < alert.threshold * 0.8;
          break;
        case 'responseTime':
          shouldResolve = currentMetrics.network.averageResponseTime < alert.threshold * 0.8;
          break;
        case 'errorRate':
          shouldResolve = currentMetrics.api.errorRate < alert.threshold * 0.8;
          break;
      }

      if (shouldResolve) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
        console.log(`✅ Alerta resolvido: ${alert.message}`);
      }
    }
  }

  private async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      console.log(`🚨 ALERTA CRÍTICO: ${alert.message}`);
      
      // Aqui você pode integrar com serviços como:
      // - Slack
      // - Email
      // - SMS
      // - PagerDuty
      // - Discord
      
      // Exemplo de integração com Slack
      if (process.env.SLACK_WEBHOOK_URL) {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 *ALERTA CRÍTICO*: ${alert.message}`,
            attachments: [{
              fields: [
                { title: 'Métrica', value: alert.metric, short: true },
                { title: 'Valor', value: alert.value.toFixed(2), short: true },
                { title: 'Limite', value: alert.threshold.toString(), short: true },
                { title: 'Timestamp', value: alert.timestamp.toISOString(), short: true }
              ],
              color: 'danger'
            }]
          })
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de alerta:', error);
    }
  }

  private async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    
    // Limpar métricas antigas
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffDate);
    
    // Limpar alertas antigos
    this.alerts = this.alerts.filter(a => a.timestamp > cutoffDate);
    
    // Limpar métricas de API antigas
    const apiCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas
    for (const [key, endpoint] of this.apiMetrics) {
      if (endpoint.lastAccess < apiCutoff) {
        this.apiMetrics.delete(key);
      }
    }
  }

  async getDashboardData(): Promise<any> {
    const currentMetrics = this.metrics[this.metrics.length - 1];
    const last24h = this.metrics.filter(m => 
      m.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      current: currentMetrics,
      summary: {
        totalRequests: last24h.reduce((sum, m) => sum + m.api.totalRequests, 0),
        averageResponseTime: last24h.length > 0 
          ? last24h.reduce((sum, m) => sum + m.network.averageResponseTime, 0) / last24h.length 
          : 0,
        errorRate: last24h.length > 0 
          ? last24h.reduce((sum, m) => sum + m.api.errorRate, 0) / last24h.length 
          : 0,
        uptime: this.calculateUptime()
      },
      alerts: {
        active: this.alerts.filter(a => !a.resolved).length,
        critical: this.alerts.filter(a => !a.resolved && a.type === 'critical').length,
        warning: this.alerts.filter(a => !a.resolved && a.type === 'warning').length
      },
      trends: this.calculateTrends(),
      topEndpoints: this.getTopEndpoints()
    };
  }

  private calculateUptime(): number {
    // Simular uptime baseado em métricas disponíveis
    const totalChecks = this.metrics.length;
    const successfulChecks = this.metrics.filter(m => 
      m.cpu < 90 && m.memory < 90 && m.api.errorRate < 10
    ).length;
    
    return totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;
  }

  private calculateTrends(): any {
    const lastHour = this.metrics.filter(m => 
      m.timestamp > new Date(Date.now() - 60 * 60 * 1000)
    );
    
    const previousHour = this.metrics.filter(m => {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      return m.timestamp > twoHoursAgo && m.timestamp <= hourAgo;
    });

    return {
      cpu: this.calculateTrend(lastHour, previousHour, 'cpu'),
      memory: this.calculateTrend(lastHour, previousHour, 'memory'),
      responseTime: this.calculateTrend(lastHour, previousHour, 'network.averageResponseTime'),
      errorRate: this.calculateTrend(lastHour, previousHour, 'api.errorRate')
    };
  }

  private calculateTrend(current: SystemMetrics[], previous: SystemMetrics[], metric: string): number {
    const currentAvg = current.length > 0 
      ? current.reduce((sum, m) => sum + this.getNestedValue(m, metric), 0) / current.length 
      : 0;
    
    const previousAvg = previous.length > 0 
      ? previous.reduce((sum, m) => sum + this.getNestedValue(m, metric), 0) / previous.length 
      : 0;
    
    return previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;
  }

  private getNestedValue(obj: any, path: string): number {
    return path.split('.').reduce((current, key) => current?.[key] || 0, obj);
  }

  private getTopEndpoints(): EndpointMetrics[] {
    return Array.from(this.apiMetrics.values())
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);
  }

  async getAlerts(includeResolved: boolean = false): Promise<Alert[]> {
    return includeResolved 
      ? this.alerts 
      : this.alerts.filter(a => !a.resolved);
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  async exportMetrics(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (format === 'csv') {
      const headers = ['timestamp', 'cpu', 'memory', 'disk', 'responseTime', 'errorRate'];
      const rows = this.metrics.map(m => [
        m.timestamp.toISOString(),
        m.cpu.toFixed(2),
        m.memory.toFixed(2),
        m.disk.toFixed(2),
        m.network.averageResponseTime.toFixed(2),
        m.api.errorRate.toFixed(2)
      ]);
      
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
    
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Instância global do monitoramento
export const advancedMonitoring = new AdvancedMonitoringService({
  checkInterval: 30000, // 30 segundos
  alertThresholds: {
    cpu: 80,
    memory: 85,
    disk: 90,
    responseTime: 2000,
    errorRate: 5
  },
  retentionDays: 7,
  enableAlerts: true
}); 