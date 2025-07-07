import { NextRequest } from 'next/server';

export interface SSLConfig {
  enabled: boolean;
  redirectHttp: boolean;
  hstsEnabled: boolean;
  hstsMaxAge: number;
  cspEnabled: boolean;
  cspDirectives: Record<string, string[]>;
}

export const sslConfig: SSLConfig = {
  enabled: true,
  redirectHttp: true,
  hstsEnabled: true,
  hstsMaxAge: 31536000, // 1 ano
  cspEnabled: true,
  cspDirectives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://maps.googleapis.com"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https:",
      "https://www.google-analytics.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    'connect-src': [
      "'self'",
      "https://api.booking.com",
      "https://api.openweathermap.org",
      "https://www.googleapis.com",
      "https://www.google-analytics.com"
    ],
    'frame-src': [
      "'self'",
      "https://www.google.com",
      "https://www.youtube.com"
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  }
};

export function getSecurityHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // HSTS (HTTP Strict Transport Security)
  if (sslConfig.hstsEnabled) {
    headers['Strict-Transport-Security'] = `max-age=${sslConfig.hstsMaxAge}; includeSubDomains; preload`;
  }

  // Content Security Policy
  if (sslConfig.cspEnabled) {
    const cspParts: string[] = [];
    Object.entries(sslConfig.cspDirectives).forEach(([directive, sources]) => {
      if (sources.length > 0) {
        cspParts.push(`${directive} ${sources.join(' ')}`);
      }
    });
    headers['Content-Security-Policy'] = cspParts.join('; ');
  }

  // Outros headers de segurança
  headers['X-Content-Type-Options'] = 'nosniff';
  headers['X-Frame-Options'] = 'DENY';
  headers['X-XSS-Protection'] = '1; mode=block';
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';

  return headers;
}

export function shouldRedirectToHttps(request: NextRequest): boolean {
  if (!sslConfig.enabled || !sslConfig.redirectHttp) {
    return false;
  }

  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 
                   request.headers.get('x-forwarded-protocol') || 
                   'http';

  return protocol === 'http' && host && !host.includes('localhost');
}

export function getHttpsUrl(request: NextRequest): string {
  const host = request.headers.get('host');
  const path = request.nextUrl.pathname + request.nextUrl.search;
  
  return `https://${host}${path}`;
} 