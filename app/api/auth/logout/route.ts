import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Remover cookie de autenticação
    cookieStore.delete('admin_token')
    
    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro no logout:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 