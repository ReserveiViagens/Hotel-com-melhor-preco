import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

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

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  const connect = useCallback((token?: string) => {
    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Conectado ao servidor Socket.io')
      setIsConnected(true)
      
      // Se for admin, autenticar
      if (token) {
        socketInstance.emit('admin-auth', token)
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('Desconectado do servidor Socket.io')
      setIsConnected(false)
      setIsAdmin(false)
    })

    socketInstance.on('admin-authenticated', () => {
      console.log('Admin autenticado')
      setIsAdmin(true)
      socketInstance.emit('get-active-sessions')
    })

    socketInstance.on('new-session', (session: ChatSession) => {
      setSessions(prev => [...prev, session])
      setActiveSessions(prev => [...prev, session])
    })

    socketInstance.on('message-received', ({ sessionId, message }: { sessionId: string; message: ChatMessage }) => {
      setMessages(prev => [...prev, message])
      
      // Atualizar sessão
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: [...s.messages, message] }
          : s
      ))
      
      setActiveSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: [...s.messages, message] }
          : s
      ))
    })

    socketInstance.on('new-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('active-sessions', (sessions: ChatSession[]) => {
      setActiveSessions(sessions)
      setSessions(prev => {
        const existingIds = new Set(prev.map(s => s.id))
        const newSessions = sessions.filter(s => !existingIds.has(s.id))
        return [...prev, ...newSessions]
      })
    })

    socketInstance.on('session-history', (session: ChatSession) => {
      setCurrentSession(session)
      setMessages(session.messages)
    })

    socketInstance.on('session-transferred', (sessionId: string) => {
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'transferred' as const }
          : s
      ))
      
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
    })

    socketInstance.on('session-ended', (sessionId: string) => {
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'completed' as const, endTime: new Date() }
          : s
      ))
      
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
    })

    setSocket(socketInstance)
  }, [])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
      setIsAdmin(false)
    }
  }, [socket])

  const startChat = useCallback((userData: { userId: string; userName: string; userEmail: string }) => {
    if (socket) {
      socket.emit('start-chat', userData)
    }
  }, [socket])

  const sendMessage = useCallback((sessionId: string, content: string, type: 'user' | 'assistant' | 'admin' = 'user') => {
    if (socket) {
      socket.emit('send-message', { sessionId, content, type })
    }
  }, [socket])

  const adminSend = useCallback((sessionId: string, content: string) => {
    if (socket && isAdmin) {
      socket.emit('admin-send', { sessionId, content })
    }
  }, [socket, isAdmin])

  const transferToHuman = useCallback((sessionId: string) => {
    if (socket) {
      socket.emit('transfer-to-human', sessionId)
    }
  }, [socket])

  const endSession = useCallback((sessionId: string) => {
    if (socket) {
      socket.emit('end-session', sessionId)
    }
  }, [socket])

  const getSessionHistory = useCallback((sessionId: string) => {
    if (socket) {
      socket.emit('get-session-history', sessionId)
    }
  }, [socket])

  const getActiveSessions = useCallback(() => {
    if (socket && isAdmin) {
      socket.emit('get-active-sessions')
    }
  }, [socket, isAdmin])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    socket,
    isConnected,
    isAdmin,
    sessions,
    activeSessions,
    currentSession,
    messages,
    connect,
    disconnect,
    startChat,
    sendMessage,
    adminSend,
    transferToHuman,
    endSession,
    getSessionHistory,
    getActiveSessions
  }
} 