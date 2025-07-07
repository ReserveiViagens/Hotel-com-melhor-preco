import Redis from 'ioredis';
import { performance } from 'perf_hooks';

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  defaultTTL: number;
  maxRetries: number;
  retryDelay: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  totalRequests: number;
}

interface CacheKey {
  key: string;
  ttl: number;
  createdAt: Date;
  lastAccess: Date;
  accessCount: number;
}

export class DistributedCacheService {
  private redis: Redis;
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cacheKeys: Map<string, CacheKey> = new Map();
  private isConnected: boolean = false;

  constructor(config: CacheConfig) {
    this.config = config;
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalRequests: 0
    };

    this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      this.redis = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db,
        keyPrefix: this.config.keyPrefix,
        retryDelayOnFailover: this.config.retryDelay,
        maxRetriesPerRequest: this.config.maxRetries,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
        enableOfflineQueue: false,
        maxLoadingTimeout: 10000,
        enableReadyCheck: true,
        autoResubscribe: true,
        autoResendUnfulfilledCommands: true,
        lazyConnect: true,
        showFriendlyErrorStack: process.env.NODE_ENV === 'development'
      });

      this.redis.on('connect', () => {
        console.log('🔗 Conectado ao Redis');
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        console.log('✅ Redis pronto para uso');
      });

      this.redis.on('error', (error) => {
        console.error('❌ Erro no Redis:', error);
        this.isConnected = false;
        this.metrics.errors++;
      });

      this.redis.on('close', () => {
        console.log('🔌 Conexão com Redis fechada');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Reconectando ao Redis...');
      });

      // Conectar ao Redis
      this.redis.connect();

    } catch (error) {
      console.error('❌ Erro ao inicializar Redis:', error);
      this.metrics.errors++;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      console.warn('⚠️ Redis não conectado, retornando null');
      return null;
    }

    const startTime = performance.now();
    this.metrics.totalRequests++;

    try {
      const fullKey = this.getFullKey(key);
      const value = await this.redis.get(fullKey);

      if (value) {
        this.metrics.hits++;
        this.updateKeyMetrics(key, 'hit');
        
        const executionTime = performance.now() - startTime;
        console.log(`✅ Cache HIT: ${key} (${executionTime.toFixed(2)}ms)`);
        
        return JSON.parse(value);
      } else {
        this.metrics.misses++;
        this.updateKeyMetrics(key, 'miss');
        
        const executionTime = performance.now() - startTime;
        console.log(`❌ Cache MISS: ${key} (${executionTime.toFixed(2)}ms)`);
        
        return null;
      }
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Erro ao buscar cache ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('⚠️ Redis não conectado, ignorando set');
      return false;
    }

    const startTime = performance.now();
    this.metrics.totalRequests++;

    try {
      const fullKey = this.getFullKey(key);
      const serializedValue = JSON.stringify(value);
      const finalTTL = ttl || this.config.defaultTTL;

      await this.redis.setex(fullKey, finalTTL, serializedValue);
      
      this.metrics.sets++;
      this.updateKeyMetrics(key, 'set', finalTTL);
      
      const executionTime = performance.now() - startTime;
      console.log(`💾 Cache SET: ${key} (${executionTime.toFixed(2)}ms)`);
      
      return true;
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Erro ao definir cache ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('⚠️ Redis não conectado, ignorando delete');
      return false;
    }

    try {
      const fullKey = this.getFullKey(key);
      const result = await this.redis.del(fullKey);
      
      this.metrics.deletes++;
      this.cacheKeys.delete(key);
      
      console.log(`🗑️ Cache DELETE: ${key}`);
      return result > 0;
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Erro ao deletar cache ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const fullKey = this.getFullKey(key);
      const result = await this.redis.exists(fullKey);
      return result > 0;
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Erro ao verificar existência de ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const fullKey = this.getFullKey(key);
      const result = await this.redis.expire(fullKey, ttl);
      return result > 0;
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Erro ao definir TTL para ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isConnected) return -1;

    try {
      const fullKey = this.getFullKey(key);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Erro ao obter TTL para ${key}:`, error);
      return -1;
    }
  }

  async increment(key: string, value: number = 1): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const fullKey = this.getFullKey(key);
      return await this.redis.incrby(fullKey, value);
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Erro ao incrementar ${key}:`, error);
      return 0;
    }
  }

  async decrement(key: string, value: number = 1): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const fullKey = this.getFullKey(key);
      return await this.redis.decrby(fullKey, value);
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Erro ao decrementar ${key}:`, error);
      return 0;
    }
  }

  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    
    return value;
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await this.redis.keys(fullPattern);
      
      if (keys.length > 0) {
        const result = await this.redis.del(...keys);
        console.log(`🗑️ Invalidados ${result} chaves com padrão: ${pattern}`);
        return result;
      }
      
      return 0;
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Erro ao invalidar padrão ${pattern}:`, error);
      return 0;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.redis.flushdb();
      this.cacheKeys.clear();
      console.log('🗑️ Cache completamente limpo');
      return true;
    } catch (error) {
      this.metrics.errors++;
      console.error('❌ Erro ao limpar cache:', error);
      return false;
    }
  }

  async getStats(): Promise<any> {
    if (!this.isConnected) {
      return {
        connected: false,
        metrics: this.metrics,
        keys: 0,
        memory: 'N/A',
        info: 'N/A'
      };
    }

    try {
      const info = await this.redis.info();
      const keys = await this.redis.dbsize();
      const memory = await this.redis.memory('USAGE');

      return {
        connected: true,
        metrics: this.metrics,
        keys,
        memory: memory ? `${Math.round(memory / 1024 / 1024)}MB` : 'N/A',
        info: this.parseRedisInfo(info),
        hitRate: this.metrics.totalRequests > 0 
          ? (this.metrics.hits / this.metrics.totalRequests * 100).toFixed(2) + '%'
          : '0%'
      };
    } catch (error) {
      this.metrics.errors++;
      console.error('❌ Erro ao obter estatísticas:', error);
      return {
        connected: false,
        metrics: this.metrics,
        error: error.message
      };
    }
  }

  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}:${key}`;
  }

  private updateKeyMetrics(key: string, operation: 'hit' | 'miss' | 'set', ttl?: number): void {
    const existing = this.cacheKeys.get(key);
    
    if (existing) {
      existing.lastAccess = new Date();
      existing.accessCount++;
    } else if (operation === 'set' && ttl) {
      this.cacheKeys.set(key, {
        key,
        ttl,
        createdAt: new Date(),
        lastAccess: new Date(),
        accessCount: 1
      });
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const parsed: any = {};

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        parsed[key] = value;
      }
    }

    return {
      version: parsed.redis_version,
      uptime: parsed.uptime_in_seconds,
      connectedClients: parsed.connected_clients,
      usedMemory: parsed.used_memory_human,
      totalCommands: parsed.total_commands_processed
    };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('❌ Health check falhou:', error);
      return false;
    }
  }

  async getTopKeys(limit: number = 10): Promise<Array<{key: string, accessCount: number}>> {
    const keys = Array.from(this.cacheKeys.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
      .map(k => ({ key: k.key, accessCount: k.accessCount }));

    return keys;
  }

  async getExpiringKeys(withinMinutes: number = 60): Promise<string[]> {
    const now = new Date();
    const expiringKeys: string[] = [];

    for (const [key, keyData] of this.cacheKeys) {
      const expiresAt = new Date(keyData.createdAt.getTime() + keyData.ttl * 1000);
      const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);
      
      if (minutesUntilExpiry <= withinMinutes && minutesUntilExpiry > 0) {
        expiringKeys.push(key);
      }
    }

    return expiringKeys;
  }

  disconnect(): void {
    if (this.redis) {
      this.redis.disconnect();
      this.isConnected = false;
      console.log('🔌 Desconectado do Redis');
    }
  }
}

// Instância global do cache
export const distributedCache = new DistributedCacheService({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  keyPrefix: 'reservei',
  defaultTTL: 3600, // 1 hora
  maxRetries: 3,
  retryDelay: 1000
}); 