"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageSquare, Users, Clock, Phone, Mail, Settings, BarChart3, Download, Search, Activity, Send, Bot, User, Star, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import N8NIntegration from "@/components/n8n-integration"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  userId?: string
  userName?: string
  rating?: number
  tokens?: number
}

interface ChatSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  startTime: string
  endTime?: string
  status: 'active' | 'completed' | 'transferred'
  messages: ChatMessage[]
  satisfaction?: number
  tags: string[]
}

interface ChatStats {
  totalSessions: number
  activeSessions: number
  avgResponseTime: number
  satisfactionRate: number
  tokensUsed: number
  tokensLimit: number
  commonQuestions: Array<{
    question: string
    count: number
  }>
  dailyStats: Array<{
    date: string
    sessions: number
    satisfaction: number
  }>
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [stats, setStats] = useState<ChatStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('live')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [aiConfig, setAiConfig] = useState({
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: 'Você é um assistente especializado em turismo e reservas de hotéis. Seja prestativo e forneça informações precisas sobre nossos serviços.',
    autoResponse: true,
    responseDelay: 2000
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatData()
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadChatData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [selectedSession?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      // Simular dados do chat
      const mockSessions: ChatSession[] = [
        {
          id: '1',
          userId: '1',
          userName: 'João Silva',
          userEmail: 'joao@email.com',
          startTime: new Date().toISOString(),
          status: 'active',
          messages: [
            {
              id: '1',
              type: 'user',
              content: 'Olá, gostaria de saber sobre disponibilidade de hotéis em Caldas Novas',
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              type: 'assistant',
              content: 'Olá! Claro, posso ajudá-lo com informações sobre hotéis em Caldas Novas. Temos várias opções disponíveis. Para qual período você gostaria de fazer a reserva?',
              timestamp: new Date(Date.now() + 30000).toISOString(),
              tokens: 45
            },
            {
              id: '3',
              type: 'user',
              content: 'Para o final de semana do dia 15 de março',
              timestamp: new Date(Date.now() + 60000).toISOString()
            }
          ],
          tags: ['reserva', 'caldas-novas'],
          satisfaction: 5
        },
        {
          id: '2',
          userId: '2',
          userName: 'Maria Santos',
          userEmail: 'maria@email.com',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 1800000).toISOString(),
          status: 'completed',
          messages: [
            {
              id: '4',
              type: 'user',
              content: 'Preciso cancelar minha reserva',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: '5',
              type: 'assistant',
              content: 'Entendo que você precisa cancelar sua reserva. Posso ajudá-lo com isso. Você poderia me fornecer o número da sua reserva?',
              timestamp: new Date(Date.now() - 3570000).toISOString(),
              tokens: 38
            }
          ],
          tags: ['cancelamento'],
          satisfaction: 4
        }
      ]

      const mockStats: ChatStats = {
        totalSessions: 156,
        activeSessions: 3,
        avgResponseTime: 2.3,
        satisfactionRate: 4.6,
        tokensUsed: 12500,
        tokensLimit: 50000,
        commonQuestions: [
          { question: 'Disponibilidade de hotéis', count: 45 },
          { question: 'Cancelamento de reserva', count: 32 },
          { question: 'Informações sobre preços', count: 28 },
          { question: 'Check-in e check-out', count: 21 }
        ],
        dailyStats: [
          { date: '2024-01-15', sessions: 23, satisfaction: 4.5 },
          { date: '2024-01-16', sessions: 31, satisfaction: 4.7 },
          { date: '2024-01-17', sessions: 28, satisfaction: 4.6 }
        ]
      }

      setSessions(mockSessions)
      setStats(mockStats)
      if (!selectedSession && mockSessions.length > 0) {
        setSelectedSession(mockSessions[0])
      }
    } catch (error) {
      console.error('Erro ao carregar dados do chat:', error)
      setError('Erro ao carregar dados do chat')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return

    setSending(true)
    try {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: newMessage,
        timestamp: new Date().toISOString(),
        userId: 'admin',
        userName: 'Administrador'
      }

      // Adicionar mensagem do usuário
      const updatedSession = {
        ...selectedSession,
        messages: [...selectedSession.messages, userMessage]
      }
      setSelectedSession(updatedSession)
      setSessions(prev => prev.map(s => s.id === selectedSession.id ? updatedSession : s))
      setNewMessage('')

      // Simular resposta da IA (em produção, fazer chamada para API)
      if (aiConfig.autoResponse) {
        setTimeout(async () => {
          const aiResponse = await generateAIResponse(newMessage)
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: aiResponse.content,
            timestamp: new Date().toISOString(),
            tokens: aiResponse.tokens
          }

          const finalSession = {
            ...updatedSession,
            messages: [...updatedSession.messages, aiMessage]
          }
          setSelectedSession(finalSession)
          setSessions(prev => prev.map(s => s.id === selectedSession.id ? finalSession : s))
        }, aiConfig.responseDelay)
      }
    } catch (error) {
      setError('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const generateAIResponse = async (userMessage: string) => {
    // Em produção, fazer chamada real para OpenAI
    const responses = [
      'Entendo sua solicitação. Posso ajudá-lo com mais detalhes sobre isso.',
      'Claro! Vou verificar essas informações para você.',
      'Essa é uma ótima pergunta. Deixe-me buscar os dados mais atualizados.',
      'Posso sim te ajudar com isso. Você gostaria de mais informações específicas?'
    ]
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      tokens: Math.floor(Math.random() * 50) + 20
    }
  }

