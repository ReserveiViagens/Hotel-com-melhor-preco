import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

// Usuários mock para demonstração (em produção, use banco de dados)
const users = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@reserveiviagens.com.br',
    password: 'admin123', // Em produção, use hash bcrypt
    role: 'admin'
  },
  {
    id: '2',
    name: 'Gerente',
    email: 'gerente@reserveiviagens.com.br',
    password: 'gerente123',
    role: 'manager'
  }
]

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    
    // Validar dados obrigatórios
    if (!body.email || !body.password) {
      return NextResponse.json({
        success: false,
        message: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }
    
    // Buscar usuário
    const user = users.find(u => u.email === body.email && u.password === body.password)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Email ou senha incorretos'
      }, { status: 401 })
    }
    
    // Gerar token JWT (simulado)
    const token = generateJWT(user)
    
    // Definir cookie de sessão
    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: false, // Em produção, definir como true
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })
    
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

function generateJWT(user: any): string {
  // Em produção, use uma biblioteca como jsonwebtoken
  // Por enquanto, simulando um token
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 dias
  }
  
  // Simular JWT (em produção, use jwt.sign)
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

    // Middleware para verificar autenticação
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token não encontrado'
      }, { status: 401 })
    }
    
    // Verificar token (em produção, use jwt.verify)
    const payload = JSON.parse(Buffer.from(token.value, 'base64').toString())
    
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({
        success: false,
        message: 'Token expirado'
      }, { status: 401 })
    }
    
    const user = users.find(u => u.id === payload.userId)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 