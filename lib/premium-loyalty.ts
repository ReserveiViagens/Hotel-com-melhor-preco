import { PrismaClient } from '@prisma/client';
import { redis } from './cache';

const prisma = new PrismaClient();

export interface LoyaltyTier {
  id: string;
  name: string;
  level: number;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  discountPercentage: number;
  prioritySupport: boolean;
  exclusiveAccess: boolean;
  monthlyReward: number;
}

export interface UserLoyalty {
  userId: string;
  currentTier: LoyaltyTier;
  totalPoints: number;
  lifetimePoints: number;
  monthlyPoints: number;
  streakDays: number;
  lastActivity: Date;
  benefits: string[];
  nextTierProgress: number;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  tierRequired: number;
  type: 'discount' | 'free_night' | 'upgrade' | 'experience' | 'cashback';
  value: number;
  maxUses: number;
  currentUses: number;
  expiresAt?: Date;
}

class PremiumLoyaltyService {
  private tiers: LoyaltyTier[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      level: 1,
      minPoints: 0,
      maxPoints: 999,
      benefits: [
        '5% de desconto em reservas',
        'Suporte por email',
        'Newsletter exclusiva'
      ],
      discountPercentage: 5,
      prioritySupport: false,
      exclusiveAccess: false,
      monthlyReward: 0
    },
    {
      id: 'silver',
      name: 'Prata',
      level: 2,
      minPoints: 1000,
      maxPoints: 4999,
      benefits: [
        '10% de desconto em reservas',
        'Suporte prioritário',
        'Check-in antecipado',
        'WiFi gratuito',
        'Recompensa mensal de 100 pontos'
      ],
      discountPercentage: 10,
      prioritySupport: true,
      exclusiveAccess: false,
      monthlyReward: 100
    },
    {
      id: 'gold',
      name: 'Ouro',
      level: 3,
      minPoints: 5000,
      maxPoints: 19999,
      benefits: [
        '15% de desconto em reservas',
        'Suporte VIP 24/7',
        'Upgrade de quarto',
        'Late check-out',
        'Estacionamento gratuito',
        'Recompensa mensal de 250 pontos',
        'Acesso a eventos exclusivos'
      ],
      discountPercentage: 15,
      prioritySupport: true,
      exclusiveAccess: true,
      monthlyReward: 250
    },
    {
      id: 'platinum',
      name: 'Platina',
      level: 4,
      minPoints: 20000,
      maxPoints: 99999,
      benefits: [
        '20% de desconto em reservas',
        'Concierge pessoal',
        'Suite upgrade garantido',
        'Transfer gratuito',
        'Spa credit',
        'Recompensa mensal de 500 pontos',
        'Acesso a experiências únicas',
        'Cashback de 2%'
      ],
      discountPercentage: 20,
      prioritySupport: true,
      exclusiveAccess: true,
      monthlyReward: 500
    },
    {
      id: 'diamond',
      name: 'Diamante',
      level: 5,
      minPoints: 100000,
      maxPoints: Infinity,
      benefits: [
        '25% de desconto em reservas',
        'Butler service',
        'Suite presidencial',
        'Helicopter transfer',
        'Spa unlimited',
        'Recompensa mensal de 1000 pontos',
        'Experiências personalizadas',
        'Cashback de 5%',
        'Status vitalício'
      ],
      discountPercentage: 25,
      prioritySupport: true,
      exclusiveAccess: true,
      monthlyReward: 1000
    }
  ];

  // Obter informações de fidelidade do usuário
  async getUserLoyalty(userId: string): Promise<UserLoyalty> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userMissions: true,
          userAchievements: true,
          bookings: true
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Calcular pontos totais
      const totalPoints = user.points || 0;
      const lifetimePoints = await this.calculateLifetimePoints(userId);
      const monthlyPoints = await this.calculateMonthlyPoints(userId);
      const streakDays = await this.calculateStreakDays(userId);

      // Determinar tier atual
      const currentTier = this.getTierByPoints(totalPoints);
      const nextTier = this.getNextTier(currentTier);
      const nextTierProgress = nextTier ? 
        ((totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

      return {
        userId,
        currentTier,
        totalPoints,
        lifetimePoints,
        monthlyPoints,
        streakDays,
        lastActivity: user.lastActivity || new Date(),
        benefits: currentTier.benefits,
        nextTierProgress: Math.min(nextTierProgress, 100)
      };
    } catch (error) {
      console.error('Erro ao obter fidelidade do usuário:', error);
      throw error;
    }
  }

  // Adicionar pontos ao usuário
  async addPoints(userId: string, points: number, reason: string): Promise<{
    newTotal: number;
    tierUpgrade?: LoyaltyTier;
    rewards?: string[];
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const currentPoints = user.points || 0;
      const currentTier = this.getTierByPoints(currentPoints);
      const newTotal = currentPoints + points;
      const newTier = this.getTierByPoints(newTotal);

      // Atualizar pontos do usuário
      await prisma.user.update({
        where: { id: userId },
        data: { 
          points: newTotal,
          lastActivity: new Date()
        }
      });

      // Registrar transação de pontos
      await prisma.pointsTransaction.create({
        data: {
          userId,
          points,
          reason,
          balance: newTotal,
          timestamp: new Date()
        }
      });

      // Verificar upgrade de tier
      let tierUpgrade: LoyaltyTier | undefined;
      let rewards: string[] = [];

      if (newTier.level > currentTier.level) {
        tierUpgrade = newTier;
        rewards = await this.processTierUpgrade(userId, newTier);
      }

      // Atualizar cache
      await redis.del(`loyalty:${userId}`);

      return {
        newTotal,
        tierUpgrade,
        rewards
      };
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      throw error;
    }
  }

  // Processar upgrade de tier
  private async processTierUpgrade(userId: string, newTier: LoyaltyTier): Promise<string[]> {
    const rewards: string[] = [];

    // Recompensa de upgrade
    const upgradeReward = newTier.level * 100;
    await this.addPoints(userId, upgradeReward, `Upgrade para ${newTier.name}`);
    rewards.push(`${upgradeReward} pontos de bônus por upgrade`);

    // Benefícios especiais
    if (newTier.prioritySupport) {
      rewards.push('Suporte prioritário ativado');
    }

    if (newTier.exclusiveAccess) {
      rewards.push('Acesso a eventos exclusivos');
    }

    // Notificar usuário
    await this.sendTierUpgradeNotification(userId, newTier);

    return rewards;
  }

  // Obter recompensas disponíveis
  async getAvailableRewards(userId: string): Promise<LoyaltyReward[]> {
    try {
      const userLoyalty = await this.getUserLoyalty(userId);
      
      const rewards: LoyaltyReward[] = [
        {
          id: 'discount_10',
          name: 'Desconto de 10%',
          description: 'Desconto de 10% em sua próxima reserva',
          pointsCost: 500,
          tierRequired: 1,
          type: 'discount',
          value: 10,
          maxUses: 1,
          currentUses: 0
        },
        {
          id: 'free_night',
          name: 'Noite Grátis',
          description: 'Uma noite grátis em hotel selecionado',
          pointsCost: 2000,
          tierRequired: 2,
          type: 'free_night',
          value: 100,
          maxUses: 1,
          currentUses: 0
        },
        {
          id: 'room_upgrade',
          name: 'Upgrade de Quarto',
          description: 'Upgrade para quarto superior',
          pointsCost: 1000,
          tierRequired: 2,
          type: 'upgrade',
          value: 50,
          maxUses: 3,
          currentUses: 0
        },
        {
          id: 'spa_experience',
          name: 'Experiência no Spa',
          description: 'Tratamento de spa de 60 minutos',
          pointsCost: 1500,
          tierRequired: 3,
          type: 'experience',
          value: 200,
          maxUses: 2,
          currentUses: 0
        },
        {
          id: 'cashback_50',
          name: 'Cashback R$ 50',
          description: 'Cashback de R$ 50 em sua conta',
          pointsCost: 1000,
          tierRequired: 1,
          type: 'cashback',
          value: 50,
          maxUses: 5,
          currentUses: 0
        }
      ];

      // Filtrar por tier do usuário
      return rewards.filter(reward => reward.tierRequired <= userLoyalty.currentTier.level);
    } catch (error) {
      console.error('Erro ao obter recompensas:', error);
      return [];
    }
  }

  // Resgatar recompensa
  async redeemReward(userId: string, rewardId: string): Promise<{
    success: boolean;
    message: string;
    reward?: LoyaltyReward;
  }> {
    try {
      const userLoyalty = await this.getUserLoyalty(userId);
      const availableRewards = await this.getAvailableRewards(userId);
      
      const reward = availableRewards.find(r => r.id === rewardId);
      if (!reward) {
        return {
          success: false,
          message: 'Recompensa não encontrada'
        };
      }

      if (userLoyalty.totalPoints < reward.pointsCost) {
        return {
          success: false,
          message: 'Pontos insuficientes para resgatar esta recompensa'
        };
      }

      // Deduzir pontos
      await this.addPoints(userId, -reward.pointsCost, `Resgate: ${reward.name}`);

      // Registrar resgate
      await prisma.rewardRedemption.create({
        data: {
          userId,
          rewardId: reward.id,
          rewardName: reward.name,
          pointsCost: reward.pointsCost,
          redeemedAt: new Date()
        }
      });

      // Processar recompensa específica
      await this.processRewardRedemption(userId, reward);

      return {
        success: true,
        message: `Recompensa "${reward.name}" resgatada com sucesso!`,
        reward
      };
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      return {
        success: false,
        message: 'Erro ao processar resgate da recompensa'
      };
    }
  }

  // Processar resgate de recompensa
  private async processRewardRedemption(userId: string, reward: LoyaltyReward): Promise<void> {
    switch (reward.type) {
      case 'discount':
        await this.applyDiscount(userId, reward.value);
        break;
      case 'free_night':
        await this.grantFreeNight(userId);
        break;
      case 'upgrade':
        await this.grantRoomUpgrade(userId);
        break;
      case 'experience':
        await this.grantExperience(userId, reward);
        break;
      case 'cashback':
        await this.processCashback(userId, reward.value);
        break;
    }
  }

  // Aplicar desconto
  private async applyDiscount(userId: string, discountPercentage: number): Promise<void> {
    await prisma.userDiscount.create({
      data: {
        userId,
        discountPercentage,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        used: false
      }
    });
  }

  // Conceder noite grátis
  private async grantFreeNight(userId: string): Promise<void> {
    await prisma.userVoucher.create({
      data: {
        userId,
        type: 'free_night',
        value: 100,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
        used: false
      }
    });
  }

  // Conceder upgrade de quarto
  private async grantRoomUpgrade(userId: string): Promise<void> {
    await prisma.userVoucher.create({
      data: {
        userId,
        type: 'room_upgrade',
        value: 50,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        used: false
      }
    });
  }

  // Conceder experiência
  private async grantExperience(userId: string, reward: LoyaltyReward): Promise<void> {
    await prisma.userVoucher.create({
      data: {
        userId,
        type: 'experience',
        value: reward.value,
        validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 dias
        used: false
      }
    });
  }

  // Processar cashback
  private async processCashback(userId: string, amount: number): Promise<void> {
    await prisma.userCashback.create({
      data: {
        userId,
        amount,
        status: 'pending',
        requestedAt: new Date()
      }
    });
  }

  // Calcular pontos vitalícios
  private async calculateLifetimePoints(userId: string): Promise<number> {
    const transactions = await prisma.pointsTransaction.findMany({
      where: { userId },
      select: { points: true }
    });

    return transactions.reduce((total, tx) => total + Math.max(0, tx.points), 0);
  }

  // Calcular pontos do mês
  private async calculateMonthlyPoints(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactions = await prisma.pointsTransaction.findMany({
      where: {
        userId,
        timestamp: { gte: startOfMonth }
      },
      select: { points: true }
    });

    return transactions.reduce((total, tx) => total + Math.max(0, tx.points), 0);
  }

  // Calcular dias de streak
  private async calculateStreakDays(userId: string): Promise<number> {
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 30
    });

    let streak = 0;
    let currentDate = new Date();

    for (const activity of activities) {
      const activityDate = new Date(activity.timestamp);
      const daysDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        streak++;
        currentDate = activityDate;
      } else {
        break;
      }
    }

    return streak;
  }

  // Obter tier por pontos
  private getTierByPoints(points: number): LoyaltyTier {
    return this.tiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || this.tiers[0];
  }

  // Obter próximo tier
  private getNextTier(currentTier: LoyaltyTier): LoyaltyTier | null {
    const nextTier = this.tiers.find(tier => tier.level === currentTier.level + 1);
    return nextTier || null;
  }

  // Enviar notificação de upgrade
  private async sendTierUpgradeNotification(userId: string, newTier: LoyaltyTier): Promise<void> {
    // TODO: Implementar sistema de notificações
    console.log(`🎉 Parabéns! Usuário ${userId} foi promovido para ${newTier.name}!`);
  }

  // Gerar relatório de fidelidade
  async generateLoyaltyReport(userId: string): Promise<{
    userLoyalty: UserLoyalty;
    recentTransactions: any[];
    availableRewards: LoyaltyReward[];
    recommendations: string[];
  }> {
    const userLoyalty = await this.getUserLoyalty(userId);
    const availableRewards = await this.getAvailableRewards(userId);

    const recentTransactions = await prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    const recommendations = this.generateRecommendations(userLoyalty, availableRewards);

    return {
      userLoyalty,
      recentTransactions,
      availableRewards,
      recommendations
    };
  }

  // Gerar recomendações
  private generateRecommendations(userLoyalty: UserLoyalty, availableRewards: LoyaltyReward[]): string[] {
    const recommendations: string[] = [];

    if (userLoyalty.nextTierProgress > 80) {
      recommendations.push(`Você está a ${Math.round(100 - userLoyalty.nextTierProgress)}% do próximo tier!`);
    }

    if (userLoyalty.streakDays < 7) {
      recommendations.push('Mantenha sua atividade diária para aumentar seu streak!');
    }

    if (availableRewards.length > 0) {
      recommendations.push('Você tem recompensas disponíveis para resgate!');
    }

    return recommendations;
  }
}

export const premiumLoyaltyService = new PremiumLoyaltyService(); 