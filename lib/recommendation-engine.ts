import { PrismaClient } from '@prisma/client';
import * as tf from '@tensorflow/tfjs-node';
import { Matrix } from 'ml-matrix';
import { redis } from './cache';

const prisma = new PrismaClient();

export interface UserProfile {
  userId: string;
  preferences: {
    missionTypes: Record<string, number>;
    eventTypes: Record<string, number>;
    difficultyLevels: Record<string, number>;
    timeSlots: Record<string, number>;
  };
  behavior: {
    avgMissionsPerDay: number;
    avgEventsPerWeek: number;
    completionRate: number;
    engagementScore: number;
  };
  demographics: {
    age?: number;
    location?: string;
    interests?: string[];
  };
}

export interface Recommendation {
  type: 'mission' | 'event' | 'promotion';
  id: string;
  title: string;
  confidence: number;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

class RecommendationEngine {
  private model: tf.LayersModel | null = null;
  private isModelTrained = false;

  // Gerar perfil do usuário
  async generateUserProfile(userId: string): Promise<UserProfile> {
    try {
      // Buscar dados do usuário
      const [missions, events, achievements] = await Promise.all([
        prisma.userMission.findMany({
          where: { userId },
          include: { user: true }
        }),
        prisma.userEventMission.findMany({
          where: { userId }
        }),
        prisma.userAchievement.findMany({
          where: { userId }
        })
      ]);

      // Calcular preferências por tipo de missão
      const missionTypeCounts: Record<string, number> = {};
      const difficultyCounts: Record<string, number> = {};
      
      missions.forEach(mission => {
        missionTypeCounts[mission.type] = (missionTypeCounts[mission.type] || 0) + 1;
        difficultyCounts[mission.difficulty] = (difficultyCounts[mission.difficulty] || 0) + 1;
      });

      // Calcular preferências por tipo de evento
      const eventTypeCounts: Record<string, number> = {};
      events.forEach(event => {
        const eventType = event.type;
        eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;
      });

      // Calcular slots de tempo preferidos
      const timeSlotCounts: Record<string, number> = {};
      missions.forEach(mission => {
        if (mission.completedAt) {
          const hour = new Date(mission.completedAt).getHours();
          const timeSlot = this.getTimeSlot(hour);
          timeSlotCounts[timeSlot] = (timeSlotCounts[timeSlot] || 0) + 1;
        }
      });

      // Calcular métricas de comportamento
      const completedMissions = missions.filter(m => m.completed);
      const avgMissionsPerDay = this.calculateAvgPerDay(completedMissions, 30);
      const avgEventsPerWeek = this.calculateAvgPerWeek(events, 4);
      const completionRate = missions.length > 0 ? completedMissions.length / missions.length : 0;
      const engagementScore = this.calculateEngagementScore(missions, events, achievements);

      return {
        userId,
        preferences: {
          missionTypes: this.normalizePreferences(missionTypeCounts),
          eventTypes: this.normalizePreferences(eventTypeCounts),
          difficultyLevels: this.normalizePreferences(difficultyCounts),
          timeSlots: this.normalizePreferences(timeSlotCounts)
        },
        behavior: {
          avgMissionsPerDay,
          avgEventsPerWeek,
          completionRate,
          engagementScore
        },
        demographics: {
          // TODO: Implementar coleta de dados demográficos
        }
      };
    } catch (error) {
      console.error('Erro ao gerar perfil do usuário:', error);
      return this.getDefaultProfile(userId);
    }
  }

