import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'booking' | 'social' | 'exploration' | 'loyalty';
  requirements: {
    type: string;
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  level: number;
  experience: number;
  totalPoints: number;
  achievements: Achievement[];
  streak: number;
  lastActivity: Date;
}

class GamificationService {
  // Pontos por ação
  private readonly POINTS = {
    BOOKING: 100,
    REVIEW: 50,
    SHARE: 25,
    LOGIN_DAILY: 10,
    REFERRAL: 200,
    FIRST_BOOKING: 500,
    WEEKLY_STREAK: 100,
    MONTHLY_STREAK: 500
  };

  // Experiência necessária por nível
  private readonly XP_PER_LEVEL = 1000;

  // Conquistas disponíveis
  private readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first-booking',
      name: 'Primeira Reserva',
      description: 'Faça sua primeira reserva',
      icon: '🏨',
      points: 500,
      category: 'booking',
      requirements: { type: 'bookings', value: 1 },
      unlocked: false
    },
    {
      id: 'booking-master',
      name: 'Mestre das Reservas',
      description: 'Faça 10 reservas',
      icon: '👑',
      points: 1000,
      category: 'booking',
      requirements: { type: 'bookings', value: 10 },
      unlocked: false
    },
    {
      id: 'reviewer',
      name: 'Crítico',
      description: 'Deixe 5 avaliações',
      icon: '⭐',
      points: 250,
      category: 'social',
      requirements: { type: 'reviews', value: 5 },
      unlocked: false
    },
    {
      id: 'explorer',
      name: 'Explorador',
      description: 'Visite 3 atrações diferentes',
      icon: '🗺️',
      points: 300,
      category: 'exploration',
      requirements: { type: 'attractions', value: 3 },
      unlocked: false
    },
    {
      id: 'loyal-customer',
      name: 'Cliente Fiel',
      description: 'Faça reservas por 3 meses consecutivos',
      icon: '💎',
      points: 1000,
      category: 'loyalty',
      requirements: { type: 'monthly_streak', value: 3 },
      unlocked: false
    },
    {
      id: 'social-butterfly',
      name: 'Borboleta Social',
      description: 'Compartilhe 10 ofertas',
      icon: '🦋',
      points: 250,
      category: 'social',
      requirements: { type: 'shares', value: 10 },
      unlocked: false
    },
    {
      id: 'early-bird',
      name: 'Madrugador',
      description: 'Faça login por 7 dias consecutivos',
      icon: '🌅',
      points: 200,
      category: 'loyalty',
      requirements: { type: 'daily_streak', value: 7 },
      unlocked: false
    },
    {
      id: 'referral-king',
      name: 'Rei das Indicações',
      description: 'Indique 5 amigos',
      icon: '👥',
      points: 1000,
      category: 'social',
      requirements: { type: 'referrals', value: 5 },
      unlocked: false
    }
  ];

  // Adicionar pontos ao usuário
  async addPoints(userId: string, action: string, amount?: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          gamificationPoints: true, 
          gamificationLevel: true,
          gamificationExperience: true,
          lastLoginAt: true
        }
      });

      if (!user) throw new Error('Usuário não encontrado');

      const pointsToAdd = amount || this.POINTS[action as keyof typeof this.POINTS] || 0;
      const newPoints = (user.gamificationPoints || 0) + pointsToAdd;
      const newExperience = (user.gamificationExperience || 0) + pointsToAdd;

      // Calcular novo nível
      const newLevel = Math.floor(newExperience / this.XP_PER_LEVEL) + 1;
      const levelUp = newLevel > (user.gamificationLevel || 1);

      // Atualizar usuário
      await prisma.user.update({
        where: { id: userId },
        data: {
          gamificationPoints: newPoints,
          gamificationLevel: newLevel,
          gamificationExperience: newExperience,
          lastLoginAt: new Date()
        }
      });

      // Verificar conquistas
      await this.checkAchievements(userId);

      return {
        pointsAdded: pointsToAdd,
        totalPoints: newPoints,
        level: newLevel,
        experience: newExperience,
        levelUp,
        nextLevelXP: newLevel * this.XP_PER_LEVEL
      };
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      throw error;
    }
  }

  // Verificar conquistas do usuário
  async checkAchievements(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          reservations: true,
          reviews: true
        }
      });

      if (!user) return;

      const userStats = await this.getUserStats(userId);
      const unlockedAchievements: string[] = [];

      for (const achievement of this.ACHIEVEMENTS) {
        if (userStats.achievements.find(a => a.id === achievement.id)?.unlocked) {
          continue; // Já desbloqueada
        }

        let shouldUnlock = false;

        switch (achievement.requirements.type) {
          case 'bookings':
            shouldUnlock = user.reservations.length >= achievement.requirements.value;
            break;
          case 'reviews':
            shouldUnlock = user.reviews.length >= achievement.requirements.value;
            break;
          case 'attractions':
            const uniqueAttractions = new Set(user.reservations.map(r => r.hotelId)).size;
            shouldUnlock = uniqueAttractions >= achievement.requirements.value;
            break;
          case 'daily_streak':
            shouldUnlock = userStats.streak >= achievement.requirements.value;
            break;
          case 'monthly_streak':
            // Implementar lógica de streak mensal
            shouldUnlock = false;
            break;
          case 'shares':
            // Implementar contagem de compartilhamentos
            shouldUnlock = false;
            break;
          case 'referrals':
            // Implementar contagem de indicações
            shouldUnlock = false;
            break;
        }

        if (shouldUnlock) {
          await this.unlockAchievement(userId, achievement.id);
          unlockedAchievements.push(achievement.id);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      throw error;
    }
  }

  // Desbloquear conquista
  async unlockAchievement(userId: string, achievementId: string) {
    try {
      const achievement = this.ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return;

      // Verificar se já foi desbloqueada
      const existing = await prisma.userAchievement.findFirst({
        where: { userId, achievementId }
      });

      if (existing) return;

      // Salvar conquista desbloqueada
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId,
          unlockedAt: new Date()
        }
      });

      // Adicionar pontos da conquista
      await this.addPoints(userId, 'achievement', achievement.points);

      // Enviar notificação
      await this.sendAchievementNotification(userId, achievement);

      return achievement;
    } catch (error) {
      console.error('Erro ao desbloquear conquista:', error);
      throw error;
    }
  }

  // Obter estatísticas do usuário
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userAchievements: true
        }
      });

      if (!user) throw new Error('Usuário não encontrado');

      // Calcular streak
      const streak = await this.calculateStreak(userId);

      // Obter conquistas desbloqueadas
      const unlockedAchievements = user.userAchievements.map(ua => {
        const achievement = this.ACHIEVEMENTS.find(a => a.id === ua.achievementId);
        return {
          ...achievement!,
          unlocked: true,
          unlockedAt: ua.unlockedAt
        };
      });

      // Adicionar conquistas não desbloqueadas
      const lockedAchievements = this.ACHIEVEMENTS.filter(
        a => !unlockedAchievements.find(ua => ua.id === a.id)
      );

      const allAchievements = [...unlockedAchievements, ...lockedAchievements];

      return {
        level: user.gamificationLevel || 1,
        experience: user.gamificationExperience || 0,
        totalPoints: user.gamificationPoints || 0,
        achievements: allAchievements,
        streak,
        lastActivity: user.lastLoginAt || new Date()
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Calcular streak de login
  async calculateStreak(userId: string): Promise<number> {
    try {
      const loginHistory = await prisma.userLoginHistory.findMany({
        where: { userId },
        orderBy: { loginAt: 'desc' },
        take: 30 // Últimos 30 dias
      });

      if (loginHistory.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < loginHistory.length; i++) {
        const loginDate = new Date(loginHistory[i].loginAt);
        loginDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (loginDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Erro ao calcular streak:', error);
      return 0;
    }
  }

  // Registrar login diário
  async recordDailyLogin(userId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar se já registrou login hoje
      const existingLogin = await prisma.userLoginHistory.findFirst({
        where: {
          userId,
          loginAt: {
            gte: today
          }
        }
      });

      if (existingLogin) return;

      // Registrar login
      await prisma.userLoginHistory.create({
        data: {
          userId,
          loginAt: new Date()
        }
      });

      // Adicionar pontos de login diário
      await this.addPoints(userId, 'LOGIN_DAILY');

      // Verificar streak
      const streak = await this.calculateStreak(userId);
      
      // Bônus de streak semanal
      if (streak % 7 === 0) {
        await this.addPoints(userId, 'WEEKLY_STREAK');
      }

      // Bônus de streak mensal
      if (streak % 30 === 0) {
        await this.addPoints(userId, 'MONTHLY_STREAK');
      }

      return { streak };
    } catch (error) {
      console.error('Erro ao registrar login diário:', error);
      throw error;
    }
  }

  // Enviar notificação de conquista
  async sendAchievementNotification(userId: string, achievement: Achievement) {
    try {
      // Implementar envio de notificação push
      // await pushNotificationService.sendNotification(userId, {
      //   title: '🏆 Nova Conquista!',
      //   body: `Você desbloqueou: ${achievement.name}`,
      //   data: { type: 'achievement', achievementId: achievement.id }
      // });
    } catch (error) {
      console.error('Erro ao enviar notificação de conquista:', error);
    }
  }

  // Obter ranking de usuários
  async getLeaderboard(limit = 10) {
    try {
      const users = await prisma.user.findMany({
        where: {
          active: true,
          gamificationPoints: {
            gt: 0
          }
        },
        select: {
          id: true,
          name: true,
          gamificationPoints: true,
          gamificationLevel: true,
          avatar: true
        },
        orderBy: {
          gamificationPoints: 'desc'
        },
        take: limit
      });

      return users.map((user, index) => ({
        rank: index + 1,
        ...user
      }));
    } catch (error) {
      console.error('Erro ao obter leaderboard:', error);
      throw error;
    }
  }

  // Obter recompensas por nível
  getLevelRewards(level: number) {
    const rewards = {
      1: { discount: 0, title: 'Iniciante' },
      5: { discount: 5, title: 'Explorador' },
      10: { discount: 10, title: 'Viajante' },
      20: { discount: 15, title: 'Aventureiro' },
      30: { discount: 20, title: 'Mestre' },
      50: { discount: 25, title: 'Lenda' }
    };

    return rewards[level as keyof typeof rewards] || { discount: 0, title: 'Iniciante' };
  }
}

export const gamificationService = new GamificationService(); 