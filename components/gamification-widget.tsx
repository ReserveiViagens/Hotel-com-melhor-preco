'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Star, Target, Users, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface UserStats {
  level: number;
  experience: number;
  totalPoints: number;
  achievements: Achievement[];
  streak: number;
  lastActivity: string;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  gamificationPoints: number;
  gamificationLevel: number;
  avatar?: string;
}

export function GamificationWidget() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('progress');

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas do usuário
      const statsResponse = await fetch('/api/gamification');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Carregar leaderboard
      const leaderboardResponse = await fetch('/api/gamification/leaderboard?limit=10');
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (action: string, amount?: number) => {
    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, amount })
      });

      if (response.ok) {
        await loadGamificationData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Gamificação
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

  if (!stats) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Carregando gamificação...</p>
        </CardContent>
      </Card>
    );
  }

  const experienceToNextLevel = stats.level * 1000;
  const progressPercentage = (stats.experience % 1000) / 10;

  const unlockedAchievements = stats.achievements.filter(a => a.unlocked);
  const lockedAchievements = stats.achievements.filter(a => !a.unlocked);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Gamificação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            {/* Nível e Experiência */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">Nível {stats.level}</div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.experience} / {experienceToNextLevel} XP
              </div>
              <Progress value={progressPercentage} className="mt-2" />
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPoints}</div>
                <div className="text-xs text-gray-500">Pontos Totais</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.streak}</div>
                <div className="text-xs text-gray-500">Dias Consecutivos</div>
              </div>
            </div>

            {/* Ações de Teste */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Ações de Teste:</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  onClick={() => addPoints('BOOKING')}
                  className="text-xs"
                >
                  +100 Reserva
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => addPoints('REVIEW')}
                  className="text-xs"
                >
                  +50 Avaliação
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => addPoints('SHARE')}
                  className="text-xs"
                >
                  +25 Compartilhar
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => addPoints('LOGIN_DAILY')}
                  className="text-xs"
                >
                  +10 Login Diário
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {/* Conquistas Desbloqueadas */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Conquistas Desbloqueadas ({unlockedAchievements.length})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {unlockedAchievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-green-800">{achievement.name}</div>
                        <div className="text-sm text-green-600">{achievement.description}</div>
                        {achievement.unlockedAt && (
                          <div className="text-xs text-green-500">
                            Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +{achievement.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conquistas Bloqueadas */}
            {lockedAchievements.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Conquistas Disponíveis ({lockedAchievements.length})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {lockedAchievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{achievement.name}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                      </div>
                      <Badge variant="outline" className="text-gray-500">
                        +{achievement.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Users className="h-4 w-4" />
              Top 10 Jogadores
            </h4>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    index === 0 ? 'bg-yellow-50 border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border-gray-200' :
                    index === 2 ? 'bg-orange-50 border-orange-200' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-500 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-sm text-gray-500">Nível {entry.gamificationLevel}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{entry.gamificationPoints}</div>
                    <div className="text-xs text-gray-500">pontos</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 