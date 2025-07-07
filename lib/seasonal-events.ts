import { PrismaClient } from '@prisma/client';
import { dailyMissionService } from './daily-missions';
import { getCache, setCache, delCache } from './cache';

const prisma = new PrismaClient();

export interface SeasonalEvent {
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

export interface EventMission {
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

class SeasonalEventService {
  private readonly SEASONAL_EVENTS = [
    // Eventos de Férias
    {
      id: 'summer_vacation_2024',
      name: 'Férias de Verão 2024',
      description: 'Aproveite o verão com ofertas especiais e missões temáticas',
      startDate: new Date('2024-12-20'),
      endDate: new Date('2025-02-28'),
      type: 'holiday' as const,
      theme: 'summer',
      rewards: {
        points: 2000,
        specialRewards: ['Pacote de Praia', 'Desconto 20% Hotéis', 'Ingresso Grátis Parque Aquático']
      },
      missions: [
        {
          id: 'summer_booking_1',
          title: 'Reserva de Verão',
          description: 'Faça uma reserva para o verão',
          type: 'booking',
          target: 1,
          reward: { points: 300, specialItem: 'Cupom 15% OFF' },
          difficulty: 'easy'
        },
        {
          id: 'summer_attractions_1',
          title: 'Explorador de Praia',
          description: 'Visite 3 atrações de praia',
          type: 'exploration',
          target: 3,
          reward: { points: 500, specialItem: 'Pacote de Praia' },
          difficulty: 'medium'
        }
      ]
    },

    // Eventos de Festivais
    {
      id: 'carnival_2025',
      name: 'Carnaval 2025',
      description: 'Celebre o carnaval com descontos especiais',
      startDate: new Date('2025-02-28'),
      endDate: new Date('2025-03-05'),
      type: 'festival' as const,
      theme: 'carnival',
      rewards: {
        points: 1500,
        specialRewards: ['Pacote Carnaval', 'Desconto 25% Hotéis', 'Ingresso Bloco Especial']
      },
      missions: [
        {
          id: 'carnival_booking_1',
          title: 'Reserva de Carnaval',
          description: 'Faça uma reserva para o carnaval',
          type: 'booking',
          target: 1,
          reward: { points: 400, specialItem: 'Pacote Carnaval' },
          difficulty: 'medium'
        },
        {
          id: 'carnival_social_1',
          title: 'Festa nas Redes',
          description: 'Compartilhe 5 fotos do carnaval',
          type: 'social',
          target: 5,
          reward: { points: 300, specialItem: 'Ingresso Bloco Especial' },
          difficulty: 'hard'
        }
      ]
    },

    // Eventos de Promoção
    {
      id: 'black_friday_2024',
      name: 'Black Friday 2024',
      description: 'As melhores ofertas do ano',
      startDate: new Date('2024-11-29'),
      endDate: new Date('2024-12-02'),
      type: 'promotion' as const,
      theme: 'black_friday',
      rewards: {
        points: 3000,
        specialRewards: ['Desconto 50%', 'Cashback 10%', 'Upgrade VIP']
      },
      missions: [
        {
          id: 'bf_booking_1',
          title: 'Compra Black Friday',
          description: 'Faça uma compra durante a Black Friday',
          type: 'booking',
          target: 1,
          reward: { points: 600, specialItem: 'Cashback 10%' },
          difficulty: 'easy'
        },
        {
          id: 'bf_spending_1',
          title: 'Gastador Black Friday',
          description: 'Gaste mais de R$ 1000',
          type: 'spending',
          target: 1000,
          reward: { points: 1000, specialItem: 'Upgrade VIP' },
          difficulty: 'hard'
        }
      ]
    },

    // Eventos Especiais
    {
      id: 'anniversary_2024',
      name: 'Aniversário Reservei',
      description: 'Celebre conosco nosso aniversário',
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-22'),
      type: 'special' as const,
      theme: 'anniversary',
      rewards: {
        points: 2500,
        specialRewards: ['Presente Especial', 'Desconto 30%', 'Experiência VIP']
      },
      missions: [
        {
          id: 'anniversary_login_1',
          title: 'Parabéns Diário',
          description: 'Faça login durante a semana de aniversário',
          type: 'login',
          target: 7,
          reward: { points: 700, specialItem: 'Presente Especial' },
          difficulty: 'medium'
        },
        {
          id: 'anniversary_booking_1',
          title: 'Reserva de Aniversário',
          description: 'Faça uma reserva durante a celebração',
          type: 'booking',
          target: 1,
          reward: { points: 500, specialItem: 'Experiência VIP' },
          difficulty: 'easy'
        }
      ]
    }
  ];

