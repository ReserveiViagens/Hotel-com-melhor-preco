import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next'

export interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  userName: string
  content: string
  type: 'user' | 'assistant' | 'admin'
  timestamp: Date
  tokens?: number
}

export interface ChatSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: 'active' | 'completed' | 'transferred'
  startTime: Date
  endTime?: Date
  messages: ChatMessage[]
  tags: string[]
  satisfaction?: number
}

class ChatSocketServer {
  private io: SocketIOServer | null = null
  private sessions: Map<string, ChatSession> = new Map()
  private adminConnections: Set<string> = new Set()

  initialize(server: NetServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    this.io.on('connection', (socket) => {
      console.log('Cliente conectado:', socket.id)

      // Autenticação de admin
      socket.on('admin-auth', (token: string) => {
        // Em produção, validar JWT token
        if (token) {
          this.adminConnections.add(socket.id)
          socket.join('admin-room')
          socket.emit('admin-authenticated')
          console.log('Admin autenticado:', socket.id)
        }
      })

      // Cliente iniciando chat
      socket.on('start-chat', (userData: { userId: string; userName: string; userEmail: string }) => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const session: ChatSession = {
          id: sessionId,
          userId: userData.userId,
          userName: userData.userName,
          userEmail: userData.userEmail,
          status: 'active',
          startTime: new Date(),
          messages: [],
          tags: []
        }

        this.sessions.set(sessionId, session)
        socket.join(sessionId)
        socket.emit('chat-started', { sessionId })

        // Notificar admins sobre nova sessão
        this.io?.to('admin-room').emit('new-session', session)
      })

      // Enviar mensagem
      socket.on('send-message', (data: { sessionId: string; content: string; type: 'user' | 'assistant' | 'admin' }) => {
        const session = this.sessions.get(data.sessionId)
        if (!session) return

        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sessionId: data.sessionId,
          userId: session.userId,
          userName: session.userName,
          content: data.content,
          type: data.type,
          timestamp: new Date()
        }

        session.messages.push(message)
        this.sessions.set(data.sessionId, session)

        // Enviar para todos na sessão
        this.io?.to(data.sessionId).emit('new-message', message)

        // Notificar admins
        this.io?.to('admin-room').emit('message-received', { sessionId: data.sessionId, message })
      })

      // Admin enviando mensagem
      socket.on('admin-send', (data: { sessionId: string; content: string }) => {
        const session = this.sessions.get(data.sessionId)
        if (!session) return

        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sessionId: data.sessionId,
          userId: 'admin',
          userName: 'Administrador',
          content: data.content,
          type: 'admin',
          timestamp: new Date()
        }

        session.messages.push(message)
        this.sessions.set(data.sessionId, session)

        // Enviar para cliente
        this.io?.to(data.sessionId).emit('new-message', message)
      })

      // Transferir para humano
      socket.on('transfer-to-human', (sessionId: string) => {
        const session = this.sessions.get(sessionId)
        if (!session) return

        session.status = 'transferred'
        this.sessions.set(sessionId, session)

        this.io?.to(sessionId).emit('transferred-to-human')
        this.io?.to('admin-room').emit('session-transferred', sessionId)
      })

      // Finalizar sessão
      socket.on('end-session', (sessionId: string) => {
        const session = this.sessions.get(sessionId)
        if (!session) return

        session.status = 'completed'
        session.endTime = new Date()
        this.sessions.set(sessionId, session)

        this.io?.to('admin-room').emit('session-ended', sessionId)
      })

      // Solicitar sessões ativas (admin)
      socket.on('get-active-sessions', () => {
        if (this.adminConnections.has(socket.id)) {
          const activeSessions = Array.from(this.sessions.values()).filter(s => s.status === 'active')
          socket.emit('active-sessions', activeSessions)
        }
      })

      // Solicitar histórico de sessão
      socket.on('get-session-history', (sessionId: string) => {
        const session = this.sessions.get(sessionId)
        if (session) {
          socket.emit('session-history', session)
        }
      })

      // Desconexão
      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id)
        this.adminConnections.delete(socket.id)
      })
    })

    return this.io
  }

  getIO() {
    return this.io
  }

  getSessions() {
    return Array.from(this.sessions.values())
  }

  getActiveSessions() {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active')
  }
}

export const chatSocketServer = new ChatSocketServer() 