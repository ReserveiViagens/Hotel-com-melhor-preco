'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Cpu,
  HardDrive,
  Network,
  Server,
  Shield,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  databaseConnections: number;
  cacheHitRate: number;
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      // Simular dados de monitoramento
      const mockMetrics: PerformanceMetrics = {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        responseTime: Math.random() * 5000,
        errorRate: Math.random() * 10,
        activeUsers: Math.floor(Math.random() * 1000),
        databaseConnections: Math.floor(Math.random() * 100),
        cacheHitRate: Math.random() * 100
      };

      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'suspicious_activity',
          severity: 'medium',
          message: 'Múltiplas tentativas de login detectadas',
          timestamp: new Date(Date.now() - 300000),
          resolved: false
        },
        {
          id: '2',
          type: 'rate_limit_exceeded',
          severity: 'low',
          message: 'Rate limit excedido para IP 192.168.1.100',
          timestamp: new Date(Date.now() - 600000),
          resolved: true
        }
      ];

      const mockHealth = {
        status: 'healthy',
        score: 85,
        issues: ['CPU usage alto']
      };

      setMetrics(mockMetrics);
      setSecurityEvents(mockEvents);
      setSystemHealth(mockHealth);
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
    }
  };

  const resolveSecurityEvent = async (eventId: string) => {
    setLoading(true);
    try {
      // Simular resolução
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecurityEvents(prev => 
        prev.map(event => 
          event.id === eventId ? { ...event, resolved: true } : event
        )
      );
    } catch (error) {
      console.error('Erro ao resolver evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento Avançado</h1>
          <p className="text-muted-foreground">
            Sistema de monitoramento com alertas inteligentes e análise de segurança
          </p>
        </div>
        <Button onClick={loadMonitoringData} disabled={loading} className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Status do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemHealth && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getHealthColor(systemHealth.status)}`}>
                      {systemHealth.status.toUpperCase()}
                    </div>
                    <p className="text-sm text-muted-foreground">Status Geral</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{systemHealth.score}/100</div>
                    <p className="text-sm text-muted-foreground">Score de Saúde</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{systemHealth.issues.length}</div>
                    <p className="text-sm text-muted-foreground">Problemas Ativos</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métricas Principais */}
          {metrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.cpuUsage.toFixed(1)}%</div>
                  <Progress value={metrics.cpuUsage} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memória</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
                  <Progress value={metrics.memoryUsage} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disco</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.diskUsage.toFixed(1)}%</div>
                  <Progress value={metrics.diskUsage} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.responseTime.toFixed(0)}ms</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.responseTime > 2000 ? 'Lento' : 'Normal'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {metrics && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Erro</span>
                      <span>{metrics.errorRate.toFixed(2)}%</span>
                    </div>
                    <Progress value={metrics.errorRate * 10} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Usuários Ativos</span>
                      <span>{metrics.activeUsers}</span>
                    </div>
                    <Progress value={(metrics.activeUsers / 1000) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conexões DB</span>
                      <span>{metrics.databaseConnections}</span>
                    </div>
                    <Progress value={(metrics.databaseConnections / 100) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cache Hit Rate</span>
                      <span>{metrics.cacheHitRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.cacheHitRate} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.cpuUsage > 80 && (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          CPU usage alto. Considere escalar recursos.
                        </AlertDescription>
                      </Alert>
                    )}
                    {metrics.memoryUsage > 85 && (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          Memória usage crítico. Otimize aplicação.
                        </AlertDescription>
                      </Alert>
                    )}
                    {metrics.responseTime > 2000 && (
                      <Alert>
                        <TrendingDown className="h-4 w-4" />
                        <AlertDescription>
                          Response time lento. Otimize queries.
                        </AlertDescription>
                      </Alert>
                    )}
                    {metrics.errorRate > 5 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Taxa de erro alta. Investigar problemas.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Eventos de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{event.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.resolved ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolvido
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => resolveSecurityEvent(event.id)}
                          disabled={loading}
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Configuração de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Regras de Alerta</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>CPU {'>'} 80%</span>
                      <Badge>Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Memória {'>'} 85%</span>
                      <Badge>Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Response Time {'>'} 2s</span>
                      <Badge>Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Error Rate {'>'} 5%</span>
                      <Badge>Ativo</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Notificações</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Slack</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>SMS (Crítico)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Telefone (Crítico)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 