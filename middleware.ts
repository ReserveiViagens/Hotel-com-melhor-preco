import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/admin/login',
  '/admin/cadastro',
  '/hoteis',
  '/ingressos',
  '/atracoes',
  '/promocoes',
  '/contato',
  '/politica-privacidade',
  '/api/health',
  '/api/auth/register',
  '/api/auth/client-login',
  '/api/auth/admin-login',
  '/api/auth/admin-register',
  '/api/ai/chat',
  '/api/ai/generate-description',
  '/api/ai/analyze-sentiment',
  '/api/n8n',
  '/api/webhooks',
]

// Rotas que precisam de autenticação de cliente
const clientRoutes = [
  '/perfil',
  '/minhas-reservas',
  '/api/reservations',
]

// Rotas que precisam de autenticação de admin (exceto login)
const adminRoutes = [
  '/admin/hoteis',
  '/admin/ingressos',
  '/admin/atracoes',
  '/admin/promocoes',
  '/admin/reservas',
  '/admin/relatorios',
  '/admin/configuracoes',
  '/admin/clientes',
  '/admin/pagamentos',
  '/admin/vouchers',
  '/admin/chat',
  '/admin/email-marketing',
  '/admin/backup',
  '/admin/analytics',
  '/admin/monitoramento',
  '/admin/upload',
  '/api/admin',
]

// Função para verificar token JWT
function verifyToken(token: string, secret: string) {
  try {
    return jwt.verify(token, secret) as any
  } catch (error) {
    return null
  }
}

// Função para extrair token do header Authorization
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

// Função para extrair token do cookie
function extractTokenFromCookie(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value
  const adminToken = request.cookies.get('adminToken')?.value
  return token || adminToken || null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Permitir arquivos estáticos
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/images/') || 
      pathname.startsWith('/uploads/') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Rota especial para dashboard admin (redireciona se não autenticado)
  if (pathname === '/admin') {
    const adminToken = request.cookies.get('adminToken')?.value
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-123'
    const decoded = verifyToken(adminToken, jwtSecret)
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    return NextResponse.next()
  }

  // Verificar se é uma rota de API
  const isApiRoute = pathname.startsWith('/api/')
  
  // Extrair token
  let token = null
  if (isApiRoute) {
    token = extractToken(request)
  } else {
    token = extractTokenFromCookie(request)
  }

  // Se não há token, redirecionar para login
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    } else {
      // Redirecionar para login apropriado
      if (adminRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  // Verificar token
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-123'
  const decoded = verifyToken(token, jwtSecret)

  if (!decoded) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    } else {
      // Limpar cookies inválidos e redirecionar
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('token')
      response.cookies.delete('adminToken')
      return response
    }
  }

  // Verificar permissões para rotas de admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (decoded.role !== 'admin') {
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Acesso negado. Apenas administradores.' },
          { status: 403 }
        )
      } else {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  }

  // Verificar permissões para rotas de cliente
  if (clientRoutes.some(route => pathname.startsWith(route))) {
    if (decoded.role !== 'client') {
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Acesso negado. Apenas clientes.' },
          { status: 403 }
        )
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  // Adicionar informações do usuário ao header para uso nas APIs
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', decoded.userId)
  requestHeaders.set('x-user-role', decoded.role)
  requestHeaders.set('x-user-email', decoded.email)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 