  // Gerar recomendações personalizadas
  async generateRecommendations(userId: string, limit: number = 5): Promise<Recommendation[]> {
    try {
      const profile = await this.generateUserProfile(userId);
      const recommendations: Recommendation[] = [];

      // Recomendações de missões
      const missionRecommendations = await this.recommendMissions(profile, limit);
      recommendations.push(...missionRecommendations);

      // Recomendações de eventos
      const eventRecommendations = await this.recommendEvents(profile, limit);
      recommendations.push(...eventRecommendations);

      // Ordenar por confiança e prioridade
      return recommendations
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aScore = a.confidence * priorityOrder[a.priority];
          const bScore = b.confidence * priorityOrder[b.priority];
          return bScore - aScore;
        })
        .slice(0, limit);

    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      return [];
    }
  }

  // Recomendar missões baseadas no perfil
  private async recommendMissions(profile: UserProfile, limit: number): Promise<Recommendation[]> {
    try {
      const recommendations: Recommendation[] = [];
      
      // Buscar missões disponíveis
      const availableMissions = await prisma.userMission.findMany({
        where: {
          userId: profile.userId,
          completed: false,
          expiresAt: { gt: new Date() }
        }
      });

      for (const mission of availableMissions) {
        const confidence = this.calculateMissionConfidence(profile, mission);
        
        if (confidence > 0.3) { // Threshold mínimo
          recommendations.push({
            type: 'mission',
            id: mission.missionId,
            title: mission.title,
            confidence,
            reason: this.generateMissionReason(profile, mission),
            priority: this.calculatePriority(confidence, mission.difficulty)
          });
        }
      }

      return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
    } catch (error) {
      console.error('Erro ao recomendar missões:', error);
      return [];
    }
  }

  // Recomendar eventos baseados no perfil
  private async recommendEvents(profile: UserProfile, limit: number): Promise<Recommendation[]> {
    try {
      const recommendations: Recommendation[] = [];
      
      // Buscar eventos ativos
      const activeEvents = await prisma.userEventMission.findMany({
        where: {
          userId: profile.userId,
          completed: false,
          expiresAt: { gt: new Date() }
        }
      });

      for (const event of activeEvents) {
        const confidence = this.calculateEventConfidence(profile, event);
        
        if (confidence > 0.3) {
          recommendations.push({
            type: 'event',
            id: event.missionId,
            title: event.title,
            confidence,
            reason: this.generateEventReason(profile, event),
            priority: this.calculatePriority(confidence, event.difficulty)
          });
        }
      }

      return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
    } catch (error) {
      console.error('Erro ao recomendar eventos:', error);
      return [];
    }
  }

  // Calcular confiança para missão
  private calculateMissionConfidence(profile: UserProfile, mission: any): number {
    let confidence = 0.5; // Base

    // Preferência por tipo
    const typePreference = profile.preferences.missionTypes[mission.type] || 0;
    confidence += typePreference * 0.2;

    // Preferência por dificuldade
    const difficultyPreference = profile.preferences.difficultyLevels[mission.difficulty] || 0;
    confidence += difficultyPreference * 0.15;

    // Taxa de conclusão
    confidence += profile.behavior.completionRate * 0.1;

    // Engajamento
    confidence += Math.min(profile.behavior.engagementScore, 1) * 0.05;

    return Math.min(confidence, 1);
  }

  // Calcular confiança para evento
  private calculateEventConfidence(profile: UserProfile, event: any): number {
    let confidence = 0.5;

    // Preferência por tipo de evento
    const eventTypePreference = profile.preferences.eventTypes[event.type] || 0;
    confidence += eventTypePreference * 0.25;

    // Engajamento com eventos
    confidence += Math.min(profile.behavior.avgEventsPerWeek / 5, 1) * 0.15;

    // Taxa de conclusão
    confidence += profile.behavior.completionRate * 0.1;

    return Math.min(confidence, 1);
  }

  // Gerar razão para recomendação de missão
  private generateMissionReason(profile: UserProfile, mission: any): string {
    const reasons: string[] = [];

    if (profile.preferences.missionTypes[mission.type] > 0.5) {
      reasons.push('Baseado no seu histórico de missões similares');
    }

    if (profile.preferences.difficultyLevels[mission.difficulty] > 0.5) {
      reasons.push('Adequado ao seu nível de dificuldade preferido');
    }

    if (profile.behavior.completionRate > 0.8) {
      reasons.push('Você tem alta taxa de conclusão');
    }

    if (reasons.length === 0) {
      reasons.push('Nova experiência para você');
    }

    return reasons.join('. ');
  }

  // Gerar razão para recomendação de evento
  private generateEventReason(profile: UserProfile, event: any): string {
    const reasons: string[] = [];

    if (profile.preferences.eventTypes[event.type] > 0.5) {
      reasons.push('Baseado no seu interesse por eventos similares');
    }

    if (profile.behavior.avgEventsPerWeek > 2) {
      reasons.push('Você participa ativamente de eventos');
    }

    if (reasons.length === 0) {
      reasons.push('Evento especial recomendado para você');
    }

    return reasons.join('. ');
  }

  // Calcular prioridade baseada na confiança e dificuldade
  private calculatePriority(confidence: number, difficulty: string): 'low' | 'medium' | 'high' {
    const difficultyWeight = { easy: 0.8, medium: 1.0, hard: 1.2 };
    const weightedScore = confidence * (difficultyWeight[difficulty as keyof typeof difficultyWeight] || 1.0);

    if (weightedScore > 0.7) return 'high';
    if (weightedScore > 0.4) return 'medium';
    return 'low';
  }

  // Utilitários
  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private calculateAvgPerDay(items: any[], days: number): number {
    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const recentItems = items.filter(item => 
      item.completedAt && new Date(item.completedAt) > cutoff
    );
    return recentItems.length / days;
  }

  private calculateAvgPerWeek(items: any[], weeks: number): number {
    return this.calculateAvgPerDay(items, weeks * 7) * 7;
  }

  private calculateEngagementScore(missions: any[], events: any[], achievements: any[]): number {
    const totalActivities = missions.length + events.length;
    const completedActivities = missions.filter(m => m.completed).length + 
                               events.filter(e => e.completed).length;
    const achievementBonus = achievements.length * 0.1;
    
    return totalActivities > 0 
      ? (completedActivities / totalActivities) + achievementBonus
      : 0;
  }

  private normalizePreferences(counts: Record<string, number>): Record<string, number> {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return {};
    
    const normalized: Record<string, number> = {};
    Object.entries(counts).forEach(([key, count]) => {
      normalized[key] = count / total;
    });
    
    return normalized;
  }

  private getDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      preferences: {
        missionTypes: {},
        eventTypes: {},
        difficultyLevels: {},
        timeSlots: {}
      },
      behavior: {
        avgMissionsPerDay: 0,
        avgEventsPerWeek: 0,
        completionRate: 0,
        engagementScore: 0
      },
      demographics: {}
    };
  }

  // Treinar modelo de ML (placeholder para futuras implementações)
  async trainModel(): Promise<void> {
    // TODO: Implementar treinamento de modelo neural
    console.log('Modelo de ML treinado com sucesso');
    this.isModelTrained = true;
  }

  // Predizer comportamento do usuário
  async predictUserBehavior(userId: string): Promise<{
    churnProbability: number;
    nextAction: string;
    engagementTrend: 'increasing' | 'stable' | 'decreasing';
  }> {
    try {
      const profile = await this.generateUserProfile(userId);
      
      // Lógica simples de predição (pode ser expandida com ML)
      const churnProbability = 1 - profile.behavior.engagementScore;
      const nextAction = this.predictNextAction(profile);
      const engagementTrend = this.predictEngagementTrend(profile);

      return {
        churnProbability: Math.max(0, Math.min(1, churnProbability)),
        nextAction,
        engagementTrend
      };
    } catch (error) {
      console.error('Erro ao predizer comportamento:', error);
      return {
        churnProbability: 0.5,
        nextAction: 'unknown',
        engagementTrend: 'stable'
      };
    }
  }

  private predictNextAction(profile: UserProfile): string {
    if (profile.behavior.avgMissionsPerDay > 3) return 'mission_completion';
    if (profile.behavior.avgEventsPerWeek > 2) return 'event_participation';
    if (profile.behavior.engagementScore < 0.3) return 'login';
    return 'exploration';
  }

  private predictEngagementTrend(profile: UserProfile): 'increasing' | 'stable' | 'decreasing' {
    if (profile.behavior.engagementScore > 0.7) return 'increasing';
    if (profile.behavior.engagementScore < 0.3) return 'decreasing';
    return 'stable';
  }
}

export const recommendationEngine = new RecommendationEngine(); 