import { PrismaClient } from '@prisma/client';
import { distributedCache } from './distributed-cache';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'suspicious_activity' | 'fraud_detected' | 'rate_limit_exceeded' | 'sql_injection' | 'xss_attempt';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  resolved: boolean;
  resolvedAt?: Date;
}

interface FraudPattern {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'block' | 'flag' | 'monitor' | 'alert';
  enabled: boolean;
}

interface RateLimitRule {
  key: string;
  maxRequests: number;
  windowMs: number;
  action: 'block' | 'throttle' | 'challenge';
  enabled: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  blockedRequests: number;
  fraudDetected: number;
  averageResponseTime: number;
  lastUpdated: Date;
}

export class AdvancedSecurityService {
  private events: SecurityEvent[] = [];
  private fraudPatterns: FraudPattern[] = [];
  private rateLimitRules: RateLimitRule[] = [];
  private metrics: SecurityMetrics;
  private blockedIPs: Set<string> = new Set();
  private suspiciousUsers: Set<string> = new Set();

  constructor() {
    this.initializeSecurity();
    this.metrics = {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      blockedRequests: 0,
      fraudDetected: 0,
      averageResponseTime: 0,
      lastUpdated: new Date()
    };
  }

  private initializeSecurity(): void {
    console.log('🔒 Inicializando sistema de segurança avançada...');

    // Padrões de fraude
    this.fraudPatterns = [
      {
        id: 'sql-injection',
        name: 'SQL Injection',
        description: 'Detecta tentativas de SQL injection',
        pattern: /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(from|into|where|table|database)\b)|('|"|;|--|\/\*|\*\/)/i,
        severity: 'critical',
        action: 'block',
        enabled: true
      },
      {
        id: 'xss-attack',
        name: 'XSS Attack',
        description: 'Detecta tentativas de XSS',
        pattern: /<script|javascript:|onload=|onerror=|onclick=|<iframe|<object|<embed/i,
        severity: 'high',
        action: 'block',
        enabled: true
      },
      {
        id: 'path-traversal',
        name: 'Path Traversal',
        description: 'Detecta tentativas de path traversal',
        pattern: /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i,
        severity: 'high',
        action: 'block',
        enabled: true
      },
      {
        id: 'command-injection',
        name: 'Command Injection',
        description: 'Detecta tentativas de command injection',
        pattern: /(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig)\b)|(\||&|;|`|$\(|>|<)/,
        severity: 'critical',
        action: 'block',
        enabled: true
      },
      {
        id: 'multiple-login-attempts',
        name: 'Multiple Login Attempts',
        description: 'Detecta múltiplas tentativas de login',
        pattern: /login.*failed|invalid.*password|incorrect.*credentials/i,
        severity: 'medium',
        action: 'flag',
        enabled: true
      },
      {
        id: 'suspicious-user-agent',
        name: 'Suspicious User Agent',
        description: 'Detecta user agents suspeitos',
        pattern: /(bot|crawler|spider|scraper|curl|wget|python|java|perl|ruby|php)/i,
        severity: 'low',
        action: 'monitor',
        enabled: true
      }
    ];

    // Regras de rate limiting
    this.rateLimitRules = [
      {
        key: 'login',
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15 minutos
        action: 'block',
        enabled: true
      },
      {
        key: 'api',
        maxRequests: 100,
        windowMs: 60 * 1000, // 1 minuto
        action: 'throttle',
        enabled: true
      },
      {
        key: 'search',
        maxRequests: 20,
        windowMs: 60 * 1000, // 1 minuto
        action: 'throttle',
        enabled: true
      },
      {
        key: 'payment',
        maxRequests: 3,
        windowMs: 5 * 60 * 1000, // 5 minutos
        action: 'challenge',
        enabled: true
      }
    ];

    console.log('✅ Sistema de segurança inicializado');
  }

  async checkRequest(
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    method: string,
    path: string,
    body?: any,
    headers?: any
  ): Promise<{ allowed: boolean; reason?: string; action?: string }> {
    const startTime = performance.now();

    try {
      // Verificar IP bloqueado
      if (this.blockedIPs.has(ipAddress)) {
        await this.recordEvent('blocked_request', userId, ipAddress, userAgent, 'high', {
          reason: 'IP bloqueado',
          method,
          path
        });
        return { allowed: false, reason: 'IP bloqueado', action: 'block' };
      }

      // Verificar usuário suspeito
      if (userId && this.suspiciousUsers.has(userId)) {
        await this.recordEvent('suspicious_user', userId, ipAddress, userAgent, 'medium', {
          reason: 'Usuário marcado como suspeito',
          method,
          path
        });
        return { allowed: true, reason: 'Usuário suspeito', action: 'monitor' };
      }

      // Verificar padrões de fraude
      const fraudCheck = await this.checkFraudPatterns(userId, ipAddress, userAgent, method, path, body, headers);
      if (!fraudCheck.allowed) {
        return fraudCheck;
      }

      // Verificar rate limiting
      const rateLimitCheck = await this.checkRateLimit(userId, ipAddress, method, path);
      if (!rateLimitCheck.allowed) {
        return rateLimitCheck;
      }

      // Verificar comportamento anômalo
      const anomalyCheck = await this.checkAnomaly(userId, ipAddress, userAgent, method, path);
      if (!anomalyCheck.allowed) {
        return anomalyCheck;
      }

      const responseTime = performance.now() - startTime;
      this.updateMetrics('success', responseTime);

      return { allowed: true };

    } catch (error) {
      console.error('Erro na verificação de segurança:', error);
      return { allowed: false, reason: 'Erro interno', action: 'block' };
    }
  }

  private async checkFraudPatterns(
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    method: string,
    path: string,
    body?: any,
    headers?: any
  ): Promise<{ allowed: boolean; reason?: string; action?: string }> {
    const input = JSON.stringify({ method, path, body, headers, userAgent });

    for (const pattern of this.fraudPatterns) {
      if (!pattern.enabled) continue;

      if (pattern.pattern.test(input)) {
        await this.recordEvent('fraud_detected', userId, ipAddress, userAgent, pattern.severity, {
          pattern: pattern.name,
          matched: pattern.pattern.source,
          method,
          path,
          body: body ? JSON.stringify(body).substring(0, 200) : undefined
        });

        if (pattern.action === 'block') {
          this.blockedIPs.add(ipAddress);
          if (userId) this.suspiciousUsers.add(userId);
        }

        return {
          allowed: false,
          reason: `Padrão de fraude detectado: ${pattern.name}`,
          action: pattern.action
        };
      }
    }

    return { allowed: true };
  }

  private async checkRateLimit(
    userId: string | undefined,
    ipAddress: string,
    method: string,
    path: string
  ): Promise<{ allowed: boolean; reason?: string; action?: string }> {
    const key = this.getRateLimitKey(userId, ipAddress, method, path);

    for (const rule of this.rateLimitRules) {
      if (!rule.enabled) continue;

      if (this.matchesRateLimitRule(key, rule)) {
        const currentCount = await this.getRateLimitCount(key, rule.windowMs);
        
        if (currentCount >= rule.maxRequests) {
          await this.recordEvent('rate_limit_exceeded', userId, ipAddress, '', 'medium', {
            rule: rule.key,
            currentCount,
            maxRequests: rule.maxRequests,
            windowMs: rule.windowMs
          });

          if (rule.action === 'block') {
            this.blockedIPs.add(ipAddress);
          }

          return {
            allowed: false,
            reason: `Rate limit excedido: ${rule.key}`,
            action: rule.action
          };
        }

        await this.incrementRateLimit(key, rule.windowMs);
      }
    }

    return { allowed: true };
  }

  private async checkAnomaly(
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    method: string,
    path: string
  ): Promise<{ allowed: boolean; reason?: string; action?: string }> {
    // Verificar horário de acesso
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) {
      await this.recordEvent('suspicious_activity', userId, ipAddress, userAgent, 'low', {
        reason: 'Acesso fora do horário normal',
        hour,
        method,
        path
      });
    }

    // Verificar localização geográfica (simulado)
    const isSuspiciousLocation = await this.checkGeographicAnomaly(ipAddress);
    if (isSuspiciousLocation) {
      await this.recordEvent('suspicious_activity', userId, ipAddress, userAgent, 'medium', {
        reason: 'Localização geográfica suspeita',
        method,
        path
      });
    }

    // Verificar padrão de navegação
    if (userId) {
      const navigationPattern = await this.checkNavigationPattern(userId, path);
      if (navigationPattern.suspicious) {
        await this.recordEvent('suspicious_activity', userId, ipAddress, userAgent, 'medium', {
          reason: 'Padrão de navegação suspeito',
          pattern: navigationPattern.reason,
          method,
          path
        });
      }
    }

    return { allowed: true };
  }

  private async checkGeographicAnomaly(ipAddress: string): Promise<boolean> {
    // Simular verificação de localização
    // Em produção, usar serviço de geolocalização
    const suspiciousCountries = ['XX', 'YY', 'ZZ']; // Códigos de países suspeitos
    const country = await this.getCountryFromIP(ipAddress);
    return suspiciousCountries.includes(country);
  }

  private async getCountryFromIP(ipAddress: string): Promise<string> {
    // Simular geolocalização
    // Em produção, usar serviço como MaxMind ou IP2Location
    return 'BR'; // Brasil por padrão
  }

  private async checkNavigationPattern(userId: string, currentPath: string): Promise<{ suspicious: boolean; reason?: string }> {
    try {
      // Buscar histórico de navegação do usuário
      const navigationHistory = await prisma.userNavigation.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10
      });

      if (navigationHistory.length === 0) {
        return { suspicious: false };
      }

      // Verificar se o usuário está acessando páginas em sequência lógica
      const lastPath = navigationHistory[0]?.path;
      
      // Padrões suspeitos
      const suspiciousPatterns = [
        { from: '/admin', to: '/admin/payments' }, // Acesso direto a pagamentos
        { from: '/login', to: '/admin' }, // Login direto no admin
        { from: '/', to: '/admin' } // Acesso direto ao admin sem login
      ];

      for (const pattern of suspiciousPatterns) {
        if (lastPath === pattern.from && currentPath === pattern.to) {
          return { suspicious: true, reason: 'Sequência de navegação suspeita' };
        }
      }

      return { suspicious: false };
    } catch (error) {
      console.error('Erro ao verificar padrão de navegação:', error);
      return { suspicious: false };
    }
  }

  private getRateLimitKey(userId: string | undefined, ipAddress: string, method: string, path: string): string {
    const baseKey = userId || ipAddress;
    const action = this.getRateLimitAction(method, path);
    return `rate_limit:${action}:${baseKey}`;
  }

  private getRateLimitAction(method: string, path: string): string {
    if (path.includes('/api/auth/login')) return 'login';
    if (path.includes('/api/')) return 'api';
    if (path.includes('/search') || path.includes('/hoteis') || path.includes('/atracoes')) return 'search';
    if (path.includes('/payment') || path.includes('/pagamento')) return 'payment';
    return 'general';
  }

  private matchesRateLimitRule(key: string, rule: RateLimitRule): boolean {
    return key.includes(rule.key);
  }

  private async getRateLimitCount(key: string, windowMs: number): Promise<number> {
    try {
      const count = await distributedCache.get<number>(key);
      return count || 0;
    } catch (error) {
      console.error('Erro ao obter contador de rate limit:', error);
      return 0;
    }
  }

  private async incrementRateLimit(key: string, windowMs: number): Promise<void> {
    try {
      const currentCount = await this.getRateLimitCount(key, windowMs);
      await distributedCache.set(key, currentCount + 1, Math.ceil(windowMs / 1000));
    } catch (error) {
      console.error('Erro ao incrementar rate limit:', error);
    }
  }

  private async recordEvent(
    type: string,
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: any
  ): Promise<void> {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type: type as any,
      userId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      severity,
      details,
      resolved: false
    };

    this.events.push(event);
    this.updateMetrics(type, 0);

    // Alertar para eventos críticos
    if (severity === 'critical') {
      await this.sendSecurityAlert(event);
    }

    // Salvar no banco de dados
    try {
      await prisma.securityEvent.create({
        data: {
          id: event.id,
          type: event.type,
          userId: event.userId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          severity: event.severity,
          details: event.details,
          timestamp: event.timestamp
        }
      });
    } catch (error) {
      console.error('Erro ao salvar evento de segurança:', error);
    }
  }

  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      console.log(`🚨 ALERTA DE SEGURANÇA CRÍTICA: ${event.type}`);
      console.log(`   IP: ${event.ipAddress}`);
      console.log(`   Usuário: ${event.userId || 'N/A'}`);
      console.log(`   Detalhes: ${JSON.stringify(event.details)}`);

      // Enviar para Slack
      if (process.env.SLACK_WEBHOOK_URL) {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 *ALERTA DE SEGURANÇA CRÍTICA*`,
            attachments: [{
              color: 'danger',
              fields: [
                { title: 'Tipo', value: event.type, short: true },
                { title: 'Severidade', value: event.severity, short: true },
                { title: 'IP', value: event.ipAddress, short: true },
                { title: 'Usuário', value: event.userId || 'N/A', short: true },
                { title: 'Timestamp', value: event.timestamp.toISOString(), short: true },
                { title: 'Detalhes', value: JSON.stringify(event.details, null, 2), short: false }
              ]
            }]
          })
        });
      }
    } catch (error) {
      console.error('Erro ao enviar alerta de segurança:', error);
    }
  }

  private updateMetrics(type: string, responseTime: number): void {
    this.metrics.totalEvents++;
    this.metrics.eventsByType[type] = (this.metrics.eventsByType[type] || 0) + 1;
    this.metrics.lastUpdated = new Date();

    if (responseTime > 0) {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime + responseTime) / 2;
    }
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    // Atualizar métricas com dados do banco
    try {
      const totalEvents = await prisma.securityEvent.count();
      const eventsByType = await prisma.securityEvent.groupBy({
        by: ['type'],
        _count: { type: true }
      });
      const eventsBySeverity = await prisma.securityEvent.groupBy({
        by: ['severity'],
        _count: { severity: true }
      });

      this.metrics.totalEvents = totalEvents;
      this.metrics.eventsByType = {};
      this.metrics.eventsBySeverity = {};

      for (const event of eventsByType) {
        this.metrics.eventsByType[event.type] = event._count.type;
      }

      for (const event of eventsBySeverity) {
        this.metrics.eventsBySeverity[event.severity] = event._count.severity;
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas de segurança:', error);
    }

    return this.metrics;
  }

  async getSecurityEvents(
    limit: number = 100,
    severity?: string,
    resolved?: boolean
  ): Promise<SecurityEvent[]> {
    try {
      const where: any = {};
      if (severity) where.severity = severity;
      if (resolved !== undefined) where.resolved = resolved;

      const events = await prisma.securityEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return events.map(event => ({
        id: event.id,
        type: event.type as any,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: event.timestamp,
        severity: event.severity as any,
        details: event.details,
        resolved: event.resolved,
        resolvedAt: event.resolvedAt
      }));
    } catch (error) {
      console.error('Erro ao buscar eventos de segurança:', error);
      return [];
    }
  }

  async resolveEvent(eventId: string): Promise<boolean> {
    try {
      await prisma.securityEvent.update({
        where: { id: eventId },
        data: {
          resolved: true,
          resolvedAt: new Date()
        }
      });

      const event = this.events.find(e => e.id === eventId);
      if (event) {
        event.resolved = true;
        event.resolvedAt = new Date();
      }

      return true;
    } catch (error) {
      console.error('Erro ao resolver evento:', error);
      return false;
    }
  }

  async unblockIP(ipAddress: string): Promise<boolean> {
    this.blockedIPs.delete(ipAddress);
    console.log(`✅ IP ${ipAddress} desbloqueado`);
    return true;
  }

  async removeSuspiciousUser(userId: string): Promise<boolean> {
    this.suspiciousUsers.delete(userId);
    console.log(`✅ Usuário ${userId} removido da lista de suspeitos`);
    return true;
  }

  async getBlockedIPs(): Promise<string[]> {
    return Array.from(this.blockedIPs);
  }

  async getSuspiciousUsers(): Promise<string[]> {
    return Array.from(this.suspiciousUsers);
  }

  async addFraudPattern(pattern: FraudPattern): Promise<void> {
    this.fraudPatterns.push(pattern);
    console.log(`✅ Padrão de fraude adicionado: ${pattern.name}`);
  }

  async updateFraudPattern(patternId: string, updates: Partial<FraudPattern>): Promise<boolean> {
    const pattern = this.fraudPatterns.find(p => p.id === patternId);
    if (pattern) {
      Object.assign(pattern, updates);
      console.log(`✅ Padrão de fraude atualizado: ${pattern.name}`);
      return true;
    }
    return false;
  }

  async getFraudPatterns(): Promise<FraudPattern[]> {
    return this.fraudPatterns;
  }

  async getRateLimitRules(): Promise<RateLimitRule[]> {
    return this.rateLimitRules;
  }

  async updateRateLimitRule(ruleKey: string, updates: Partial<RateLimitRule>): Promise<boolean> {
    const rule = this.rateLimitRules.find(r => r.key === ruleKey);
    if (rule) {
      Object.assign(rule, updates);
      console.log(`✅ Regra de rate limit atualizada: ${rule.key}`);
      return true;
    }
    return false;
  }
}

// Instância global do serviço de segurança
export const advancedSecurity = new AdvancedSecurityService(); 