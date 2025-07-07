'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Target, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Star,
  Clock
} from 'lucide-react';

interface Recommendation {
  type: 'mission' | 'event' | 'promotion';
  id: string;
  title: string;
  confidence: number;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

interface Predictions {
  churnProbability: number;
  nextAction: string;
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
}

export function RecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/recommendations?limit=5&predictions=true');
      if (!response.ok) {
        throw new Error('Erro ao carregar recomendações');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setPredictions(data.predictions || null);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      setError('Erro ao carregar recomendações');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mission': return <Target className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'promotion': return <Star className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-yellow-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNextActionText = (action: string) => {
    switch (action) {
      case 'mission_completion': return 'Completar missão';
      case 'event_participation': return 'Participar de evento';
      case 'login': return 'Fazer login';
      case 'exploration': return 'Explorar conteúdo';
      default: return 'Ação desconhecida';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Recomendações IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Recomendações IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={loadRecommendations}>
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Recomendações IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              Nenhuma recomendação disponível no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Predições de Comportamento */}
            {predictions && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Análise Preditiva
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Probabilidade de Churn</p>
                    <p className="text-lg font-semibold text-red-600">
                      {(predictions.churnProbability * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Próxima Ação</p>
                    <p className="text-sm font-medium text-blue-600">
                      {getNextActionText(predictions.nextAction)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tendência de Engajamento</p>
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(predictions.engagementTrend)}
                      <span className="text-sm font-medium capitalize">
                        {predictions.engagementTrend}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Recomendações */}
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Card key={rec.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(rec.type)}
                          <div>
                            <h4 className="font-medium">{rec.title}</h4>
                            <p className="text-sm text-gray-600">{rec.reason}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <div className="flex items-center gap-1 text-purple-600">
                          <Star className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {(rec.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Confiança da IA</span>
                        <span>{(rec.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={rec.confidence * 100} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Recomendação #{index + 1}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Informações sobre IA */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">Sobre as Recomendações IA</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Baseadas no seu histórico de atividades e preferências</li>
            <li>• Utilizam Machine Learning para personalização</li>
            <li>• Atualizadas em tempo real conforme seu comportamento</li>
            <li>• Otimizadas para maximizar seu engajamento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 