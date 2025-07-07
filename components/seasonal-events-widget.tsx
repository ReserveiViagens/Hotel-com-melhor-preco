'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Gift, 
  Star,
  Clock,
  Trophy,
  Sparkles,
  Play,
  CheckCircle
} from 'lucide-react';

interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'holiday' | 'festival' | 'promotion' | 'special';
  theme: string;
  rewards: {
    points: number;
    specialRewards: string[];
  };
  missions: EventMission[];
  active: boolean;
}

interface EventMission {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  reward: {
    points: number;
    specialItem?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export function SeasonalEventsWidget() {
  const [events, setEvents] = useState<SeasonalEvent[]>([]);
  const [userMissions, setUserMissions] = useState<EventMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        
        // Carregar missões do primeiro evento ativo
        if (data.length > 0) {
          await loadEventMissions(data[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventMissions = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/missions`);
      if (response.ok) {
        const data = await response.json();
        setUserMissions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar missões do evento:', error);
    }
  };

  const updateEventMissionProgress = async (
    eventId: string,
    missionId: string,
    progress: number
  ) => {
    try {
      setUpdating(missionId);
      const response = await fetch('/api/events/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, missionId, progress })
      });

      if (response.ok) {
        const { completed } = await response.json();
        if (completed) {
          await loadEventMissions(eventId);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso da missão:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'holiday': return '🏖️';
      case 'festival': return '🎉';
      case 'promotion': return '💰';
      case 'special': return '🎁';
      default: return '📅';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'holiday': return 'bg-blue-100 text-blue-800';
      case 'festival': return 'bg-purple-100 text-purple-800';
      case 'promotion': return 'bg-green-100 text-green-800';
      case 'special': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Eventos Sazonais
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
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          Eventos Sazonais
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              Nenhum evento ativo no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <Card key={event.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getEventIcon(event.type)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{event.name}</h3>
                        <p className="text-gray-600 text-sm">{event.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getEventColor(event.type)}>
                        {event.type}
                      </Badge>
                      <Badge variant="outline" className="text-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {getDaysRemaining(event.endDate)} dias
                      </Badge>
                    </div>
                  </div>

                  {/* Recompensas do Evento */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Recompensas Especiais
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="h-4 w-4" />
                        <span className="text-sm font-medium">+{event.rewards.points} pontos</span>
                      </div>
                      {event.rewards.specialRewards.map((reward, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {reward}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Missões do Evento */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Missões do Evento
                    </h4>
                    <div className="space-y-3">
                      {userMissions.map((mission) => (
                        <Card key={mission.id} className="border border-gray-200">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="font-medium text-sm">{mission.title}</h5>
                                <p className="text-xs text-gray-600">{mission.description}</p>
                              </div>
                              <Badge className={getDifficultyColor(mission.difficulty)}>
                                {mission.difficulty}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-yellow-600">
                                  <Star className="h-3 w-3" />
                                  <span className="text-xs font-medium">+{mission.reward.points}</span>
                                </div>
                                {mission.reward.specialItem && (
                                  <div className="flex items-center gap-1 text-purple-600">
                                    <Sparkles className="h-3 w-3" />
                                    <span className="text-xs font-medium">
                                      {mission.reward.specialItem}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateEventMissionProgress(event.id, mission.id, 1)}
                                  disabled={updating === mission.id}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateEventMissionProgress(event.id, mission.id, mission.target)}
                                  disabled={updating === mission.id}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Período do Evento */}
                  <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Início: {formatDate(event.startDate)}</span>
                      <span>Fim: {formatDate(event.endDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Informações sobre Eventos */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">Sobre Eventos Sazonais</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Eventos especiais com missões únicas e recompensas exclusivas</li>
            <li>• Participe para ganhar pontos extras e itens especiais</li>
            <li>• Eventos têm duração limitada - aproveite enquanto durar</li>
            <li>• Complete missões para desbloquear recompensas especiais</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 