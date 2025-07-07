import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

const prisma = new PrismaClient();

interface QueryMetrics {
  query: string;
  executionTime: number;
  timestamp: Date;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  rowsAffected?: number;
}

interface DatabaseIndex {
  table: string;
  columns: string[];
  type: 'BTREE' | 'HASH' | 'GIN' | 'GIST';
  unique: boolean;
  description: string;
}

export class DatabaseOptimizationService {
  private queryMetrics: QueryMetrics[] = [];
  private slowQueryThreshold = 1000; // 1 segundo

  constructor() {
    this.initializeIndexes();
    this.startQueryMonitoring();
  }

  private async initializeIndexes(): Promise<void> {
    console.log('🔧 Inicializando índices de otimização...');

    // Índices para tabela Users
    await this.createIndexIfNotExists('users', ['email'], 'BTREE', true, 'Índice único para email');
    await this.createIndexIfNotExists('users', ['role'], 'BTREE', false, 'Índice para role');
    await this.createIndexIfNotExists('users', ['createdAt'], 'BTREE', false, 'Índice para data de criação');
    await this.createIndexIfNotExists('users', ['gamificationPoints'], 'BTREE', false, 'Índice para pontos de gamificação');

    // Índices para tabela Hotels
    await this.createIndexIfNotExists('hotels', ['name'], 'BTREE', false, 'Índice para nome do hotel');
    await this.createIndexIfNotExists('hotels', ['price'], 'BTREE', false, 'Índice para preço');
    await this.createIndexIfNotExists('hotels', ['rating'], 'BTREE', false, 'Índice para avaliação');
    await this.createIndexIfNotExists('hotels', ['active'], 'BTREE', false, 'Índice para status ativo');

    // Índices para tabela Reservations
    await this.createIndexIfNotExists('reservations', ['userId'], 'BTREE', false, 'Índice para usuário');
    await this.createIndexIfNotExists('reservations', ['hotelId'], 'BTREE', false, 'Índice para hotel');
    await this.createIndexIfNotExists('reservations', ['status'], 'BTREE', false, 'Índice para status');
    await this.createIndexIfNotExists('reservations', ['checkIn'], 'BTREE', false, 'Índice para check-in');
    await this.createIndexIfNotExists('reservations', ['checkOut'], 'BTREE', false, 'Índice para check-out');
    await this.createIndexIfNotExists('reservations', ['createdAt'], 'BTREE', false, 'Índice para data de criação');

    // Índices compostos
    await this.createCompositeIndex('reservations', ['userId', 'status'], 'BTREE', false, 'Índice composto usuário-status');
    await this.createCompositeIndex('reservations', ['hotelId', 'checkIn'], 'BTREE', false, 'Índice composto hotel-checkin');

    // Índices para tabela Payments
    await this.createIndexIfNotExists('payments', ['userId'], 'BTREE', false, 'Índice para usuário');
    await this.createIndexIfNotExists('payments', ['status'], 'BTREE', false, 'Índice para status');
    await this.createIndexIfNotExists('payments', ['createdAt'], 'BTREE', false, 'Índice para data de criação');

    // Índices para tabela Reviews
    await this.createIndexIfNotExists('reviews', ['hotelId'], 'BTREE', false, 'Índice para hotel');
    await this.createIndexIfNotExists('reviews', ['rating'], 'BTREE', false, 'Índice para avaliação');
    await this.createIndexIfNotExists('reviews', ['createdAt'], 'BTREE', false, 'Índice para data de criação');

    // Índices para tabela Attractions
    await this.createIndexIfNotExists('attractions', ['name'], 'BTREE', false, 'Índice para nome da atração');
    await this.createIndexIfNotExists('attractions', ['category'], 'BTREE', false, 'Índice para categoria');
    await this.createIndexIfNotExists('attractions', ['price'], 'BTREE', false, 'Índice para preço');

    // Índices para tabela Tickets
    await this.createIndexIfNotExists('tickets', ['attractionId'], 'BTREE', false, 'Índice para atração');
    await this.createIndexIfNotExists('tickets', ['date'], 'BTREE', false, 'Índice para data');
    await this.createIndexIfNotExists('tickets', ['availableTickets'], 'BTREE', false, 'Índice para tickets disponíveis');

    // Índices para tabela Promotions
    await this.createIndexIfNotExists('promotions', ['code'], 'BTREE', true, 'Índice único para código');
    await this.createIndexIfNotExists('promotions', ['status'], 'BTREE', false, 'Índice para status');
    await this.createIndexIfNotExists('promotions', ['validFrom'], 'BTREE', false, 'Índice para data de início');
    await this.createIndexIfNotExists('promotions', ['validUntil'], 'BTREE', false, 'Índice para data de fim');

    console.log('✅ Índices inicializados com sucesso');
  }

