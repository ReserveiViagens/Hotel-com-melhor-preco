import { NextRequest, NextResponse } from 'next/server'
import { chatSocketServer } from '@/lib/socket-server'

export async function GET(request: NextRequest) {
  try {
    const sessions = chatSocketServer.getSessions()
    const activeSessions = chatSocketServer.getActiveSessions()
    
    return NextResponse.json({
      success: true,
      data: {
        totalSessions: sessions.length,
        activeSessions: activeSessions.length,
        sessions: sessions
      }
    })
  } catch (error) {
    console.error('Erro ao buscar sessões:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()
    
    switch (action) {
      case 'send-message':
        // Lógica para enviar mensagem via Socket.io
        return NextResponse.json({ success: true })
        
      case 'transfer-session':
        // Lógica para transferir sessão
        return NextResponse.json({ success: true })
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Ação não reconhecida' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API Socket:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 