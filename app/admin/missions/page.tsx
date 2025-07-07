'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Trophy, 
  Star,
  TrendingUp,
  Calendar,
  Award,
  Sparkles
} from 'lucide-react';

const DailyMissionsWidget = dynamic(() => import('@/components/daily-missions-widget').then(m => m.DailyMissionsWidget), {
  loading: () => <div className="p-6 text-center text-gray-500">Carregando missões...</div>,
  ssr: false
});
const SeasonalEventsWidget = dynamic(() => import('@/components/seasonal-events-widget').then(m => m.SeasonalEventsWidget), {
  loading: () => <div className="p-6 text-center text-gray-500">Carregando eventos...</div>,
  ssr: false
});

export default function MissionsPage() {
  const [stats, setStats] = useState({
    totalMissions: 0,
    completedMissions: 0,
    totalPoints: 0,
    streak: 0,
    achievements: [] as string[]
  });

  const loadStats = async () => {
    try {
      const response = await fetch('/api/missions/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Missões</h1>
          <p className="text-gray-600 mt-2">
            Gerencie missões diárias e gamificação avançada
          </p>
        </div>
        <Button onClick={loadStats}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Atualizar Stats
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Missões</p>
                <p className="text-2xl font-bold">{stats.totalMissions}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missões Completadas</p>
                <p className="text-2xl font-bold">{stats.completedMissions}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pontos Totais</p>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Streak Atual</p>
                <p className="text-2xl font-bold">{stats.streak} dias</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conquistas */}
      {stats.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Conquistas Desbloqueadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {achievement}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs para Missões e Eventos */}
      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Missões Diárias
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Eventos Sazonais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-6">
          <DailyMissionsWidget />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <SeasonalEventsWidget />
        </TabsContent>
      </Tabs>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Sistema de Gamificação Avançada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Missões Diárias</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>🏨</span>
                  <span><strong>Reserva:</strong> Missões relacionadas a reservas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🗺️</span>
                  <span><strong>Exploração:</strong> Visitar atrações e locais</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📱</span>
                  <span><strong>Social:</strong> Compartilhamento e avaliações</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>💎</span>
                  <span><strong>Lealdade:</strong> Login e gastos recorrentes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>⭐</span>
                  <span><strong>Especiais:</strong> Missões únicas e temporárias</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Eventos Sazonais</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>🏖️</span>
                  <span><strong>Férias:</strong> Eventos de verão e feriados</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🎉</span>
                  <span><strong>Festivais:</strong> Carnaval, festas regionais</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>💰</span>
                  <span><strong>Promoções:</strong> Black Friday, ofertas especiais</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🎁</span>
                  <span><strong>Especiais:</strong> Aniversários, eventos únicos</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Recompensas</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span><strong>Pontos:</strong> Acumule para desbloquear benefícios</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🎫</span>
                  <span><strong>Descontos:</strong> Cupons de desconto especiais</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🏨</span>
                  <span><strong>Noites Grátis:</strong> Hospedagem sem custo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>💳</span>
                  <span><strong>Cashback:</strong> Retorno em dinheiro</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>⭐</span>
                  <span><strong>Upgrades:</strong> Melhorias de serviço</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Benefícios Avançados</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span><strong>Conquistas:</strong> Desbloqueie títulos especiais</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span><strong>Streaks:</strong> Bônus por consistência</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span><strong>Itens Especiais:</strong> Recompensas exclusivas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span><strong>Eventos Limitados:</strong> Oportunidades únicas</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Como Funciona</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Novas missões são geradas automaticamente todos os dias</li>
              <li>Eventos sazonais oferecem missões especiais e recompensas únicas</li>
              <li>Complete missões para ganhar pontos e recompensas especiais</li>
              <li>Mantenha um streak de missões completadas para bônus adicionais</li>
              <li>Use as recompensas antes que expirem</li>
              <li>Desbloqueie conquistas especiais com progresso consistente</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 