'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { RevenueChart, DemographicsChart, MarketingChart, RealTimeChart, DeviceChart, TrafficSourceChart, SatisfactionChart, ConversionChart } from '@/components/charts/analytics-charts';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Calendar,
  MapPin,
  Clock,
  Target,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Download,
  RefreshCw,
  Filter,
  Search,
  Zap,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar as CalendarIcon,
  Star,
  Heart,
  Share2,
  MessageSquare,
  Mail,
  Phone,
  CreditCard,
  Banknote,
  Percent
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    totalBookings: number;
    conversionRate: number;
    avgOrderValue: number;
    returningCustomers: number;
    newCustomers: number;
    churnRate: number;
  };
  trends: {
    name: string;
    users: number;
    revenue: number;
    bookings: number;
    change: number;
  }[];
  demographics: {
    ageGroups: { range: string; count: number; percentage: number }[];
    genders: { type: string; count: number; percentage: number }[];
    locations: { city: string; state: string; count: number; percentage: number }[];
  };
  behavior: {
    topPages: { page: string; views: number; uniqueViews: number; avgTime: number }[];
    devices: { type: string; count: number; percentage: number }[];
    browsers: { name: string; count: number; percentage: number }[];
    sources: { source: string; count: number; percentage: number }[];
  };
  bookings: {
    byType: { type: string; count: number; revenue: number }[];
    byMonth: { month: string; count: number; revenue: number }[];
    topDestinations: { destination: string; count: number; revenue: number }[];
    avgBookingValue: number;
    bookingConversion: number;
  };
  marketing: {
    campaigns: { name: string; impressions: number; clicks: number; conversions: number; cost: number }[];
    channels: { channel: string; users: number; conversions: number; cost: number }[];
    roi: number;
    cac: number; // Customer Acquisition Cost
    ltv: number; // Lifetime Value
  };
  realTime: {
    activeUsers: number;
    currentBookings: number;
    revenueToday: number;
    topPages: { page: string; activeUsers: number }[];
    recentActivity: { type: string; description: string; timestamp: string }[];
  };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Simular dados de analytics
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 12450,
          totalRevenue: 1245000,
          totalBookings: 3420,
          conversionRate: 3.2,
          avgOrderValue: 364.12,
          returningCustomers: 4280,
          newCustomers: 8170,
          churnRate: 12.5
        },
        trends: [
          { name: '2024-01-01', users: 1200, revenue: 125000, bookings: 340, change: 12.5 },
          { name: '2024-01-02', users: 1350, revenue: 142000, bookings: 385, change: 15.2 },
          { name: '2024-01-03', users: 1180, revenue: 118000, bookings: 320, change: -8.3 },
          { name: '2024-01-04', users: 1420, revenue: 156000, bookings: 410, change: 18.7 },
          { name: '2024-01-05', users: 1290, revenue: 135000, bookings: 365, change: 7.2 }
        ],
        demographics: {
          ageGroups: [
            { range: '18-24', count: 2180, percentage: 17.5 },
            { range: '25-34', count: 4240, percentage: 34.1 },
            { range: '35-44', count: 3680, percentage: 29.6 },
            { range: '45-54', count: 1850, percentage: 14.9 },
            { range: '55+', count: 500, percentage: 4.0 }
          ],
          genders: [
            { type: 'Feminino', count: 7320, percentage: 58.8 },
            { type: 'Masculino', count: 4890, percentage: 39.3 },
            { type: 'Outro', count: 240, percentage: 1.9 }
          ],
          locations: [
            { city: 'São Paulo', state: 'SP', count: 2840, percentage: 22.8 },
            { city: 'Rio de Janeiro', state: 'RJ', count: 1920, percentage: 15.4 },
            { city: 'Belo Horizonte', state: 'MG', count: 1180, percentage: 9.5 },
            { city: 'Brasília', state: 'DF', count: 980, percentage: 7.9 },
            { city: 'Salvador', state: 'BA', count: 760, percentage: 6.1 }
          ]
        },
        behavior: {
          topPages: [
            { page: '/hoteis', views: 45200, uniqueViews: 32100, avgTime: 145 },
            { page: '/atracoes', views: 38900, uniqueViews: 28400, avgTime: 132 },
            { page: '/promocoes', views: 31200, uniqueViews: 24800, avgTime: 98 },
            { page: '/ingressos', views: 28500, uniqueViews: 21900, avgTime: 156 },
            { page: '/', views: 52300, uniqueViews: 41200, avgTime: 87 }
          ],
          devices: [
            { type: 'Mobile', count: 7890, percentage: 63.4 },
            { type: 'Desktop', count: 3680, percentage: 29.6 },
            { type: 'Tablet', count: 880, percentage: 7.1 }
          ],
          browsers: [
            { name: 'Chrome', count: 8240, percentage: 66.2 },
            { name: 'Safari', count: 2180, percentage: 17.5 },
            { name: 'Firefox', count: 1340, percentage: 10.8 },
            { name: 'Edge', count: 690, percentage: 5.5 }
          ],
          sources: [
            { source: 'Google Organic', count: 4890, percentage: 39.3 },
            { source: 'Direct', count: 3240, percentage: 26.0 },
            { source: 'Social Media', count: 2180, percentage: 17.5 },
            { source: 'Email', count: 1340, percentage: 10.8 },
            { source: 'Referral', count: 800, percentage: 6.4 }
          ]
        },
        bookings: {
          byType: [
            { type: 'Hotéis', count: 1890, revenue: 687000 },
            { type: 'Atrações', count: 980, revenue: 245000 },
            { type: 'Pacotes', count: 420, revenue: 234000 },
            { type: 'Ingressos', count: 130, revenue: 79000 }
          ],
          byMonth: [
            { month: 'Jan', count: 320, revenue: 125000 },
            { month: 'Fev', count: 280, revenue: 98000 },
            { month: 'Mar', count: 420, revenue: 156000 },
            { month: 'Abr', count: 380, revenue: 142000 },
            { month: 'Mai', count: 450, revenue: 178000 }
          ],
          topDestinations: [
            { destination: 'Caldas Novas', count: 890, revenue: 324000 },
            { destination: 'Rio Quente', count: 620, revenue: 245000 },
            { destination: 'Pirenópolis', count: 450, revenue: 189000 },
            { destination: 'Chapada dos Veadeiros', count: 380, revenue: 156000 },
            { destination: 'Goiânia', count: 290, revenue: 98000 }
          ],
          avgBookingValue: 364.12,
          bookingConversion: 3.2
        },
        marketing: {
          campaigns: [
            { name: 'Verão 2024', impressions: 125000, clicks: 4200, conversions: 180, cost: 8500 },
            { name: 'Férias Escolares', impressions: 98000, clicks: 3800, conversions: 145, cost: 6200 },
            { name: 'Fim de Semana', impressions: 67000, clicks: 2900, conversions: 98, cost: 4100 },
            { name: 'Black Friday', impressions: 156000, clicks: 6800, conversions: 320, cost: 12000 }
          ],
          channels: [
            { channel: 'Google Ads', users: 4200, conversions: 180, cost: 8500 },
            { channel: 'Facebook Ads', users: 3800, conversions: 145, cost: 6200 },
            { channel: 'Instagram Ads', users: 2900, conversions: 98, cost: 4100 },
            { channel: 'Email Marketing', users: 1800, conversions: 85, cost: 500 }
          ],
          roi: 4.2,
          cac: 47.22,
          ltv: 890.45
        },
        realTime: {
          activeUsers: 234,
          currentBookings: 12,
          revenueToday: 24800,
          topPages: [
            { page: '/hoteis', activeUsers: 89 },
            { page: '/promocoes', activeUsers: 67 },
            { page: '/atracoes', activeUsers: 45 },
            { page: '/', activeUsers: 33 }
          ],
          recentActivity: [
            { type: 'booking', description: 'Nova reserva de hotel em Caldas Novas', timestamp: new Date(Date.now() - 120000).toISOString() },
            { type: 'registration', description: 'Novo usuário cadastrado', timestamp: new Date(Date.now() - 180000).toISOString() },
            { type: 'booking', description: 'Reserva de ingresso para Hot Park', timestamp: new Date(Date.now() - 240000).toISOString() },
            { type: 'payment', description: 'Pagamento confirmado - R$ 1.240', timestamp: new Date(Date.now() - 300000).toISOString() }
          ]
        }
      };

      setData(mockData);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setError('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalyticsData();
    setIsRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Avançado</h1>
          <p className="text-gray-600">Métricas detalhadas e insights de negócio</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="last7days">Últimos 7 dias</SelectItem>
              <SelectItem value="last30days">Últimos 30 dias</SelectItem>
              <SelectItem value="last90days">Últimos 90 dias</SelectItem>
              <SelectItem value="thisyear">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="bookings">Reservas</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.overview.totalUsers)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(15.2)}
                  <span className={getTrendColor(15.2)}>+15.2% vs período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(8.7)}
                  <span className={getTrendColor(8.7)}>+8.7% vs período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.overview.totalBookings)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(12.3)}
                  <span className={getTrendColor(12.3)}>+12.3% vs período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(data.overview.conversionRate)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(2.1)}
                  <span className={getTrendColor(2.1)}>+2.1% vs período anterior</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Secundárias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.overview.avgOrderValue)}</div>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clientes Recorrentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.overview.returningCustomers)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage((data.overview.returningCustomers / data.overview.totalUsers) * 100)} do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.overview.newCustomers)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage((data.overview.newCustomers / data.overview.totalUsers) * 100)} do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(data.overview.churnRate)}</div>
                <Progress value={data.overview.churnRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendências */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências dos Últimos 30 Dias</CardTitle>
              <CardDescription>Evolução de usuários, receita e reservas</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={data.trends} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demografia por Idade */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Idade</CardTitle>
                <CardDescription>Faixa etária dos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.demographics.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm">{group.range} anos</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(group.count)}</div>
                        <div className="text-xs text-gray-500">{formatPercentage(group.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demografia por Gênero */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Gênero</CardTitle>
                <CardDescription>Perfil de gênero dos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.demographics.genders.map((gender) => (
                    <div key={gender.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span className="text-sm">{gender.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(gender.count)}</div>
                        <div className="text-xs text-gray-500">{formatPercentage(gender.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Localização */}
          <Card>
            <CardHeader>
              <CardTitle>Top Localizações</CardTitle>
              <CardDescription>Cidades com mais usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.demographics.locations.map((location) => (
                  <div key={`${location.city}-${location.state}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{location.city}, {location.state}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(location.count)}</div>
                      <div className="text-xs text-gray-500">{formatPercentage(location.percentage)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reservas por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Reservas por Tipo</CardTitle>
                <CardDescription>Distribuição por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.bookings.byType.map((type) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(type.count)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(type.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Destinos */}
            <Card>
              <CardHeader>
                <CardTitle>Top Destinos</CardTitle>
                <CardDescription>Destinos mais procurados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.bookings.topDestinations.map((destination) => (
                    <div key={destination.destination} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{destination.destination}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(destination.count)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(destination.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evolução Mensal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
              <CardDescription>Reservas e receita por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart className="h-16 w-16 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Gráfico de evolução mensal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          {/* KPIs de Marketing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.marketing.roi.toFixed(1)}x</div>
                <p className="text-xs text-muted-foreground">Retorno sobre investimento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CAC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.marketing.cac)}</div>
                <p className="text-xs text-muted-foreground">Custo de aquisição</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">LTV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.marketing.ltv)}</div>
                <p className="text-xs text-muted-foreground">Valor do tempo de vida</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campanhas */}
            <Card>
              <CardHeader>
                <CardTitle>Performance das Campanhas</CardTitle>
                <CardDescription>Principais campanhas de marketing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.marketing.campaigns.map((campaign) => (
                    <div key={campaign.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge variant="outline">{formatCurrency(campaign.cost)}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Impressões</p>
                          <p className="font-medium">{formatNumber(campaign.impressions)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cliques</p>
                          <p className="font-medium">{formatNumber(campaign.clicks)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conversões</p>
                          <p className="font-medium">{formatNumber(campaign.conversions)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Canais */}
            <Card>
              <CardHeader>
                <CardTitle>Canais de Marketing</CardTitle>
                <CardDescription>Performance por canal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.marketing.channels.map((channel) => (
                    <div key={channel.channel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm">{channel.channel}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(channel.conversions)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(channel.cost)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Páginas Mais Visitadas */}
            <Card>
              <CardHeader>
                <CardTitle>Páginas Mais Visitadas</CardTitle>
                <CardDescription>Conteúdo mais popular</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.behavior.topPages.map((page) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{page.page}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(page.views)}</div>
                        <div className="text-xs text-gray-500">{page.avgTime}s médio</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dispositivos */}
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos</CardTitle>
                <CardDescription>Preferências de acesso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.behavior.devices.map((device) => (
                    <div key={device.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.type === 'Mobile' && <Smartphone className="h-4 w-4 text-gray-400" />}
                        {device.type === 'Desktop' && <Monitor className="h-4 w-4 text-gray-400" />}
                        {device.type === 'Tablet' && <Tablet className="h-4 w-4 text-gray-400" />}
                        <span className="text-sm">{device.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(device.count)}</div>
                        <div className="text-xs text-gray-500">{formatPercentage(device.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Navegadores */}
            <Card>
              <CardHeader>
                <CardTitle>Navegadores</CardTitle>
                <CardDescription>Preferências de navegação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.behavior.browsers.map((browser) => (
                    <div key={browser.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{browser.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(browser.count)}</div>
                        <div className="text-xs text-gray-500">{formatPercentage(browser.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fontes de Tráfego */}
            <Card>
              <CardHeader>
                <CardTitle>Fontes de Tráfego</CardTitle>
                <CardDescription>De onde vêm os visitantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.behavior.sources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-teal-500 rounded"></div>
                        <span className="text-sm">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(source.count)}</div>
                        <div className="text-xs text-gray-500">{formatPercentage(source.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          {/* Métricas em Tempo Real */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatNumber(data.realTime.activeUsers)}</div>
                <p className="text-xs text-muted-foreground">Neste momento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reservas Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatNumber(data.realTime.currentBookings)}</div>
                <p className="text-xs text-muted-foreground">Últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(data.realTime.revenueToday)}</div>
                <p className="text-xs text-muted-foreground">Últimas 24h</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Páginas Ativas */}
            <Card>
              <CardHeader>
                <CardTitle>Páginas Ativas</CardTitle>
                <CardDescription>Usuários ativos por página</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.realTime.topPages.map((page) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">{page.page}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">{formatNumber(page.activeUsers)}</div>
                        <div className="text-xs text-gray-500">usuários ativos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Eventos em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.realTime.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 