  // Obter eventos ativos
  async getActiveEvents(): Promise<SeasonalEvent[]> {
    try {
      const cacheKey = 'seasonal:active-events';
      const cached = await getCache<SeasonalEvent[]>(cacheKey);
      if (cached) return cached;
      const now = new Date();
      const result = this.SEASONAL_EVENTS.filter(event => 
        event.startDate <= now && event.endDate >= now
      );
      await setCache(cacheKey, result, 600);
      return result;
    } catch (error) {
      console.error('Erro ao obter eventos ativos:', error);
      return [];
    }
  }

  // Obter todos os eventos
  async getAllEvents(): Promise<SeasonalEvent[]> {
    try {
      return this.SEASONAL_EVENTS;
    } catch (error) {
      console.error('Erro ao obter todos os eventos:', error);
      return [];
    }
  }

  // Obter evento por ID
  async getEventById(eventId: string): Promise<SeasonalEvent | null> {
    try {
      return this.SEASONAL_EVENTS.find(event => event.id === eventId) || null;
    } catch (error) {
      console.error('Erro ao obter evento:', error);
      return null;
    }
  }

  // Gerar missões de evento para usuário
  async generateEventMissions(userId: string, eventId: string): Promise<EventMission[]> {
    try {
      const event = await this.getEventById(eventId);
      if (!event) return [];

      // Verificar se já gerou missões para este evento
      const existingMissions = await prisma.userEventMission.findMany({
        where: {
          userId,
          eventId,
          completed: false
        }
      });

      if (existingMissions.length > 0) {
        return this.getUserEventMissions(userId, eventId);
      }

      // Selecionar missões do evento
      const selectedMissions = event.missions.slice(0, 3); // Máximo 3 missões por evento

      for (const mission of selectedMissions) {
        await prisma.userEventMission.create({
          data: {
            userId,
            eventId,
            missionId: mission.id,
            title: mission.title,
            description: mission.description,
            type: mission.type,
            target: mission.target,
            current: 0,
            reward: JSON.stringify(mission.reward),
            difficulty: mission.difficulty,
            expiresAt: event.endDate,
            completed: false
          }
        });
      }

      return selectedMissions;
    } catch (error) {
      console.error('Erro ao gerar missões de evento:', error);
      return [];
    }
  }

