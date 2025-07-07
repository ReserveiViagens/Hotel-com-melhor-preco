import { PrismaClient } from '@prisma/client';
import { gamificationService } from './gamification';
import { getCache, setCache, delCache } from './cache';

const prisma = new PrismaClient();

export interface DailyMission {
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
  progress: number; // 0-100
}

export interface MissionProgress {
  userId: string;
  missionId: string;
  current: number;
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
  claimedAt?: Date;
}

class DailyMissionService {
  private readonly MISSION_TEMPLATES = [
    // Missões de Reserva
    {
      id: 'daily_booking_1',
      title: 'Primeira Reserva do Dia',
      description: 'Faça uma reserva hoje',
      type: 'booking' as const,
      category: 'reservation',
      target: 1,
      reward: { points: 150 },
      difficulty: 'easy' as const
    },
    {
      id: 'daily_booking_2',
      title: 'Reservas Múltiplas',
      description: 'Faça 3 reservas em um dia',
      type: 'booking' as const,
      category: 'reservation',
      target: 3,
      reward: { points: 500, bonus: { type: 'discount', value: 10 } },
      difficulty: 'hard' as const
    },

    // Missões de Exploração
    {
      id: 'daily_explore_1',
      title: 'Explorador Urbano',
      description: 'Visite 2 atrações diferentes',
      type: 'exploration' as const,
      category: 'attractions',
      target: 2,
      reward: { points: 200 },
      difficulty: 'medium' as const
    },
    {
      id: 'daily_explore_2',
      title: 'Aventureiro',
      description: 'Visite 5 atrações em um dia',
      type: 'exploration' as const,
      category: 'attractions',
      target: 5,
      reward: { points: 800, bonus: { type: 'free_night', value: 1 } },
      difficulty: 'hard' as const
    },

    // Missões Sociais
    {
      id: 'daily_social_1',
      title: 'Influenciador',
      description: 'Compartilhe 3 ofertas nas redes sociais',
      type: 'social' as const,
      category: 'sharing',
      target: 3,
      reward: { points: 100 },
      difficulty: 'easy' as const
    },
    {
      id: 'daily_social_2',
      title: 'Crítico',
      description: 'Deixe 2 avaliações detalhadas',
      type: 'social' as const,
      category: 'reviews',
      target: 2,
      reward: { points: 250 },
      difficulty: 'medium' as const
    },

    // Missões de Lealdade
    {
      id: 'daily_loyalty_1',
      title: 'Visitante Fiel',
      description: 'Faça login por 3 dias consecutivos',
      type: 'loyalty' as const,
      category: 'login',
      target: 3,
      reward: { points: 300 },
      difficulty: 'medium' as const
    },
    {
      id: 'daily_loyalty_2',
      title: 'Cliente VIP',
      description: 'Gaste mais de R$ 500 em reservas',
      type: 'loyalty' as const,
      category: 'spending',
      target: 500,
      reward: { points: 600, bonus: { type: 'cashback', value: 5 } },
      difficulty: 'hard' as const
    },

    // Missões Especiais
    {
      id: 'daily_special_1',
      title: 'Madrugador',
      description: 'Faça uma reserva antes das 8h',
      type: 'special' as const,
      category: 'timing',
      target: 1,
      reward: { points: 400, bonus: { type: 'discount', value: 15 } },
      difficulty: 'medium' as const
    },
    {
      id: 'daily_special_2',
      title: 'Economista',
      description: 'Encontre e use um cupom de desconto',
      type: 'special' as const,
      category: 'coupons',
      target: 1,
      reward: { points: 200 },
      difficulty: 'easy' as const
    }
  ];

