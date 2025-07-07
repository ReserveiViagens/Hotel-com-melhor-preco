import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  BarChart3,
  RefreshCw,
  Sparkles,
  Target,
  Calendar,
  Star
} from 'lucide-react';

// Componente de loading
function RecommendationsLoading() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente de estatísticas de ML
function MLStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Analisados</p>
              <p className="text-2xl font-bold text-purple-600">1,247</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Aceitação</p>
              <p className="text-2xl font-bold text-green-600">87.3%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Precisão da IA</p>
              <p className="text-2xl font-bold text-blue-600">94.2%</p>
            </div>
            <Brain className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Engajamento Médio</p>
              <p className="text-2xl font-bold text-orange-600">+23%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de tipos de recomendação
function RecommendationTypes() {
  const types = [
    {
      type: 'mission',
      title: 'Missões Personalizadas',
      description: 'Missões adaptadas ao seu perfil e histórico',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      count: 156
    },
    {
      type: 'event',
      title: 'Eventos Especiais',
      description: 'Eventos recomendados baseados em seus interesses',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      count: 89
    },
    {
      type: 'promotion',
      title: 'Promoções Inteligentes',
      description: 'Ofertas personalizadas para maximizar conversão',
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      count: 234
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {types.map((item) => (
        <Card key={item.type} className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{item.count} ativas</Badge>
              <Button size="sm" variant="outline">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Componente de insights de ML
function MLInsights() {
  const insights = [
    {
      title: 'Padrão de Horário',
      description: 'Usuários são mais ativos entre 18h-22h',
      confidence: 92,
      trend: 'up',
      color: 'text-green-600'
    },
    {
      title: 'Preferência de Dificuldade',
      description: '70% preferem missões de dificuldade média',
      confidence: 88,
      trend: 'stable',
      color: 'text-blue-600'
    },
    {
      title: 'Tipo de Evento',
      description: 'Eventos sazonais têm 40% mais engajamento',
      confidence: 95,
      trend: 'up',
      color: 'text-green-600'
    },
    {
      title: 'Retenção de Usuários',
      description: 'Usuários com 3+ missões completadas têm 85% de retenção',
      confidence: 91,
      trend: 'up',
      color: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                {insight.confidence}%
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${insight.color}`} />
              <span className="text-sm font-medium">Alta Confiança</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Sistema de Recomendações IA
          </h1>
          <p className="text-gray-600 mt-2">
            Machine Learning para personalização e otimização de engajamento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Treinar Modelo
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <MLStats />

      {/* Tipos de Recomendação */}
      <RecommendationTypes />

      {/* Tabs de Funcionalidades */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Recomendações em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<RecommendationsLoading />}>
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sistema de Recomendações IA
                  </h3>
                  <p className="text-gray-600 mb-4">
                    As recomendações são geradas dinamicamente usando Machine Learning
                    baseado no comportamento e preferências dos usuários.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Badge variant="outline" className="text-purple-600">
                      <Target className="h-3 w-3 mr-1" />
                      Missões Personalizadas
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      Eventos Inteligentes
                    </Badge>
                    <Badge variant="outline" className="text-blue-600">
                      <Star className="h-3 w-3 mr-1" />
                      Promoções Otimizadas
                    </Badge>
                  </div>
                </div>
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Insights de Machine Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MLInsights />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Analytics de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Métricas de Engajamento</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Taxa de Clique</span>
                      <span className="font-medium">23.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Conversão</span>
                      <span className="font-medium">12.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Retenção</span>
                      <span className="font-medium">78.5%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Performance da IA</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Precisão</span>
                      <span className="font-medium">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Recall</span>
                      <span className="font-medium">89.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">F1-Score</span>
                      <span className="font-medium">91.8%</span>
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