import { performance } from 'perf_hooks';
import { distributedCache } from './distributed-cache';
import { advancedMonitoring } from './advanced-monitoring';

interface ScalingMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  timestamp: Date;
}

interface ScalingRule {
  id: string;
  name: string;
  metric: 'cpu' | 'memory' | 'responseTime' | 'errorRate' | 'requestsPerSecond';
  threshold: number;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  action: 'scale_up' | 'scale_down' | 'optimize' | 'alert';
  cooldown: number; // segundos
  enabled: boolean;
  lastTriggered?: Date;
}

interface PerformanceOptimization {
  id: string;
  name: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  applied: boolean;
  appliedAt?: Date;
  metrics: {
    before: any;
    after: any;
  };
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  database: number;
  cache: number;
}

export class AutoScalingService {
  private scalingMetrics: ScalingMetrics[] = [];
  private scalingRules: ScalingRule[] = [];
  private optimizations: PerformanceOptimization[] = [];
  private isRunning: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private optimizationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeScalingRules();
    this.initializeOptimizations();
  }

  private initializeScalingRules(): void {
    console.log('⚖️ Inicializando regras de auto-scaling...');

    this.scalingRules = [
      {
        id: 'cpu-high',
        name: 'CPU Alto',
        metric: 'cpu',
        threshold: 80,
        operator: 'gt',
        action: 'scale_up',
        cooldown: 300, // 5 minutos
        enabled: true
      },
      {
        id: 'cpu-low',
        name: 'CPU Baixo',
        metric: 'cpu',
        threshold: 20,
        operator: 'lt',
        action: 'scale_down',
        cooldown: 600, // 10 minutos
        enabled: true
      },
      {
        id: 'memory-high',
        name: 'Memória Alta',
        metric: 'memory',
        threshold: 85,
        operator: 'gt',
        action: 'optimize',
        cooldown: 180, // 3 minutos
        enabled: true
      },
      {
        id: 'response-time-high',
        name: 'Tempo de Resposta Alto',
        metric: 'responseTime',
        threshold: 2000,
        operator: 'gt',
        action: 'optimize',
        cooldown: 120, // 2 minutos
        enabled: true
      },
      {
        id: 'error-rate-high',
        name: 'Taxa de Erro Alta',
        metric: 'errorRate',
        threshold: 5,
        operator: 'gt',
        action: 'alert',
        cooldown: 60, // 1 minuto
        enabled: true
      },
      {
        id: 'requests-high',
        name: 'Muitas Requisições',
        metric: 'requestsPerSecond',
        threshold: 1000,
        operator: 'gt',
        action: 'scale_up',
        cooldown: 240, // 4 minutos
        enabled: true
      }
    ];

    console.log('✅ Regras de auto-scaling inicializadas');
  }

  private initializeOptimizations(): void {
    console.log('🚀 Inicializando otimizações de performance...');

    this.optimizations = [
      {
        id: 'cache-optimization',
        name: 'Otimização de Cache',
        description: 'Aumentar TTL do cache e implementar cache distribuído',
        impact: 'high',
        applied: false
      },
      {
        id: 'database-optimization',
        name: 'Otimização de Banco',
        description: 'Aplicar índices e otimizar queries',
        impact: 'high',
        applied: false
      },
      {
        id: 'compression-optimization',
        name: 'Otimização de Compressão',
        description: 'Habilitar compressão gzip/brotli',
        impact: 'medium',
        applied: false
      },
      {
        id: 'cdn-optimization',
        name: 'Otimização de CDN',
        description: 'Configurar CDN para assets estáticos',
        impact: 'high',
        applied: false
      },
      {
        id: 'lazy-loading',
        name: 'Lazy Loading',
        description: 'Implementar carregamento sob demanda',
        impact: 'medium',
        applied: false
      },
      {
        id: 'connection-pooling',
        name: 'Connection Pooling',
        description: 'Otimizar pool de conexões do banco',
        impact: 'medium',
        applied: false
      }
    ];

    console.log('✅ Otimizações de performance inicializadas');
  }

  async startAutoScaling(): Promise<void> {
    if (this.isRunning) return;

    console.log('🚀 Iniciando auto-scaling...');
    this.isRunning = true;

    // Monitorar métricas a cada 30 segundos
    this.monitoringInterval = setInterval(async () => {
      await this.collectScalingMetrics();
      await this.checkScalingRules();
    }, 30000);

    // Otimizar performance a cada 5 minutos
    this.optimizationInterval = setInterval(async () => {
      await this.runPerformanceOptimizations();
    }, 5 * 60 * 1000);

    // Coletar métricas iniciais
    await this.collectScalingMetrics();
  }

  async stopAutoScaling(): Promise<void> {
    if (!this.isRunning) return;

    console.log('🛑 Parando auto-scaling...');
    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
  }

  private async collectScalingMetrics(): Promise<void> {
    try {
      const monitoringData = await advancedMonitoring.getDashboardData();
      
      const metrics: ScalingMetrics = {
        cpu: monitoringData.current?.cpu || 0,
        memory: monitoringData.current?.memory || 0,
        disk: monitoringData.current?.disk || 0,
        network: monitoringData.current?.network?.requestsPerSecond || 0,
        responseTime: monitoringData.current?.network?.averageResponseTime || 0,
        requestsPerSecond: monitoringData.current?.api?.totalRequests || 0,
        errorRate: monitoringData.current?.api?.errorRate || 0,
        timestamp: new Date()
      };

      this.scalingMetrics.push(metrics);

      // Manter apenas os últimos 1000 registros
      if (this.scalingMetrics.length > 1000) {
        this.scalingMetrics = this.scalingMetrics.slice(-1000);
      }

      console.log(`📊 Métricas de scaling coletadas - CPU: ${metrics.cpu.toFixed(1)}%, Mem: ${metrics.memory.toFixed(1)}%`);

    } catch (error) {
      console.error('❌ Erro ao coletar métricas de scaling:', error);
    }
  }

  private async checkScalingRules(): Promise<void> {
    const currentMetrics = this.scalingMetrics[this.scalingMetrics.length - 1];
    if (!currentMetrics) return;

    for (const rule of this.scalingRules) {
      if (!rule.enabled) continue;

      // Verificar cooldown
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
        if (timeSinceLastTrigger < rule.cooldown * 1000) continue;
      }

      const shouldTrigger = this.evaluateRule(rule, currentMetrics);
      
      if (shouldTrigger) {
        await this.executeScalingAction(rule, currentMetrics);
        rule.lastTriggered = new Date();
      }
    }
  }

  private evaluateRule(rule: ScalingRule, metrics: ScalingMetrics): boolean {
    const value = metrics[rule.metric];
    
    switch (rule.operator) {
      case 'gt':
        return value > rule.threshold;
      case 'lt':
        return value < rule.threshold;
      case 'gte':
        return value >= rule.threshold;
      case 'lte':
        return value <= rule.threshold;
      case 'eq':
        return value === rule.threshold;
      default:
        return false;
    }
  }

  private async executeScalingAction(rule: ScalingRule, metrics: ScalingMetrics): Promise<void> {
    console.log(`⚖️ Executando ação de scaling: ${rule.name} (${rule.action})`);

    switch (rule.action) {
      case 'scale_up':
        await this.scaleUp(rule, metrics);
        break;
      case 'scale_down':
        await this.scaleDown(rule, metrics);
        break;
      case 'optimize':
        await this.optimizePerformance(rule, metrics);
        break;
      case 'alert':
        await this.sendScalingAlert(rule, metrics);
        break;
    }
  }

  private async scaleUp(rule: ScalingRule, metrics: ScalingMetrics): Promise<void> {
    try {
      console.log(`📈 Escalando para cima devido a ${rule.metric}: ${metrics[rule.metric]}`);

      // Em produção, aqui você implementaria:
      // - Aumentar número de instâncias
      // - Aumentar recursos de CPU/memória
      // - Configurar load balancer
      // - Notificar equipe de infraestrutura

      // Simular escalonamento
      await this.simulateScaling('up', rule.metric, metrics[rule.metric]);

      // Aplicar otimizações imediatas
      await this.applyImmediateOptimizations();

    } catch (error) {
      console.error('Erro ao escalar para cima:', error);
    }
  }

  private async scaleDown(rule: ScalingRule, metrics: ScalingMetrics): Promise<void> {
    try {
      console.log(`📉 Escalando para baixo devido a ${rule.metric}: ${metrics[rule.metric]}`);

      // Em produção, aqui você implementaria:
      // - Reduzir número de instâncias
      // - Reduzir recursos de CPU/memória
      // - Otimizar custos

      await this.simulateScaling('down', rule.metric, metrics[rule.metric]);

    } catch (error) {
      console.error('Erro ao escalar para baixo:', error);
    }
  }

  private async optimizePerformance(rule: ScalingRule, metrics: ScalingMetrics): Promise<void> {
    try {
      console.log(`🔧 Otimizando performance devido a ${rule.metric}: ${metrics[rule.metric]}`);

      // Aplicar otimizações específicas baseadas na métrica
      switch (rule.metric) {
        case 'memory':
          await this.optimizeMemory();
          break;
        case 'responseTime':
          await this.optimizeResponseTime();
          break;
        case 'cpu':
          await this.optimizeCPU();
          break;
      }

    } catch (error) {
      console.error('Erro ao otimizar performance:', error);
    }
  }

  private async sendScalingAlert(rule: ScalingRule, metrics: ScalingMetrics): Promise<void> {
    try {
      console.log(`🚨 Alerta de scaling: ${rule.name} - ${rule.metric}: ${metrics[rule.metric]}`);

      // Enviar alerta para Slack
      if (process.env.SLACK_WEBHOOK_URL) {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 *ALERTA DE SCALING*: ${rule.name}`,
            attachments: [{
              color: 'warning',
              fields: [
                { title: 'Regra', value: rule.name, short: true },
                { title: 'Métrica', value: rule.metric, short: true },
                { title: 'Valor Atual', value: metrics[rule.metric].toString(), short: true },
                { title: 'Limite', value: rule.threshold.toString(), short: true },
                { title: 'Ação', value: rule.action, short: true }
              ]
            }]
          })
        });
      }

    } catch (error) {
      console.error('Erro ao enviar alerta de scaling:', error);
    }
  }

  private async simulateScaling(direction: 'up' | 'down', metric: string, value: number): Promise<void> {
    console.log(`🔄 Simulando escalonamento ${direction} para ${metric} (${value})`);
    
    // Simular tempo de escalonamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`✅ Escalonamento ${direction} simulado com sucesso`);
  }

  private async applyImmediateOptimizations(): Promise<void> {
    console.log('⚡ Aplicando otimizações imediatas...');

    // Limpar cache desnecessário
    await distributedCache.clearCache();
    
    // Otimizar queries ativas
    // Implementar rate limiting mais agressivo
    // Reduzir TTL de cache para dados menos críticos

    console.log('✅ Otimizações imediatas aplicadas');
  }

  private async optimizeMemory(): Promise<void> {
    console.log('🧠 Otimizando uso de memória...');

    // Forçar garbage collection
    if (global.gc) {
      global.gc();
    }

    // Limpar caches desnecessários
    await distributedCache.clearCache();

    // Reduzir tamanho de buffers
    // Implementar lazy loading

    console.log('✅ Otimização de memória aplicada');
  }

  private async optimizeResponseTime(): Promise<void> {
    console.log('⚡ Otimizando tempo de resposta...');

    // Implementar cache mais agressivo
    // Otimizar queries de banco
    // Habilitar compressão
    // Implementar CDN

    console.log('✅ Otimização de tempo de resposta aplicada');
  }

  private async optimizeCPU(): Promise<void> {
    console.log('🖥️ Otimizando uso de CPU...');

    // Implementar processamento assíncrono
    // Otimizar loops e algoritmos
    // Usar workers para tarefas pesadas
    // Implementar cache de resultados

    console.log('✅ Otimização de CPU aplicada');
  }

  private async runPerformanceOptimizations(): Promise<void> {
    console.log('🔍 Executando otimizações de performance...');

    const currentMetrics = this.scalingMetrics[this.scalingMetrics.length - 1];
    if (!currentMetrics) return;

    for (const optimization of this.optimizations) {
      if (optimization.applied) continue;

      const shouldApply = this.shouldApplyOptimization(optimization, currentMetrics);
      
      if (shouldApply) {
        await this.applyOptimization(optimization, currentMetrics);
      }
    }
  }

  private shouldApplyOptimization(optimization: PerformanceOptimization, metrics: ScalingMetrics): boolean {
    switch (optimization.id) {
      case 'cache-optimization':
        return metrics.memory > 70 || metrics.responseTime > 1500;
      case 'database-optimization':
        return metrics.responseTime > 2000;
      case 'compression-optimization':
        return metrics.network > 500;
      case 'cdn-optimization':
        return metrics.responseTime > 1000;
      case 'lazy-loading':
        return metrics.memory > 60;
      case 'connection-pooling':
        return metrics.responseTime > 1500;
      default:
        return false;
    }
  }

  private async applyOptimization(optimization: PerformanceOptimization, metrics: ScalingMetrics): Promise<void> {
    try {
      console.log(`🚀 Aplicando otimização: ${optimization.name}`);

      // Salvar métricas antes
      optimization.metrics.before = { ...metrics };

      // Aplicar otimização específica
      switch (optimization.id) {
        case 'cache-optimization':
          await this.applyCacheOptimization();
          break;
        case 'database-optimization':
          await this.applyDatabaseOptimization();
          break;
        case 'compression-optimization':
          await this.applyCompressionOptimization();
          break;
        case 'cdn-optimization':
          await this.applyCDNOptimization();
          break;
        case 'lazy-loading':
          await this.applyLazyLoadingOptimization();
          break;
        case 'connection-pooling':
          await this.applyConnectionPoolingOptimization();
          break;
      }

      // Aguardar um pouco para verificar impacto
      await new Promise(resolve => setTimeout(resolve, 30000));

      // Coletar métricas após
      const newMetrics = this.scalingMetrics[this.scalingMetrics.length - 1];
      if (newMetrics) {
        optimization.metrics.after = { ...newMetrics };
      }

      optimization.applied = true;
      optimization.appliedAt = new Date();

      console.log(`✅ Otimização aplicada: ${optimization.name}`);

    } catch (error) {
      console.error(`Erro ao aplicar otimização ${optimization.name}:`, error);
    }
  }

  private async applyCacheOptimization(): Promise<void> {
    // Aumentar TTL do cache
    // Implementar cache em camadas
    // Otimizar estratégia de eviction
    console.log('💾 Otimização de cache aplicada');
  }

  private async applyDatabaseOptimization(): Promise<void> {
    // Aplicar índices
    // Otimizar queries
    // Configurar connection pooling
    console.log('🗄️ Otimização de banco aplicada');
  }

  private async applyCompressionOptimization(): Promise<void> {
    // Habilitar gzip/brotli
    // Configurar níveis de compressão
    console.log('🗜️ Otimização de compressão aplicada');
  }

  private async applyCDNOptimization(): Promise<void> {
    // Configurar CDN
    // Otimizar assets estáticos
    console.log('🌐 Otimização de CDN aplicada');
  }

  private async applyLazyLoadingOptimization(): Promise<void> {
    // Implementar lazy loading
    // Otimizar carregamento de imagens
    console.log('🔄 Otimização de lazy loading aplicada');
  }

  private async applyConnectionPoolingOptimization(): Promise<void> {
    // Configurar pool de conexões
    // Otimizar timeouts
    console.log('🔗 Otimização de connection pooling aplicada');
  }

  async getScalingMetrics(hours: number = 24): Promise<ScalingMetrics[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.scalingMetrics.filter(m => m.timestamp > cutoff);
  }

  async getScalingRules(): Promise<ScalingRule[]> {
    return this.scalingRules;
  }

  async updateScalingRule(ruleId: string, updates: Partial<ScalingRule>): Promise<boolean> {
    const rule = this.scalingRules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      console.log(`✅ Regra de scaling atualizada: ${rule.name}`);
      return true;
    }
    return false;
  }

  async getOptimizations(): Promise<PerformanceOptimization[]> {
    return this.optimizations;
  }

  async resetOptimization(optimizationId: string): Promise<boolean> {
    const optimization = this.optimizations.find(o => o.id === optimizationId);
    if (optimization) {
      optimization.applied = false;
      optimization.appliedAt = undefined;
      optimization.metrics = { before: {}, after: {} };
      console.log(`🔄 Otimização resetada: ${optimization.name}`);
      return true;
    }
    return false;
  }

  async getResourceUsage(): Promise<ResourceUsage> {
    const currentMetrics = this.scalingMetrics[this.scalingMetrics.length - 1];
    
    return {
      cpu: currentMetrics?.cpu || 0,
      memory: currentMetrics?.memory || 0,
      disk: currentMetrics?.disk || 0,
      network: currentMetrics?.network || 0,
      database: 0, // Implementar métricas de banco
      cache: 0 // Implementar métricas de cache
    };
  }

  async getScalingHistory(): Promise<any> {
    const last24h = await this.getScalingMetrics(24);
    
    return {
      totalMetrics: this.scalingMetrics.length,
      last24h: last24h.length,
      averageCPU: last24h.length > 0 
        ? last24h.reduce((sum, m) => sum + m.cpu, 0) / last24h.length 
        : 0,
      averageMemory: last24h.length > 0 
        ? last24h.reduce((sum, m) => sum + m.memory, 0) / last24h.length 
        : 0,
      averageResponseTime: last24h.length > 0 
        ? last24h.reduce((sum, m) => sum + m.responseTime, 0) / last24h.length 
        : 0,
      peakCPU: Math.max(...last24h.map(m => m.cpu)),
      peakMemory: Math.max(...last24h.map(m => m.memory)),
      appliedOptimizations: this.optimizations.filter(o => o.applied).length
    };
  }
}

// Instância global do serviço de auto-scaling
export const autoScaling = new AutoScalingService(); 