  // Gerar missões diárias para um usuário
  async generateDailyMissions(userId: string): Promise<DailyMission[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar se já gerou missões hoje
      const existingMissions = await prisma.userMission.findMany({
        where: {
          userId,
          createdAt: {
            gte: today
          }
        }
      });

      if (existingMissions.length > 0) {
        return this.getUserMissions(userId);
      }

      // Selecionar 3 missões aleatórias
      const selectedMissions = this.selectRandomMissions(3);
      const missions: DailyMission[] = [];

      for (const template of selectedMissions) {
        const expiresAt = new Date(today);
        expiresAt.setDate(expiresAt.getDate() + 1);

        const mission: DailyMission = {
          ...template,
          current: 0,
          completed: false,
          progress: 0,
          expiresAt
        };

        // Salvar missão no banco
        await prisma.userMission.create({
          data: {
            userId,
            missionId: template.id,
            title: template.title,
            description: template.description,
            type: template.type,
            category: template.category,
            target: template.target,
            current: 0,
            reward: JSON.stringify(template.reward),
            difficulty: template.difficulty,
            expiresAt,
            completed: false
          }
        });

        missions.push(mission);
      }

      return missions;
    } catch (error) {
      console.error('Erro ao gerar missões diárias:', error);
      return [];
    }
  }

  // Selecionar missões aleatórias
  private selectRandomMissions(count: number) {
    const shuffled = [...this.MISSION_TEMPLATES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Obter missões do usuário
  async getUserMissions(userId: string): Promise<DailyMission[]> {
    try {
      const cacheKey = `missions:${userId}`;
      const cached = await getCache<DailyMission[]>(cacheKey);
      if (cached) return cached;

      const userMissions = await prisma.userMission.findMany({
        where: {
          userId,
          completed: false,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const result = userMissions.map(mission => ({
        id: mission.missionId,
        title: mission.title,
        description: mission.description,
        type: mission.type as any,
        category: mission.category,
        target: mission.target,
        current: mission.current,
        reward: JSON.parse(mission.reward),
        difficulty: mission.difficulty as any,
        expiresAt: mission.expiresAt,
        completed: mission.completed,
        progress: mission.target > 0 ? (mission.current / mission.target) * 100 : 0
      }));
      await setCache(cacheKey, result, 300);
      return result;
    } catch (error) {
      console.error('Erro ao obter missões do usuário:', error);
      return [];
    }
  }

  // Atualizar progresso de uma missão
  async updateMissionProgress(
    userId: string, 
    missionId: string, 
    progress: number
  ): Promise<boolean> {
    try {
      const mission = await prisma.userMission.findFirst({
        where: {
          userId,
          missionId,
          completed: false
        }
      });

      if (!mission) return false;

      const newCurrent = Math.min(mission.current + progress, mission.target);
      const completed = newCurrent >= mission.target;

      await prisma.userMission.update({
        where: { id: mission.id },
        data: {
          current: newCurrent,
          completed,
          completedAt: completed ? new Date() : null
        }
      });

      // Se completou, adicionar pontos
      if (completed && !mission.claimed) {
        const reward = JSON.parse(mission.reward);
        await gamificationService.addPoints(userId, 'mission_complete', reward.points);
        
        // Aplicar bônus se houver
        if (reward.bonus) {
          await this.applyMissionBonus(userId, reward.bonus);
        }
      }

      await delCache(`missions:${userId}`);
      await delCache(`mission-stats:${userId}`);
      return completed;
    } catch (error) {
      console.error('Erro ao atualizar progresso da missão:', error);
      return false;
    }
  }

  // Aplicar bônus da missão
  private async applyMissionBonus(userId: string, bonus: any) {
    try {
      switch (bonus.type) {
        case 'discount':
          // Criar cupom de desconto
          await prisma.promotion.create({
            data: {
              name: `Bônus Missão - ${bonus.value}% OFF`,
              code: `MISSION_${Date.now()}`,
              type: 'percentage',
              discountType: 'percentage',
              discountValue: bonus.value,
              validFrom: new Date(),
              validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
              maxUses: 1,
              applicableModules: JSON.stringify(['hoteis', 'ingressos', 'atracoes']),
              conditions: JSON.stringify({ userId }),
              status: 'active'
            }
          });
          break;

        case 'free_night':
          // Adicionar noite grátis ao perfil
          await prisma.user.update({
            where: { id: userId },
            data: {
              segments: JSON.stringify(['free_night_available'])
            }
          });
          break;

        case 'cashback':
          // Adicionar cashback
          await gamificationService.addPoints(userId, 'cashback', bonus.value);
          break;
      }
    } catch (error) {
      console.error('Erro ao aplicar bônus da missão:', error);
    }
  }

  // Reivindicar recompensa da missão
  async claimMissionReward(userId: string, missionId: string): Promise<boolean> {
    try {
      const mission = await prisma.userMission.findFirst({
        where: {
          userId,
          missionId,
          completed: true,
          claimed: false
        }
      });

      if (!mission) return false;

      await prisma.userMission.update({
        where: { id: mission.id },
        data: {
          claimed: true,
          claimedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao reivindicar recompensa:', error);
      return false;
    }
  }

  // Obter estatísticas de missões
  async getMissionStats(userId: string): Promise<{
    totalMissions: number;
    completedMissions: number;
    totalPoints: number;
    streak: number;
    achievements: string[];
  }> {
    try {
      const cacheKey = `mission-stats:${userId}`;
      const cached = await getCache<any>(cacheKey);
      if (cached) return cached;

      const missions = await prisma.userMission.findMany({
        where: { userId }
      });

      const completedMissions = missions.filter(m => m.completed);
      const totalPoints = completedMissions.reduce((sum, m) => {
        const reward = JSON.parse(m.reward);
        return sum + reward.points;
      }, 0);

      // Calcular streak de missões completadas
      const streak = this.calculateMissionStreak(missions);

      // Conquistas especiais
      const achievements = this.getMissionAchievements(missions);

      const result = {
        totalMissions: missions.length,
        completedMissions: completedMissions.length,
        totalPoints,
        streak,
        achievements
      };
      await setCache(cacheKey, result, 300);
      return result;
    } catch (error) {
      console.error('Erro ao obter estatísticas de missões:', error);
      return {
        totalMissions: 0,
        completedMissions: 0,
        totalPoints: 0,
        streak: 0,
        achievements: []
      };
    }
  }

  // Calcular streak de missões
  private calculateMissionStreak(missions: any[]): number {
    const completedMissions = missions
      .filter(m => m.completed)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    if (completedMissions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < completedMissions.length; i++) {
      const missionDate = new Date(completedMissions[i].completedAt);
      missionDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (missionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Obter conquistas de missões
  private getMissionAchievements(missions: any[]): string[] {
    const achievements: string[] = [];
    const completedMissions = missions.filter(m => m.completed);

    if (completedMissions.length >= 10) {
      achievements.push('Missão Mestre');
    }
    if (completedMissions.length >= 50) {
      achievements.push('Missão Lenda');
    }
    if (completedMissions.length >= 100) {
      achievements.push('Missão Suprema');
    }

    // Verificar streak
    const streak = this.calculateMissionStreak(missions);
    if (streak >= 7) achievements.push('Semana Perfeita');
    if (streak >= 30) achievements.push('Mês Perfeito');

    return achievements;
  }

  // Limpar missões expiradas
  async cleanupExpiredMissions(): Promise<void> {
    try {
      await prisma.userMission.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          },
          completed: false
        }
      });

      console.log('Missões expiradas removidas');
    } catch (error) {
      console.error('Erro ao limpar missões expiradas:', error);
    }
  }
}

export const dailyMissionService = new DailyMissionService(); 