  private async createIndexIfNotExists(
    table: string,
    columns: string[],
    type: string,
    unique: boolean,
    description: string
  ): Promise<void> {
    try {
      const indexName = `idx_${table}_${columns.join('_')}`;
      const columnsStr = columns.join(', ');
      const uniqueStr = unique ? 'UNIQUE' : '';
      
      await prisma.$executeRawUnsafe(`
        CREATE ${uniqueStr} INDEX IF NOT EXISTS ${indexName} 
        ON ${table} USING ${type} (${columnsStr})
      `);

      console.log(`📊 Índice criado: ${indexName} - ${description}`);
    } catch (error) {
      console.error(`❌ Erro ao criar índice para ${table}:`, error);
    }
  }

  private async createCompositeIndex(
    table: string,
    columns: string[],
    type: string,
    unique: boolean,
    description: string
  ): Promise<void> {
    try {
      const indexName = `idx_${table}_composite_${columns.join('_')}`;
      const columnsStr = columns.join(', ');
      const uniqueStr = unique ? 'UNIQUE' : '';
      
      await prisma.$executeRawUnsafe(`
        CREATE ${uniqueStr} INDEX IF NOT EXISTS ${indexName} 
        ON ${table} USING ${type} (${columnsStr})
      `);

      console.log(`📊 Índice composto criado: ${indexName} - ${description}`);
    } catch (error) {
      console.error(`❌ Erro ao criar índice composto para ${table}:`, error);
    }
  }

  async optimizeQueries(): Promise<void> {
    console.log('🔧 Otimizando queries...');

    // Analisar queries lentas
    const slowQueries = this.queryMetrics.filter(q => q.executionTime > this.slowQueryThreshold);
    
    if (slowQueries.length > 0) {
      console.log(`🐌 Encontradas ${slowQueries.length} queries lentas:`);
      
      for (const query of slowQueries.slice(0, 10)) { // Top 10 mais lentas
        console.log(`  - ${query.query.substring(0, 100)}... (${query.executionTime}ms)`);
      }
    }

    // Sugerir otimizações
    await this.suggestOptimizations();
  }

  private async suggestOptimizations(): Promise<void> {
    const suggestions = [
      {
        type: 'index',
        table: 'reservations',
        columns: ['userId', 'createdAt'],
        reason: 'Queries frequentes por usuário e data'
      },
      {
        type: 'index',
        table: 'payments',
        columns: ['status', 'createdAt'],
        reason: 'Filtros comuns por status e data'
      },
      {
        type: 'partition',
        table: 'audit_logs',
        strategy: 'by_month',
        reason: 'Tabela grande com dados históricos'
      }
    ];

    console.log('💡 Sugestões de otimização:');
    for (const suggestion of suggestions) {
      console.log(`  - ${suggestion.type.toUpperCase()}: ${suggestion.reason}`);
    }
  }

  async analyzeTablePerformance(): Promise<any> {
    const tables = [
      'users', 'hotels', 'reservations', 'payments', 
      'reviews', 'attractions', 'tickets', 'promotions'
    ];

    const analysis = {};

    for (const table of tables) {
      try {
        // Contar registros
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
        
        // Tamanho da tabela
        const size = await prisma.$queryRawUnsafe(`
          SELECT pg_size_pretty(pg_total_relation_size('${table}')) as size
        `);

        // Índices
        const indexes = await prisma.$queryRawUnsafe(`
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename = '${table}'
        `);

        analysis[table] = {
          count: count[0]?.count || 0,
          size: size[0]?.size || 'N/A',
          indexes: indexes.length
        };
      } catch (error) {
        console.error(`Erro ao analisar tabela ${table}:`, error);
      }
    }

    return analysis;
  }

