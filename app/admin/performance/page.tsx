'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Pause,
  Play,
  RefreshCw,
  Settings,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  cacheHitRate: number;
  databaseConnections: number;
  activeUsers: number;
}

interface Optimization {
  id: string;
  name: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  applied: boolean;
  appliedAt?: string;
  metrics: {
    before: any;
    after: any;
  };
}

interface ScalingRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  action: string;
  enabled: boolean;
  lastTriggered?: string;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [scalingRules, setScalingRules] = useState<ScalingRule[]>([]);
  const [isAutoScalingEnabled, setIsAutoScalingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      setRefreshing(true);
      
      // Carregar métricas
      const metricsResponse = await fetch('/api/admin/performance/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Carregar otimizações
      const optimizationsResponse = await fetch('/api/admin/performance/optimizations');
      if (optimizationsResponse.ok) {
        const optimizationsData = await optimizationsResponse.json();
        setOptimizations(optimizationsData);
      }

      // Carregar regras de scaling
      const scalingResponse = await fetch('/api/admin/performance/scaling');
      if (scalingResponse.ok) {
        const scalingData = await scalingResponse.json();
        setScalingRules(scalingData.rules);
        setIsAutoScalingEnabled(scalingData.enabled);
      }

    } catch (error) {
      console.error('Erro ao carregar dados de performance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleAutoScaling = async () => {
    try {
      const response = await fetch('/api/admin/performance/scaling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isAutoScalingEnabled })
      });

      if (response.ok) {
        setIsAutoScalingEnabled(!isAutoScalingEnabled);
      }
    } catch (error) {
      console.error('Erro ao alternar auto-scaling:', error);
    }
  };

  const applyOptimization = async (optimizationId: string) => {
    try {
      const response = await fetch(`/api/admin/performance/optimizations/${optimizationId}`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadPerformanceData();
      }
    } catch (error) {
      console.error('Erro ao aplicar otimização:', error);
    }
  };

  const resetOptimization = async (optimizationId: string) => {
    try {
      const response = await fetch(`/api/admin/performance/optimizations/${optimizationId}/reset`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadPerformanceData();
      }
    } catch (error) {
      console.error('Erro ao resetar otimização:', error);
    }
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando métricas de performance...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance & Auto-Scaling</h1>
          <p className="text-muted-foreground">
            Monitoramento e otimização de performance em tempo real
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isAutoScalingEnabled ? "destructive" : "default"}
            onClick={toggleAutoScaling}
            className="flex items-center space-x-2"
          >
            {isAutoScalingEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isAutoScalingEnabled ? 'Parar' : 'Iniciar'} Auto-Scaling</span>
          </Button>
          <Button
            variant="outline"
            onClick={loadPerformanceData}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="optimizations">Otimizações</TabsTrigger>
          <TabsTrigger value="scaling">Auto-Scaling</TabsTrigger>
          <TabsTrigger value="metrics">Métricas Detalhadas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.cpu ? `${metrics.cpu.toFixed(1)}%` : 'N/A'}
                </div>
                <Progress 
                  value={metrics?.cpu || 0} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics?.cpu && metrics.cpu > 80 ? 'Alto uso' : 'Normal'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memória</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.memory ? `${metrics.memory.toFixed(1)}%` : 'N/A'}
                </div>
                <Progress 
                  value={metrics?.memory || 0} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics?.memory && metrics.memory > 85 ? 'Alto uso' : 'Normal'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.responseTime ? `${metrics.responseTime.toFixed(0)}ms` : 'N/A'}
                </div>
                <div className="flex items-center mt-2">
                  {metrics?.responseTime && metrics.responseTime > 2000 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-xs text-muted-foreground ml-1">
                    {metrics?.responseTime && metrics.responseTime > 2000 ? 'Lento' : 'Rápido'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.errorRate ? `${metrics.errorRate.toFixed(2)}%` : 'N/A'}
                </div>
                <div className="flex items-center mt-2">
                  {metrics?.errorRate && metrics.errorRate > 5 ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-xs text-muted-foreground ml-1">
                    {metrics?.errorRate && metrics.errorRate > 5 ? 'Alta' : 'Baixa'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          {(metrics?.cpu && metrics.cpu > 80) || (metrics?.memory && metrics.memory > 85) || (metrics?.errorRate && metrics.errorRate > 5) ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Atenção: Algumas métricas estão acima dos limites recomendados. 
                Considere aplicar otimizações ou verificar o auto-scaling.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Todas as métricas estão dentro dos limites normais. 
                Sistema funcionando adequadamente.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {optimizations.map((optimization) => (
              <Card key={optimization.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{optimization.name}</CardTitle>
                    <Badge className={getImpactColor(optimization.impact)}>
                      {optimization.impact.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>{optimization.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={optimization.applied ? "default" : "secondary"}>
                        {optimization.applied ? 'Aplicada' : 'Pendente'}
                      </Badge>
                    </div>
                    
                    {optimization.appliedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Aplicada em:</span>
                        <span className="text-sm">{new Date(optimization.appliedAt).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {!optimization.applied ? (
                        <Button 
                          size="sm" 
                          onClick={() => applyOptimization(optimization.id)}
                          className="flex-1"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Aplicar
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => resetOptimization(optimization.id)}
                          className="flex-1"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Resetar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scaling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Auto-Scaling</CardTitle>
              <CardDescription>
                Configure as regras que controlam o escalonamento automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scalingRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.metric} {rule.action} quando {'>'} {rule.threshold}
                      </p>
                      {rule.lastTriggered && (
                        <p className="text-xs text-muted-foreground">
                          Última execução: {new Date(rule.lastTriggered).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rede</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Requisições/segundo:</span>
                  <span className="font-medium">{metrics?.requestsPerSecond || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Hit Rate:</span>
                  <span className="font-medium">{metrics?.cacheHitRate ? `${metrics.cacheHitRate.toFixed(1)}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Usuários Ativos:</span>
                  <span className="font-medium">{metrics?.activeUsers || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Uso de Disco:</span>
                  <span className="font-medium">{metrics?.disk ? `${metrics.disk.toFixed(1)}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tráfego de Rede:</span>
                  <span className="font-medium">{metrics?.network ? `${metrics.network.toFixed(0)} req/s` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conexões DB:</span>
                  <span className="font-medium">{metrics?.databaseConnections || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 