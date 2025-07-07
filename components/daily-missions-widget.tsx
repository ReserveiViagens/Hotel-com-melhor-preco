'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Trophy, 
  Clock, 
  Star,
  Gift,
  CheckCircle,
  Play,
  RefreshCw
} from 'lucide-react';

interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: 'booking' | 'exploration' | 'social' | 'loyalty' | 'special';
  category: string;
  target: number;
  current: number;
  reward: {
    points: number;
    bonus?: {
      type: 'discount' | 'free_night' | 'upgrade' | 'cashback';
      value: number;
    };
  };
  difficulty: 'easy' | 'medium' | 'hard';
  expiresAt: Date;
  completed: boolean;
  progress: number;
}

export function DailyMissionsWidget() {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/missions');
      if (response.ok) {
        const data = await response.json();
        setMissions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewMissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/missions', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setMissions(data);
      }
    } catch (error) {
      console.error('Erro ao gerar missões:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (missionId: string, progress: number) => {
    try {
      setUpdating(missionId);
      const response = await fetch('/api/missions/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, progress })
      });

      if (response.ok) {
        const { completed } = await response.json();
        if (completed) {
          // Recarregar missões para atualizar status
          await loadMissions();
        } else {
          // Atualizar progresso localmente
          setMissions(prev => prev.map(mission => 
            mission.id === missionId 
              ? { 
                  ...mission, 
                  current: Math.min(mission.current + progress, mission.target),
                  progress: Math.min(mission.current + progress, mission.target) / mission.target * 100
                }
              : mission
          ));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return '🏨';
      case 'exploration': return '🗺️';
      case 'social': return '📱';
      case 'loyalty': return '💎';
      case 'special': return '⭐';
      default: return '🎯';
    }
  };

  const getBonusText = (bonus: any) => {
    if (!bonus) return '';
    
    switch (bonus.type) {
      case 'discount': return `${bonus.value}% desconto`;
      case 'free_night': return `${bonus.value} noite grátis`;
      case 'upgrade': return `Upgrade de quarto`;
      case 'cashback': return `${bonus.value}% cashback`;
      default: return 'Bônus especial';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Missões Diárias
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Missões Diárias
          </CardTitle>
          <Button 
            size="sm" 
            onClick={generateNewMissions}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Novas Missões
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {missions.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">
              Nenhuma missão disponível hoje.
            </p>
            <Button onClick={generateNewMissions}>
              Gerar Missões
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => (
              <Card 
                key={mission.id} 
                className={`border-l-4 ${
                  mission.completed 
                    ? 'border-l-green-500 bg-green-50' 
                    : 'border-l-blue-500'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(mission.type)}</span>
                      <div>
                        <h4 className="font-semibold">{mission.title}</h4>
                        <p className="text-sm text-gray-600">{mission.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(mission.difficulty)}>
                        {mission.difficulty}
                      </Badge>
                      {mission.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progresso: {mission.current}/{mission.target}</span>
                      <span>{Math.round(mission.progress)}%</span>
                    </div>
                    <Progress value={mission.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="h-4 w-4" />
                        <span className="text-sm font-medium">+{mission.reward.points}</span>
                      </div>
                      {mission.reward.bonus && (
                        <div className="flex items-center gap-1 text-purple-600">
                          <Gift className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {getBonusText(mission.reward.bonus)}
                          </span>
                        </div>
                      )}
                    </div>

                    {!mission.completed && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateProgress(mission.id, 1)}
                          disabled={updating === mission.id}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          +1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProgress(mission.id, mission.target - mission.current)}
                          disabled={updating === mission.id}
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          Completar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      Expira em: {new Date(mission.expiresAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Dicas para Missões</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Complete missões diariamente para ganhar pontos extras</li>
            <li>• Missões difíceis oferecem recompensas especiais</li>
            <li>• Mantenha um streak para bônus adicionais</li>
            <li>• Use os bônus antes que expirem</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 