  async vacuumAndAnalyze(): Promise<void> {
    console.log('🧹 Executando VACUUM e ANALYZE...');

    try {
      // VACUUM para limpar espaço não utilizado
      await prisma.$executeRawUnsafe('VACUUM ANALYZE');
      
      // Atualizar estatísticas
      await prisma.$executeRawUnsafe('ANALYZE');
      
      console.log('✅ VACUUM e ANALYZE concluídos');
    } catch (error) {
      console.error('❌ Erro ao executar VACUUM/ANALYZE:', error);
    }
  }

  async monitorQuery(query: string, table: string, operation: string): Promise<number> {
    const startTime = performance.now();
    
    try {
      // Executar query
      const result = await prisma.$queryRawUnsafe(query);
      
      const executionTime = performance.now() - startTime;
      
      // Registrar métricas
      this.queryMetrics.push({
        query,
        executionTime,
        timestamp: new Date(),
        table,
        operation: operation as any,
        rowsAffected: Array.isArray(result) ? result.length : undefined
      });

      // Alertar se query for lenta
      if (executionTime > this.slowQueryThreshold) {
        console.warn(`🐌 Query lenta detectada: ${executionTime.toFixed(2)}ms`);
        console.warn(`   Query: ${query.substring(0, 100)}...`);
      }

      return executionTime;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      console.error(`❌ Erro na query: ${error}`);
      return executionTime;
    }
  }

  private startQueryMonitoring(): void {
    // Monitorar queries a cada 5 minutos
    setInterval(() => {
      this.analyzeQueryPerformance();
    }, 5 * 60 * 1000);

    console.log('📊 Monitoramento de queries iniciado');
  }

  private async analyzeQueryPerformance(): Promise<void> {
    const recentQueries = this.queryMetrics.filter(
      q => q.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Última hora
    );

    if (recentQueries.length === 0) return;

    const avgExecutionTime = recentQueries.reduce((sum, q) => sum + q.executionTime, 0) / recentQueries.length;
    const slowQueries = recentQueries.filter(q => q.executionTime > this.slowQueryThreshold);

    console.log(`📈 Performance das queries (última hora):`);
    console.log(`  - Total de queries: ${recentQueries.length}`);
    console.log(`  - Tempo médio: ${avgExecutionTime.toFixed(2)}ms`);
    console.log(`  - Queries lentas: ${slowQueries.length}`);

    if (slowQueries.length > 0) {
      console.log('🐌 Queries lentas detectadas:');
      slowQueries.slice(0, 5).forEach(q => {
        console.log(`  - ${q.table}: ${q.executionTime.toFixed(2)}ms`);
      });
    }
  }

  async getQueryMetrics(hours: number = 24): Promise<QueryMetrics[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.queryMetrics.filter(q => q.timestamp > cutoff);
  }

  async getSlowQueries(): Promise<QueryMetrics[]> {
    return this.queryMetrics.filter(q => q.executionTime > this.slowQueryThreshold);
  }

  async clearQueryMetrics(): Promise<void> {
    this.queryMetrics = [];
    console.log('🗑️ Métricas de queries limpas');
  }

  async generateQueryReport(): Promise<any> {
    const last24h = await this.getQueryMetrics(24);
    const slowQueries = await this.getSlowQueries();
    const tableAnalysis = await this.analyzeTablePerformance();

    return {
      totalQueries: last24h.length,
      averageExecutionTime: last24h.length > 0 
        ? last24h.reduce((sum, q) => sum + q.executionTime, 0) / last24h.length 
        : 0,
      slowQueries: slowQueries.length,
      tablePerformance: tableAnalysis,
      recommendations: await this.generateRecommendations()
    };
  }

  private async generateRecommendations(): Promise<string[]> {
    const recommendations = [];

    const slowQueries = await this.getSlowQueries();
    if (slowQueries.length > 10) {
      recommendations.push('Considerar otimização de índices para queries frequentes');
    }

    const tableAnalysis = await this.analyzeTablePerformance();
    for (const [table, data] of Object.entries(tableAnalysis)) {
      if (data.count > 10000 && data.indexes < 3) {
        recommendations.push(`Adicionar índices para tabela ${table} (${data.count} registros)`);
      }
    }

    return recommendations;
  }
}

// Instância global do serviço
export const dbOptimization = new DatabaseOptimizationService(); 