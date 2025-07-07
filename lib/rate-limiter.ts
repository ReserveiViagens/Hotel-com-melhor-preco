import { redis } from './cache';

export interface RateLimitConfig {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Máximo de requisições por janela
  keyGenerator?: (req: any) => string; // Função para gerar chave única
  skipSuccessfulRequests?: boolean; // Pular requisições bem-sucedidas
  skipFailedRequests?: boolean; // Pular requisições com falha
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    };
  }

  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Obter requisições na janela atual
      const requests = await redis.zrangebyscore(key, windowStart, '+inf');
      
      if (requests.length >= this.config.maxRequests) {
        // Rate limit excedido
        const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldestRequest.length > 0 
          ? parseInt(oldestRequest[1]) + this.config.windowMs 
          : now + this.config.windowMs;
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime - now) / 1000)
        };
      }

      // Adicionar nova requisição
      await redis.zadd(key, now, now.toString());
      await redis.expire(key, Math.ceil(this.config.windowMs / 1000));

      return {
        allowed: true,
        remaining: this.config.maxRequests - requests.length - 1,
        resetTime: now + this.config.windowMs
      };
    } catch (error) {
      console.error('Erro no rate limiting:', error);
      // Em caso de erro, permitir a requisição
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      };
    }
  }

  async resetLimit(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`;
    await redis.del(key);
  }

  async getLimitInfo(identifier: string): Promise<{
    current: number;
    remaining: number;
    resetTime: number;
  }> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      const requests = await redis.zrangebyscore(key, windowStart, '+inf');
      const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldestRequest.length > 0 
        ? parseInt(oldestRequest[1]) + this.config.windowMs 
        : now + this.config.windowMs;

      return {
        current: requests.length,
        remaining: Math.max(0, this.config.maxRequests - requests.length),
        resetTime
      };
    } catch (error) {
      console.error('Erro ao obter info do rate limit:', error);
      return {
        current: 0,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      };
    }
  }
}

// Configurações predefinidas
export const rateLimiters = {
  // Rate limit para APIs de gamificação
  gamification: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 30, // 30 requisições por minuto
  }),

  // Rate limit para missões
  missions: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20, // 20 requisições por minuto
  }),

  // Rate limit para eventos
  events: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 15, // 15 requisições por minuto
  }),

  // Rate limit para autenticação
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 tentativas por 15 minutos
  }),

  // Rate limit geral para APIs
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 requisições por minuto
  }),
}; 