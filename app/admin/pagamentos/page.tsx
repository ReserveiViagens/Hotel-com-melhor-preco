'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
  Search,
  Wallet,
  Building,
  Smartphone,
  Globe,
  Shield,
  Activity,
  FileText,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reservationId: string | null;
  orderId: string | null;
  amount: number;
  method: 'credit_card' | 'pix' | 'boleto' | 'transfer';
  gateway: 'mercadopago' | 'pagarme' | 'stone' | 'stripe';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  gatewayId: string | null;
  gatewayData: any;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  failedPayments: number;
  refundedAmount: number;
  todayRevenue: number;
  monthlyRevenue: number;
  paymentsByMethod: {
    credit_card: number;
    pix: number;
    boleto: number;
    transfer: number;
  };
  paymentsByGateway: {
    mercadopago: number;
    pagarme: number;
    stone: number;
    stripe: number;
  };
  conversionRate: number;
  averageTicket: number;
}

interface GatewayConfig {
  gateway: string;
  name: string;
  icon: any;
  color: string;
  enabled: boolean;
  testMode: boolean;
  credentials: {
    publicKey?: string;
    secretKey?: string;
    accessToken?: string;
  };
}

export default function AdminPagamentosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGateway, setFilterGateway] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');
  const [refreshing, setRefreshing] = useState(false);

  const gatewayConfigs: GatewayConfig[] = [
    {
      gateway: 'mercadopago',
      name: 'Mercado Pago',
      icon: Wallet,
      color: 'bg-blue-500',
      enabled: true,
      testMode: false,
      credentials: {}
    },
    {
      gateway: 'pagarme',
      name: 'Pagar.me',
      icon: CreditCard,
      color: 'bg-green-500',
      enabled: true,
      testMode: false,
      credentials: {}
    },
    {
      gateway: 'stone',
      name: 'Stone',
      icon: Building,
      color: 'bg-purple-500',
      enabled: false,
      testMode: false,
      credentials: {}
    },
    {
      gateway: 'stripe',
      name: 'Stripe',
      icon: Globe,
      color: 'bg-indigo-500',
      enabled: true,
      testMode: true,
      credentials: {}
    }
  ];

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  const loadPayments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch('/api/admin/pagamentos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        // Dados mockados
        const mockPayments: Payment[] = [
          {
            id: '1',
            userId: '1',
            userName: 'João Silva',
            userEmail: 'joao@email.com',
            reservationId: '1',
            orderId: null,
            amount: 1200.00,
            method: 'credit_card',
            gateway: 'mercadopago',
            status: 'paid',
            gatewayId: 'MP123456',
            gatewayData: { installments: 3 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            userId: '2',
            userName: 'Maria Santos',
            userEmail: 'maria@email.com',
            reservationId: '2',
            orderId: null,
            amount: 850.00,
            method: 'pix',
            gateway: 'pagarme',
            status: 'pending',
            gatewayId: 'PG789012',
            gatewayData: { qr_code: 'pix://...' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '3',
            userId: '3',
            userName: 'Pedro Costa',
            userEmail: 'pedro@email.com',
            reservationId: '3',
            orderId: null,
            amount: 1500.00,
            method: 'boleto',
            gateway: 'stripe',
            status: 'failed',
            gatewayId: 'ST345678',
            gatewayData: { boleto_url: 'https://...' },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        setPayments(mockPayments);
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      setError('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // Simular estatísticas
    const mockStats: PaymentStats = {
      totalRevenue: 125000.00,
      pendingPayments: 8500.00,
      failedPayments: 3200.00,
      refundedAmount: 1500.00,
      todayRevenue: 3500.00,
      monthlyRevenue: 45000.00,
      paymentsByMethod: {
        credit_card: 65000.00,
        pix: 35000.00,
        boleto: 20000.00,
        transfer: 5000.00
      },
      paymentsByGateway: {
        mercadopago: 50000.00,
        pagarme: 40000.00,
        stone: 15000.00,
        stripe: 20000.00
      },
      conversionRate: 92.5,
      averageTicket: 850.00
    };
    setStats(mockStats);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPayments(), loadStats()]);
    setRefreshing(false);
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Tem certeza que deseja reembolsar este pagamento?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`/api/admin/pagamentos/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Reembolso processado com sucesso!');
        loadPayments();
      } else {
        setError('Erro ao processar reembolso');
      }
    } catch (error) {
      setError('Erro ao processar reembolso');
    }
  };

  const handleRetry = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`/api/admin/pagamentos/${paymentId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Pagamento reenviado para processamento!');
        loadPayments();
      } else {
        setError('Erro ao reprocessar pagamento');
      }
    } catch (error) {
      setError('Erro ao reprocessar pagamento');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <Smartphone className="h-4 w-4" />;
      case 'boleto':
        return <FileText className="h-4 w-4" />;
      case 'transfer':
        return <Building className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.gatewayId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesGateway = filterGateway === 'all' || payment.gateway === filterGateway;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    
    return matchesSearch && matchesStatus && matchesGateway && matchesMethod;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Pagamentos</h1>
          <p className="text-gray-600">Gerencie todos os pagamentos e gateways</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    +12.5% este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.pendingPayments)}</div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando confirmação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                  <Progress value={stats.conversionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.averageTicket)}</div>
                  <p className="text-xs text-muted-foreground">
                    Por transação
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome, email ou ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterGateway} onValueChange={setFilterGateway}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Gateways</SelectItem>
                    <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                    <SelectItem value="pagarme">Pagar.me</SelectItem>
                    <SelectItem value="stone">Stone</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Métodos</SelectItem>
                    <SelectItem value="credit_card">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Lista de Pagamentos */}
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getMethodIcon(payment.method)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{payment.userName}</h3>
                        <p className="text-sm text-gray-500">{payment.userEmail}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(payment.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {payment.gateway}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {payment.gatewayId}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge
                          variant={
                            payment.status === 'paid' ? 'default' :
                            payment.status === 'pending' ? 'secondary' :
                            payment.status === 'failed' ? 'destructive' :
                            'outline'
                          }
                        >
                          {payment.status === 'paid' && 'Pago'}
                          {payment.status === 'pending' && 'Pendente'}
                          {payment.status === 'failed' && 'Falhou'}
                          {payment.status === 'refunded' && 'Reembolsado'}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsDetailsOpen(true);
                          }}
                        >
                          Detalhes
                        </Button>
                        {payment.status === 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefund(payment.id)}
                          >
                            Reembolsar
                          </Button>
                        )}
                        {payment.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(payment.id)}
                          >
                            Retentar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gateways" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gatewayConfigs.map((config) => {
              const Icon = config.icon;
              return (
                <Card key={config.gateway}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>{config.name}</CardTitle>
                          <CardDescription>
                            {config.enabled ? 'Ativo' : 'Inativo'} • {config.testMode ? 'Modo Teste' : 'Produção'}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Receita Total</span>
                        <span className="font-medium">
                          {formatCurrency(stats?.paymentsByGateway[config.gateway as keyof typeof stats.paymentsByGateway] || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Taxa de Sucesso</span>
                        <span className="font-medium">95.2%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Última Transação</span>
                        <span className="font-medium">Há 5 minutos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métodos de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Receita por Método</CardTitle>
                <CardDescription>Distribuição de receita por método de pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Cartão de Crédito
                      </span>
                      <span className="font-medium">
                        {formatCurrency(stats?.paymentsByMethod.credit_card || 0)}
                      </span>
                    </div>
                    <Progress value={65} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        PIX
                      </span>
                      <span className="font-medium">
                        {formatCurrency(stats?.paymentsByMethod.pix || 0)}
                      </span>
                    </div>
                    <Progress value={35} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Boleto
                      </span>
                      <span className="font-medium">
                        {formatCurrency(stats?.paymentsByMethod.boleto || 0)}
                      </span>
                    </div>
                    <Progress value={20} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status de Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Status de Pagamentos</CardTitle>
                <CardDescription>Distribuição por status nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Pagos</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">2.180</p>
                      <p className="text-xs text-gray-500">92.5%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Pendentes</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">45</p>
                      <p className="text-xs text-gray-500">1.9%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Falhados</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">85</p>
                      <p className="text-xs text-gray-500">3.6%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Reembolsados</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">50</p>
                      <p className="text-xs text-gray-500">2.1%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
            <DialogDescription>
              Informações completas da transação
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID da Transação</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{selectedPayment.id}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(selectedPayment.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>ID do Gateway</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{selectedPayment.gatewayId}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(selectedPayment.gatewayId || '')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Cliente</Label>
                  <p className="font-medium">{selectedPayment.userName}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.userEmail}</p>
                </div>
                <div>
                  <Label>Valor</Label>
                  <p className="text-2xl font-bold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label>Método</Label>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(selectedPayment.method)}
                    <span className="capitalize">{selectedPayment.method.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <Label>Gateway</Label>
                  <Badge variant="outline">{selectedPayment.gateway}</Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedPayment.status)}
                    <span className="capitalize">{selectedPayment.status}</span>
                  </div>
                </div>
                <div>
                  <Label>Data</Label>
                  <p className="text-sm">
                    {new Date(selectedPayment.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {selectedPayment.gatewayData && (
                <div>
                  <Label>Dados Adicionais</Label>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(selectedPayment.gatewayData, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Fechar
                </Button>
                {selectedPayment.status === 'paid' && (
                  <Button variant="destructive" onClick={() => handleRefund(selectedPayment.id)}>
                    Processar Reembolso
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 