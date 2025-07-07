'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Zap,
  Lightbulb,
  Activity,
  Star,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';

interface Recommendation {
  itemId: string;
  itemType: string;
  score: number;
  reason: string;
  confidence: number;
}

interface Prediction {
  type: string;
  value: number;
  confidence: number;
  factors: string[];
}

interface UserProfile {
  userId: string;
  preferences: {
    budget: string;
    travelStyle: string;
    preferredDestinations: string[];
    preferredActivities: string[];
  };
  demographics: {
    age: number;
    location: string;
  };
}

export default function MLPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    loadMLData();
  }, []);

  const loadMLData = async () => {
    try {
      // Simular dados de ML
      const mockRecommendations: Recommendation[] = [
        {
          itemId: 'hotel-1',
          itemType: 'hotel',
          score: 95,
          reason: 'Baseado em suas preferências de hotel',
          confidence: 0.92
        },
        {
          itemId: 'attraction-1',
          itemType: 'attraction',
          score: 88,
          reason: 'Usuários similares gostaram deste item',
          confidence: 0.85
        },
        {
          itemId: 'ticket-1',
          itemType: 'ticket',
          score: 82,
          reason: 'Corresponde ao seu estilo de viagem',
          confidence: 0.78
        }
      ];

      const mockPredictions: Prediction[] = [
        {
          type: 'demand',
          value: 150,
          confidence: 0.85,
          factors: ['Histórico de vendas', 'Sazonalidade', 'Marketing ativo']
        },
        {
          type: 'price',
          value: 299,
          confidence: 0.80,
          factors: ['Preços similares', 'Demanda atual', 'Custos operacionais']
        },
        {
          type: 'conversion',
          value: 75,
          confidence: 0.75,
          factors: ['Engajamento do usuário', 'Relevância do item', 'Sensibilidade ao preço']
        }
      ];

      const mockProfile: UserProfile = {
        userId: 'user-123',
        preferences: {
          budget: 'medium',
          travelStyle: 'relaxation',
          preferredDestinations: ['Caldas Novas', 'Rio de Janeiro'],
          preferredActivities: ['Parques aquáticos', 'Hotéis']
        },
        demographics: {
          age: 35,
          location: 'São Paulo'
        }
      };

      setRecommendations(mockRecommendations);
      setPredictions(mockPredictions);
      setUserProfile(mockProfile);
    } catch (error) {
      console.error('Erro ao carregar dados de ML:', error);
    }
  };

  const generateRecommendations = async () => {
    if (!userId) {
      setMessage('Por favor, insira um ID de usuário');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Simular geração de recomendações
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newRecommendations: Recommendation[] = [
        {
          itemId: 'hotel-2',
          itemType: 'hotel',
          score: Math.floor(Math.random() * 100),
          reason: 'Recomendação personalizada baseada em ML',
          confidence: Math.random()
        },
        {
          itemId: 'attraction-2',
          itemType: 'attraction',
          score: Math.floor(Math.random() * 100),
          reason: 'Análise de comportamento do usuário',
          confidence: Math.random()
        }
      ];

      setRecommendations(prev => [...newRecommendations, ...prev]);
      setMessage('Recomendações geradas com sucesso!');
    } catch (error) {
      setMessage('Erro ao gerar recomendações');
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Simular geração de previsões
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPredictions: Prediction[] = [
        {
          type: 'demand',
          value: Math.floor(Math.random() * 200) + 50,
          confidence: Math.random(),
          factors: ['Análise de tendências', 'Dados históricos', 'Fatores sazonais']
        },
        {
          type: 'churn',
          value: Math.floor(Math.random() * 30),
          confidence: Math.random(),
          factors: ['Engajamento', 'Satisfação', 'Última atividade']
        }
      ];

      setPredictions(prev => [...newPredictions, ...prev]);
      setMessage('Previsões geradas com sucesso!');
    } catch (error) {
      setMessage('Erro ao gerar previsões');
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Simular treinamento do modelo
      await new Promise(resolve => setTimeout(resolve, 5000));
      setMessage('Modelo treinado com sucesso!');
    } catch (error) {
      setMessage('Erro ao treinar modelo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Machine Learning Avançado</h1>
          <p className="text-muted-foreground">
            Sistema de ML para recomendações personalizadas e análise preditiva
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={trainModel} disabled={loading} className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Treinar Modelo
          </Button>
        </div>
      </div>

      {message && (
        <Alert className={message.includes('sucesso') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="profiles">Perfis</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Gerar Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="userId">ID do Usuário</Label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Digite o ID do usuário"
                  />
                </div>
                <Button onClick={generateRecommendations} disabled={loading} className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Gerar
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">{rec.itemType}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800">
                      {rec.score}%
                    </Badge>
                  </div>
                  <CardDescription>
                    ID: {rec.itemId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{rec.reason}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confiança</span>
                      <span>{(rec.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={rec.confidence * 100} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3" />
                    <span>Recomendação ML</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Gerar Previsões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={generatePredictions} disabled={loading} className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Gerar Previsões
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predictions.map((pred, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">{pred.type}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">
                      {(pred.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">{pred.value}</div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Fatores:</p>
                    <ul className="text-xs space-y-1">
                      {pred.factors.map((factor, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          {userProfile && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Perfil do Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>ID do Usuário</Label>
                    <p className="text-sm text-muted-foreground">{userProfile.userId}</p>
                  </div>
                  <div>
                    <Label>Idade</Label>
                    <p className="text-sm text-muted-foreground">{userProfile.demographics.age} anos</p>
                  </div>
                  <div>
                    <Label>Localização</Label>
                    <p className="text-sm text-muted-foreground">{userProfile.demographics.location}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Preferências
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Orçamento</Label>
                    <Badge className="capitalize">{userProfile.preferences.budget}</Badge>
                  </div>
                  <div>
                    <Label>Estilo de Viagem</Label>
                    <Badge className="capitalize">{userProfile.preferences.travelStyle}</Badge>
                  </div>
                  <div>
                    <Label>Destinos Preferidos</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userProfile.preferences.preferredDestinations.map((dest, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {dest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Atividades Preferidas</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userProfile.preferences.preferredActivities.map((activity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Precisão do Modelo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85.2%</div>
                <p className="text-sm text-muted-foreground">Taxa de acerto</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Último Treinamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2h atrás</div>
                <p className="text-sm text-muted-foreground">Modelo atualizado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  ROI ML
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+23.5%</div>
                <p className="text-sm text-muted-foreground">Aumento em vendas</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Precisão</span>
                      <span>85.2%</span>
                    </div>
                    <Progress value={85.2} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Recall</span>
                      <span>78.9%</span>
                    </div>
                    <Progress value={78.9} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>F1-Score</span>
                      <span>81.8%</span>
                    </div>
                    <Progress value={81.8} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Melhorias Recentes</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Precisão +5.2%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Recall +3.1%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Tempo de resposta -15%</span>
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