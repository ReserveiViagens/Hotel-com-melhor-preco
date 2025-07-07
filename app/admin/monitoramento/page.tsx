'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Activity,
  Server,
  Database,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Download,
  Filter,
  Search,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  HardDrive,
  Cpu,
  Network,
  Shield,
  Lock,
  Unlock,
  Users,
  FileText,
  Bug,
  Info,
  AlertCircle,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Save,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    available: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    percentage: number;
    iops: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    connections: number;
  };
  database: {
    connections: number;
    queries: number;
    slowQueries: number;
    uptime: number;
    size: number;
  };
  application: {
    requests: number;
    errors: number;
    responseTime: number;
    uptime: number;
    version: string;
  };
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical' | 'debug';
  category: string;
  message: string;
  details?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
}

export default function AdminMonitoramentoPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [logLevel, setLogLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadMonitoringData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadMonitoringData, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const loadMonitoringData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Simular dados de monitoramento
      const mockMetrics: SystemMetrics = {
        cpu: {
          usage: Math.floor(Math.random() * 40) + 20, // 20-60%
          cores: 8,
          temperature: Math.floor(Math.random() * 20) + 45, // 45-65°C
          load: [0.5, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6, 0.1]
        },
        memory: {
          total: 16 * 1024 * 1024 * 1024, // 16GB
          used: 8 * 1024 * 1024 * 1024, // 8GB
          available: 8 * 1024 * 1024 * 1024, // 8GB
          percentage: 50
        },
        disk: {
          total: 500 * 1024 * 1024 * 1024, // 500GB
          used: 200 * 1024 * 1024 * 1024, // 200GB
          available: 300 * 1024 * 1024 * 1024, // 300GB
          percentage: 40,
          iops: Math.floor(Math.random() * 1000) + 500
        },
        network: {
          bytesIn: Math.floor(Math.random() * 1000000) + 500000,
          bytesOut: Math.floor(Math.random() * 500000) + 200000,
          packetsIn: Math.floor(Math.random() * 10000) + 5000,
          packetsOut: Math.floor(Math.random() * 5000) + 2000,
          connections: Math.floor(Math.random() * 100) + 50
        },
        database: {
          connections: Math.floor(Math.random() * 20) + 10,
          queries: Math.floor(Math.random() * 1000) + 500,
          slowQueries: Math.floor(Math.random() * 10),
          uptime: 86400 * 7, // 7 dias
          size: 50 * 1024 * 1024 // 50MB
        },
        application: {
          requests: Math.floor(Math.random() * 1000) + 500,
          errors: Math.floor(Math.random() * 10),
          responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
          uptime: 86400 * 30, // 30 dias
          version: '1.0.0'
        }
      };

      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          category: 'auth',
          message: 'Usuário admin@reservei.com fez login com sucesso',
          userId: 'admin',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          duration: 150
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'warning',
          category: 'database',
          message: 'Query lenta detectada: SELECT * FROM reservations WHERE date > ?',
          details: { query: 'SELECT * FROM reservations WHERE date > ?', duration: 2500 },
          duration: 2500
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: 'error',
          category: 'api',
          message: 'Erro 500 na rota /api/admin/hoteis',
          details: { route: '/api/admin/hoteis', error: 'Database connection failed' },
          duration: 5000
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          level: 'info',
          category: 'backup',
          message: 'Backup automático concluído com sucesso',
          details: { size: '145.6 MB', duration: 180 },
          duration: 180
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 240000).toISOString(),
          level: 'critical',
          category: 'system',
          message: 'Uso de CPU acima de 90%',
          details: { cpu: 95, threshold: 90 },
          duration: 0
        }
      ];

      const mockAlerts: AlertRule[] = [
        {
          id: '1',
          name: 'CPU Alto',
          metric: 'cpu.usage',
          condition: 'gt',
          threshold: 80,
          enabled: true,
          severity: 'high',
          actions: ['email', 'slack', 'webhook']
        },
        {
          id: '2',
          name: 'Memória Baixa',
          metric: 'memory.available',
          condition: 'lt',
          threshold: 2 * 1024 * 1024 * 1024, // 2GB
          enabled: true,
          severity: 'medium',
          actions: ['email']
        },
        {
          id: '3',
          name: 'Disco Cheio',
          metric: 'disk.percentage',
          condition: 'gt',
          threshold: 90,
          enabled: true,
          severity: 'critical',
          actions: ['email', 'slack', 'webhook', 'sms']
        },
        {
          id: '4',
          name: 'Erros de API',
          metric: 'application.errors',
          condition: 'gt',
          threshold: 10,
          enabled: true,
          severity: 'high',
          actions: ['email', 'slack']
        }
      ];

      setMetrics(mockMetrics);
      setLogs(mockLogs);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
      setError('Erro ao carregar dados de monitoramento');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'debug': return <Bug className="h-4 w-4 text-gray-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      case 'debug': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
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
          <h1 className="text-3xl font-bold text-gray-900">Monitoramento do Sistema</h1>
          <p className="text-gray-600">Acompanhe performance, logs e alertas em tempo real</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label>Auto-refresh</Label>
          </div>
          <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1m</SelectItem>
              <SelectItem value="300">5m</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadMonitoringData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {metrics ? formatUptime(metrics.application.uptime) : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(metrics?.cpu.usage || 0, { warning: 70, critical: 90 })}`}>
                  {metrics?.cpu.usage || 0}%
                </div>
                <Progress value={metrics?.cpu.usage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground">
                  {metrics?.cpu.cores || 0} cores, {metrics?.cpu.temperature || 0}°C
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memória</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(metrics?.memory.percentage || 0, { warning: 80, critical: 95 })}`}>
                  {metrics?.memory.percentage || 0}%
                </div>
                <Progress value={metrics?.memory.percentage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground">
                  {formatBytes(metrics?.memory.used || 0)} / {formatBytes(metrics?.memory.total || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disco</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(metrics?.disk.percentage || 0, { warning: 85, critical: 95 })}`}>
                  {metrics?.disk.percentage || 0}%
                </div>
                <Progress value={metrics?.disk.percentage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground">
                  {formatBytes(metrics?.disk.used || 0)} / {formatBytes(metrics?.disk.total || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rede</CardTitle>
                <CardDescription>Estatísticas de rede</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Bytes In</p>
                    <p className="font-medium">{formatBytes(metrics?.network.bytesIn || 0)}/s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bytes Out</p>
                    <p className="font-medium">{formatBytes(metrics?.network.bytesOut || 0)}/s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pacotes In</p>
                    <p className="font-medium">{metrics?.network.packetsIn || 0}/s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pacotes Out</p>
                    <p className="font-medium">{metrics?.network.packetsOut || 0}/s</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conexões Ativas</p>
                  <p className="font-medium">{metrics?.network.connections || 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aplicação</CardTitle>
                <CardDescription>Métricas da aplicação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Requisições/min</p>
                    <p className="font-medium">{metrics?.application.requests || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Erros/min</p>
                    <p className="font-medium text-red-600">{metrics?.application.errors || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tempo de Resposta</p>
                    <p className="font-medium">{metrics?.application.responseTime || 0}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Versão</p>
                    <p className="font-medium">{metrics?.application.version || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Filtros de Log */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar nos logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showDetails ? 'Ocultar' : 'Detalhes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Logs */}
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getLogLevelIcon(log.level)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getLogLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{log.category}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{log.message}</p>
                        {showDetails && log.details && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        )}
                        {showDetails && (log.userId || log.ip || log.duration) && (
                          <div className="mt-2 text-xs text-gray-500">
                            {log.userId && <span>Usuário: {log.userId} </span>}
                            {log.ip && <span>IP: {log.ip} </span>}
                            {log.duration && <span>Duração: {log.duration}ms</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Regras de Alerta</h3>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">{alert.name}</h4>
                        <p className="text-sm text-gray-500">
                          {alert.metric} {alert.condition} {alert.threshold}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'high' ? 'default' :
                        alert.severity === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {alert.severity}
                      </Badge>
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={(checked) => {
                          setAlerts(alerts.map(a => 
                            a.id === alert.id ? { ...a, enabled: checked } : a
                          ));
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance da Aplicação</CardTitle>
                <CardDescription>Tempo de resposta e throughput</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Gráfico de performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
                <CardDescription>CPU, memória e disco ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Gráfico de recursos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 