  const handleRateMessage = async (messageId: string, rating: number) => {
    // Implementar avaliação de mensagem
    console.log('Rating message:', messageId, rating)
  }

  const handleTransferToHuman = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      // Implementar transferência para atendente humano
      setSuccess('Conversa transferida para atendente humano')
    } catch (error) {
      setError('Erro ao transferir conversa')
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat com IA</h1>
          <p className="text-gray-600">Sistema de atendimento inteligente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Conversas
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações IA
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="live">Chat ao Vivo</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeSessions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalSessions} total hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.avgResponseTime}s</div>
                <p className="text-xs text-muted-foreground">
                  Tempo de resposta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.satisfactionRate}/5</div>
                <p className="text-xs text-muted-foreground">
                  Avaliação média
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Usados</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.tokensUsed?.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {stats?.tokensLimit?.toLocaleString()} limite
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Sessões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-2 p-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedSession?.id === session.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{session.userName}</p>
                            <p className="text-sm text-gray-500">{session.userEmail}</p>
                          </div>
                          <Badge
                            variant={
                              session.status === 'active' ? 'default' :
                              session.status === 'completed' ? 'secondary' :
                              'outline'
                            }
                          >
                            {session.status === 'active' && 'Ativo'}
                            {session.status === 'completed' && 'Concluído'}
                            {session.status === 'transferred' && 'Transferido'}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-400">
                            {formatTime(session.startTime)}
                          </p>
                          {session.messages.length > 0 && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {session.messages[session.messages.length - 1].content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedSession ? selectedSession.userName : 'Selecione uma conversa'}
                    </CardTitle>
                    {selectedSession && (
                      <CardDescription>
                        {selectedSession.userEmail} • Iniciado às {formatTime(selectedSession.startTime)}
                      </CardDescription>
                    )}
                  </div>
                  {selectedSession?.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransferToHuman(selectedSession.id)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Transferir
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedSession ? (
                  <div className="space-y-4">
                    {/* Mensagens */}
                    <ScrollArea className="h-96 border rounded-lg p-4">
                      <div className="space-y-4">
                        {selectedSession.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.type === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs opacity-70">
                                  {formatTime(message.timestamp)}
                                </p>
                                {message.type === 'assistant' && (
                                  <div className="flex items-center gap-1">
                                    {message.tokens && (
                                      <span className="text-xs opacity-70">
                                        {message.tokens} tokens
                                      </span>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleRateMessage(message.id, 1)}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleRateMessage(message.id, -1)}
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input de Mensagem */}
                    {selectedSession.status === 'active' && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={sending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                        >
                          {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Selecione uma conversa para começar</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics do Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Mais Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.commonQuestions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.question}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(item.count / 50) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Diárias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.dailyStats.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">
                        {new Date(day.date).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{day.sessions} sessões</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{day.satisfaction}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          {/* Configurações da IA */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Chat IA</CardTitle>
              <CardDescription>
                Configure o comportamento da inteligência artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Modelo da IA</label>
                <Select value={aiConfig.model} onValueChange={(value) => setAiConfig({...aiConfig, model: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Prompt do Sistema</label>
                <Textarea
                  value={aiConfig.systemPrompt}
                  onChange={(e) => setAiConfig({...aiConfig, systemPrompt: e.target.value})}
                  className="min-h-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Temperatura (0-1)</label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiConfig.temperature}
                    onChange={(e) => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Máximo de Tokens</label>
                  <Input
                    type="number"
                    value={aiConfig.maxTokens}
                    onChange={(e) => setAiConfig({...aiConfig, maxTokens: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Resposta Automática</p>
                  <p className="text-xs text-gray-500">A IA responderá automaticamente às mensagens</p>
                </div>
                <Button
                  variant={aiConfig.autoResponse ? "default" : "outline"}
                  onClick={() => setAiConfig({...aiConfig, autoResponse: !aiConfig.autoResponse})}
                >
                  {aiConfig.autoResponse ? 'Ativado' : 'Desativado'}
                </Button>
              </div>

              <Button className="w-full">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
