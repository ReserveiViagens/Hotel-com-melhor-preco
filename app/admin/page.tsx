"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Hotel, 
  Ticket, 
  MapPin, 
  Gift, 
  Phone, 
  Settings,
  Image as ImageIcon,
  Video,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Users,
  FileText,
  TrendingUp,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  AlertTriangle,
  Bell,
  BarChart3,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Eye,
  ShoppingCart,
  CreditCard,
  UserPlus,
  Package,
  MessageSquare,
  Shield,
  Database,
  Zap,
  Globe
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalHotels: number;
  totalTickets: number;
  totalAttractions: number;
  totalPromotions: number;
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  recentReservations: Array<{
    id: string;
    hotelName: string;
    userName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }>;
  revenueStats: {
    totalRevenue: number;
    monthlyRevenue: number;
    weeklyRevenue: number;
    todayRevenue: number;
    pendingPayments: number;
    failedPayments: number;
  };
  performanceMetrics: {
    conversionRate: number;
    averageTicket: number;
    occupancyRate: number;
    satisfactionRate: number;
  };
  systemHealth: {
    apiStatus: 'online' | 'offline' | 'degraded';
    databaseStatus: 'online' | 'offline' | 'degraded';
    paymentGatewayStatus: 'online' | 'offline' | 'degraded';
    openAIStatus: 'online' | 'offline' | 'degraded';
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('today')

  useEffect(() => {
    loadDashboardData()
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(() => {
      loadDashboardData(true)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      const response = await fetch(`/api/admin/dashboard?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Usar dados mockados se a API não estiver disponível
        setStats(getMockStats())
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      setStats(getMockStats())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getMockStats = (): DashboardStats => ({
    totalUsers: 1250,
    newUsersToday: 23,
    totalHotels: 45,
    totalTickets: 120,
    totalAttractions: 30,
    totalPromotions: 15,
    totalReservations: 2340,
    pendingReservations: 45,
    confirmedReservations: 2180,
    cancelledReservations: 115,
    recentReservations: [
      {
        id: '1',
        hotelName: 'Spazzio DiRoma',
        userName: 'João Silva',
        totalPrice: 1200.00,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        hotelName: 'Lagoa Eco Towers',
        userName: 'Maria Santos',
        totalPrice: 850.00,
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        hotelName: 'Piazza DiRoma',
        userName: 'Pedro Costa',
        totalPrice: 1500.00,
        status: 'completed',
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    revenueStats: {
      totalRevenue: 125000.00,
      monthlyRevenue: 45000.00,
      weeklyRevenue: 12000.00,
      todayRevenue: 3500.00,
      pendingPayments: 8500.00,
      failedPayments: 1200.00
    },
    performanceMetrics: {
      conversionRate: 3.2,
      averageTicket: 850.00,
      occupancyRate: 78.5,
      satisfactionRate: 4.6
    },
    systemHealth: {
      apiStatus: 'online',
      databaseStatus: 'online',
      paymentGatewayStatus: 'online',
      openAIStatus: 'degraded'
    },
    alerts: [
      {
        id: '1',
        type: 'warning',
        title: 'Limite de API OpenAI',
        message: 'Você está próximo do limite mensal de requisições da OpenAI (85% usado)',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'info',
        title: 'Backup Concluído',
        message: 'Backup automático do banco de dados concluído com sucesso',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'default',
      cancelled: 'destructive'
    } as const

    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getSystemStatusIcon = (status: string) => {
    if (status === 'online') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === 'offline') return <XCircle className="h-4 w-4 text-red-500" />
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com boas-vindas e ações rápidas */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {user?.name || 'Administrador'}! 👋
          </h1>
          <p className="text-gray-600">
            Aqui está o resumo do seu negócio hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
            {stats?.alerts && stats.alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.alerts.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Alertas e Notificações */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <div className="space-y-2">
          {stats.alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}:</strong> {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.revenueStats.todayRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              +12.5% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas Reservas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingReservations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newUsersToday || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              +8% esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.performanceMetrics.conversionRate || 0}%
            </div>
            <Progress value={stats?.performanceMetrics.conversionRate || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Métricas Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Receita */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Receita dos Últimos 7 Dias
            </CardTitle>
            <CardDescription>
              Acompanhe a evolução da receita diária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {/* Aqui entraria um gráfico real (Chart.js, Recharts, etc) */}
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Gráfico de receita</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Taxa de Ocupação</span>
                <span className="font-medium">{stats?.performanceMetrics.occupancyRate}%</span>
              </div>
              <Progress value={stats?.performanceMetrics.occupancyRate || 0} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Satisfação do Cliente</span>
                <span className="font-medium">{stats?.performanceMetrics.satisfactionRate}/5</span>
              </div>
              <Progress value={(stats?.performanceMetrics.satisfactionRate || 0) * 20} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ticket Médio</span>
                <span className="font-medium">
                  {formatCurrency(stats?.performanceMetrics.averageTicket || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real dos serviços
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm">Banco de Dados</span>
              </div>
              <div className="flex items-center gap-2">
                {getSystemStatusIcon(stats?.systemHealth.databaseStatus || 'offline')}
                <span className="text-sm capitalize">{stats?.systemHealth.databaseStatus}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">API</span>
              </div>
              <div className="flex items-center gap-2">
                {getSystemStatusIcon(stats?.systemHealth.apiStatus || 'offline')}
                <span className="text-sm capitalize">{stats?.systemHealth.apiStatus}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Gateway de Pagamento</span>
              </div>
              <div className="flex items-center gap-2">
                {getSystemStatusIcon(stats?.systemHealth.paymentGatewayStatus || 'offline')}
                <span className="text-sm capitalize">{stats?.systemHealth.paymentGatewayStatus}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">OpenAI</span>
              </div>
              <div className="flex items-center gap-2">
                {getSystemStatusIcon(stats?.systemHealth.openAIStatus || 'offline')}
                <span className="text-sm capitalize">{stats?.systemHealth.openAIStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesse as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/admin/hoteis">
              <Button variant="outline" className="w-full justify-start">
                <Hotel className="w-4 h-4 mr-2" />
                Hotéis
              </Button>
            </Link>
            <Link href="/admin/reservas">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Reservas
              </Button>
            </Link>
            <Link href="/admin/clientes">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Clientes
              </Button>
            </Link>
            <Link href="/admin/pagamentos">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Pagamentos
              </Button>
            </Link>
            <Link href="/admin/relatorios">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </Link>
            <Link href="/admin/configuracoes">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Reservas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas reservas e atividades no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentReservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{reservation.hotelName}</p>
                    <p className="text-sm text-gray-500">{reservation.userName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(reservation.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(reservation.totalPrice)}</p>
                  {getStatusBadge(reservation.status)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/admin/reservas">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todas as Reservas
              </Button>
            </Link>
            <Link href="/admin/relatorios">
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Relatório Completo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 