  // Obter missões de evento do usuário
  async getUserEventMissions(userId: string, eventId: string): Promise<EventMission[]> {
    try {
      const cacheKey = `event-missions:${userId}:${eventId}`;
      const cached = await getCache<EventMission[]>(cacheKey);
      if (cached) return cached;
      const userMissions = await prisma.userEventMission.findMany({
        where: {
          userId,
          eventId,
          completed: false,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      const result = userMissions.map(mission => ({
        id: mission.missionId,
        title: mission.title,
        description: mission.description,
        type: mission.type,
        target: mission.target,
        reward: JSON.parse(mission.reward),
        difficulty: mission.difficulty as any
      }));
      await setCache(cacheKey, result, 300);
      return result;
    } catch (error) {
      console.error('Erro ao obter missões de evento do usuário:', error);
      return [];
    }
  }

  // Atualizar progresso de missão de evento
  async updateEventMissionProgress(
    userId: string,
    eventId: string,
    missionId: string,
    progress: number
  ): Promise<boolean> {
    try {
      const mission = await prisma.userEventMission.findFirst({
        where: {
          userId,
          eventId,
          missionId,
          completed: false
        }
      });

      if (!mission) return false;

      const newCurrent = Math.min(mission.current + progress, mission.target);
      const completed = newCurrent >= mission.target;

      await prisma.userEventMission.update({
        where: { id: mission.id },
        data: {
          current: newCurrent,
          completed,
          completedAt: completed ? new Date() : null
        }
      });

      // Se completou, adicionar pontos e recompensas especiais
      if (completed && !mission.claimed) {
        const reward = JSON.parse(mission.reward);
        await dailyMissionService.addPoints(userId, 'event_mission_complete', reward.points);
        
        // Aplicar recompensa especial se houver
        if (reward.specialItem) {
          await this.applySpecialReward(userId, reward.specialItem);
        }
      }

      await delCache(`event-missions:${userId}:${eventId}`);
      await delCache(`event-stats:${userId}`);
      return completed;
    } catch (error) {
      console.error('Erro ao atualizar progresso da missão de evento:', error);
      return false;
    }
  }

  // Aplicar recompensa especial
  private async applySpecialReward(userId: string, specialItem: string) {
    try {
      // Criar promoção especial baseada no item
      let promotionData: any = {
        name: `Recompensa Especial - ${specialItem}`,
        code: `EVENT_${Date.now()}`,
        type: 'special',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        maxUses: 1,
        applicableModules: JSON.stringify(['hoteis', 'ingressos', 'atracoes']),
        conditions: JSON.stringify({ userId }),
        status: 'active'
      };

      // Configurar promoção baseada no tipo de item
      if (specialItem.includes('Desconto')) {
        const discountValue = parseInt(specialItem.match(/\d+/)?.[0] || '10');
        promotionData.discountType = 'percentage';
        promotionData.discountValue = discountValue;
      } else if (specialItem.includes('Cashback')) {
        const cashbackValue = parseInt(specialItem.match(/\d+/)?.[0] || '5');
        promotionData.discountType = 'cashback';
        promotionData.discountValue = cashbackValue;
      }

      await prisma.promotion.create({
        data: promotionData
      });

      console.log(`Recompensa especial aplicada: ${specialItem}`);
    } catch (error) {
      console.error('Erro ao aplicar recompensa especial:', error);
    }
  }

  // Obter estatísticas de eventos
  async getEventStats(userId: string): Promise<{
    totalEvents: number;
    activeEvents: number;
    completedEventMissions: number;
    totalEventPoints: number;
    specialRewards: string[];
  }> {
    try {
      const cacheKey = `event-stats:${userId}`;
      const cached = await getCache<any>(cacheKey);
      if (cached) return cached;
      const activeEvents = await this.getActiveEvents();
      const userEventMissions = await prisma.userEventMission.findMany({
        where: { userId }
      });

      const completedMissions = userEventMissions.filter(m => m.completed);
      const totalEventPoints = completedMissions.reduce((sum, m) => {
        const reward = JSON.parse(m.reward);
        return sum + reward.points;
      }, 0);

      const specialRewards = completedMissions
        .map(m => JSON.parse(m.reward).specialItem)
        .filter(Boolean);

      const result = {
        totalEvents: this.SEASONAL_EVENTS.length,
        activeEvents: activeEvents.length,
        completedEventMissions: completedMissions.length,
        totalEventPoints,
        specialRewards
      };
      await setCache(cacheKey, result, 300);
      return result;
    } catch (error) {
      console.error('Erro ao obter estatísticas de eventos:', error);
      return {
        totalEvents: 0,
        activeEvents: 0,
        completedEventMissions: 0,
        totalEventPoints: 0,
        specialRewards: []
      };
    }
  }
}

export const seasonalEventService = new SeasonalEventService(); 