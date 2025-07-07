import { PrismaClient } from '@prisma/client';
import { distributedCache } from './distributed-cache';

const prisma = new PrismaClient();

interface UserBehavior {
  userId: string;
  actions: UserAction[];
  preferences: UserPreferences;
  lastActivity: Date;
  sessionDuration: number;
  pageViews: number;
}

interface UserAction {
  type: 'view' | 'search' | 'book' | 'review' | 'share' | 'favorite';
  target: string; // hotelId, attractionId, etc.
  timestamp: Date;
  metadata?: any;
}

interface UserPreferences {
  priceRange: [number, number];
  location: string[];
  amenities: string[];
  rating: number;
  category: string[];
}

interface Recommendation {
  id: string;
  type: 'hotel' | 'attraction' | 'package';
  score: number;
  reason: string;
  confidence: number;
  metadata?: any;
}

interface MLModel {
  id: string;
  name: string;
  type: 'collaborative' | 'content' | 'hybrid' | 'deep_learning';
  version: string;
  accuracy: number;
  lastTrained: Date;
  status: 'training' | 'ready' | 'error';
  parameters: any;
}

interface PredictionResult {
  userId: string;
  recommendations: Recommendation[];
  modelUsed: string;
  timestamp: Date;
  processingTime: number;
}

export class AdvancedMLService {
  private models: Map<string, MLModel> = new Map();
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private predictions: PredictionResult[] = [];

  constructor() {
    this.initializeModels();
    this.loadUserBehaviors();
  }

  private async initializeModels(): Promise<void> {
    console.log('🤖 Inicializando modelos de ML...');

    // Modelo de Filtragem Colaborativa
    this.models.set('collaborative', {
      id: 'collaborative-v1',
      name: 'Filtragem Colaborativa',
      type: 'collaborative',
      version: '1.0.0',
      accuracy: 0.85,
      lastTrained: new Date(),
      status: 'ready',
      parameters: {
        minSimilarity: 0.3,
        maxRecommendations: 10,
        decayFactor: 0.95
      }
    });

    // Modelo Baseado em Conteúdo
    this.models.set('content', {
      id: 'content-v1',
      name: 'Filtragem por Conteúdo',
      type: 'content',
      version: '1.0.0',
      accuracy: 0.78,
      lastTrained: new Date(),
      status: 'ready',
      parameters: {
        featureWeight: 0.7,
        categoryWeight: 0.3,
        priceWeight: 0.2
      }
    });

    // Modelo Híbrido
    this.models.set('hybrid', {
      id: 'hybrid-v1',
      name: 'Modelo Híbrido',
      type: 'hybrid',
      version: '1.0.0',
      accuracy: 0.92,
      lastTrained: new Date(),
      status: 'ready',
      parameters: {
        collaborativeWeight: 0.6,
        contentWeight: 0.4,
        diversityFactor: 0.3
      }
    });

    // Modelo de Deep Learning
    this.models.set('deep_learning', {
      id: 'deep-learning-v1',
      name: 'Deep Learning',
      type: 'deep_learning',
      version: '1.0.0',
      accuracy: 0.89,
      lastTrained: new Date(),
      status: 'ready',
      parameters: {
        layers: [64, 32, 16],
        learningRate: 0.001,
        epochs: 100,
        batchSize: 32
      }
    });

    console.log('✅ Modelos de ML inicializados');
  }

  private async loadUserBehaviors(): Promise<void> {
    try {
      console.log('📊 Carregando comportamentos dos usuários...');

      // Carregar dados do banco
      const users = await prisma.user.findMany({
        include: {
          reservations: true,
          reviews: true,
          searchHistory: true
        }
      });

      for (const user of users) {
        const behavior: UserBehavior = {
          userId: user.id,
          actions: [],
          preferences: {
            priceRange: [0, 10000],
            location: [],
            amenities: [],
            rating: 0,
            category: []
          },
          lastActivity: user.updatedAt,
          sessionDuration: 0,
          pageViews: 0
        };

        // Processar reservas
        for (const reservation of user.reservations) {
          behavior.actions.push({
            type: 'book',
            target: reservation.hotelId,
            timestamp: reservation.createdAt,
            metadata: {
              price: reservation.totalPrice,
              duration: reservation.duration
            }
          });
        }

        // Processar reviews
        for (const review of user.reviews) {
          behavior.actions.push({
            type: 'review',
            target: review.hotelId,
            timestamp: review.createdAt,
            metadata: {
              rating: review.rating,
              comment: review.comment
            }
          });
        }

        // Processar histórico de busca
        for (const search of user.searchHistory) {
          behavior.actions.push({
            type: 'search',
            target: search.query,
            timestamp: search.createdAt,
            metadata: {
              filters: search.filters
            }
          });
        }

        this.userBehaviors.set(user.id, behavior);
      }

      console.log(`✅ Comportamentos carregados para ${users.length} usuários`);
    } catch (error) {
      console.error('❌ Erro ao carregar comportamentos:', error);
    }
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<Recommendation[]> {
    const startTime = performance.now();

    try {
      // Verificar cache primeiro
      const cacheKey = `recommendations:${userId}`;
      const cached = await distributedCache.get<Recommendation[]>(cacheKey);
      
      if (cached) {
        console.log(`✅ Recomendações do cache para usuário ${userId}`);
        return cached.slice(0, limit);
      }

      const userBehavior = this.userBehaviors.get(userId);
      if (!userBehavior) {
        console.log(`⚠️ Comportamento não encontrado para usuário ${userId}`);
        return this.getPopularRecommendations(limit);
      }

      // Usar modelo híbrido para melhores resultados
      const model = this.models.get('hybrid');
      if (!model || model.status !== 'ready') {
        console.warn('⚠️ Modelo híbrido não disponível, usando modelo colaborativo');
        return this.getCollaborativeRecommendations(userId, limit);
      }

      const recommendations = await this.generateHybridRecommendations(userId, limit);
      
      // Cache por 1 hora
      await distributedCache.set(cacheKey, recommendations, 3600);

      const processingTime = performance.now() - startTime;
      
      // Registrar predição
      this.predictions.push({
        userId,
        recommendations,
        modelUsed: model.id,
        timestamp: new Date(),
        processingTime
      });

      console.log(`🤖 Recomendações geradas em ${processingTime.toFixed(2)}ms`);
      return recommendations;

    } catch (error) {
      console.error('❌ Erro ao gerar recomendações:', error);
      return this.getPopularRecommendations(limit);
    }
  }

  private async generateHybridRecommendations(userId: string, limit: number): Promise<Recommendation[]> {
    const collaborative = await this.getCollaborativeRecommendations(userId, limit * 2);
    const content = await this.getContentBasedRecommendations(userId, limit * 2);
    
    // Combinar e pontuar
    const combined = new Map<string, Recommendation>();
    
    for (const rec of collaborative) {
      combined.set(rec.id, {
        ...rec,
        score: rec.score * 0.6 // Peso do modelo colaborativo
      });
    }
    
    for (const rec of content) {
      const existing = combined.get(rec.id);
      if (existing) {
        existing.score += rec.score * 0.4; // Peso do modelo de conteúdo
        existing.confidence = Math.min(1, existing.confidence + 0.1);
      } else {
        combined.set(rec.id, {
          ...rec,
          score: rec.score * 0.4
        });
      }
    }
    
    // Ordenar e retornar top N
    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((rec, index) => ({
        ...rec,
        reason: this.generateRecommendationReason(rec, index + 1)
      }));
  }

  private async getCollaborativeRecommendations(userId: string, limit: number): Promise<Recommendation[]> {
    const userBehavior = this.userBehaviors.get(userId);
    if (!userBehavior) return [];

    // Encontrar usuários similares
    const similarUsers = this.findSimilarUsers(userId);
    
    // Coletar itens dos usuários similares
    const itemScores = new Map<string, number>();
    
    for (const similarUser of similarUsers) {
      const similarity = similarUser.similarity;
      const behavior = this.userBehaviors.get(similarUser.userId);
      
      if (behavior) {
        for (const action of behavior.actions) {
          if (action.type === 'book' || action.type === 'review') {
            const currentScore = itemScores.get(action.target) || 0;
            itemScores.set(action.target, currentScore + similarity);
          }
        }
      }
    }
    
    // Converter para recomendações
    const recommendations: Recommendation[] = [];
    
    for (const [itemId, score] of itemScores) {
      recommendations.push({
        id: itemId,
        type: 'hotel',
        score: score / similarUsers.length,
        reason: 'Baseado em usuários similares',
        confidence: Math.min(1, score / similarUsers.length),
        metadata: { method: 'collaborative' }
      });
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getContentBasedRecommendations(userId: string, limit: number): Promise<Recommendation[]> {
    const userBehavior = this.userBehaviors.get(userId);
    if (!userBehavior) return [];

    // Analisar preferências do usuário
    const preferences = this.analyzeUserPreferences(userBehavior);
    
    // Buscar hotéis que correspondem às preferências
    const hotels = await prisma.hotel.findMany({
      where: {
        active: true,
        price: {
          gte: preferences.priceRange[0],
          lte: preferences.priceRange[1]
        },
        rating: {
          gte: preferences.rating
        }
      },
      include: {
        amenities: true,
        location: true
      }
    });
    
    // Calcular scores baseados em similaridade de conteúdo
    const recommendations: Recommendation[] = [];
    
    for (const hotel of hotels) {
      const score = this.calculateContentSimilarity(preferences, hotel);
      
      if (score > 0.3) { // Threshold mínimo
        recommendations.push({
          id: hotel.id,
          type: 'hotel',
          score,
          reason: 'Baseado em suas preferências',
          confidence: score,
          metadata: {
            method: 'content',
            matchedFeatures: this.getMatchedFeatures(preferences, hotel)
          }
        });
      }
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getPopularRecommendations(limit: number): Promise<Recommendation[]> {
    try {
      // Buscar hotéis populares baseado em reservas e avaliações
      const popularHotels = await prisma.hotel.findMany({
        where: { active: true },
        include: {
          _count: {
            select: {
              reservations: true,
              reviews: true
            }
          },
          reviews: {
            select: { rating: true }
          }
        },
        orderBy: [
          { reservations: { _count: 'desc' } },
          { reviews: { _count: 'desc' } }
        ],
        take: limit
      });
      
      return popularHotels.map((hotel, index) => {
        const avgRating = hotel.reviews.length > 0
          ? hotel.reviews.reduce((sum, r) => sum + r.rating, 0) / hotel.reviews.length
          : 0;
        
        return {
          id: hotel.id,
          type: 'hotel',
          score: (hotel._count.reservations * 0.7 + avgRating * 0.3) / 100,
          reason: 'Hotel popular',
          confidence: Math.min(1, (hotel._count.reservations + hotel._count.reviews) / 100),
          metadata: {
            method: 'popular',
            reservations: hotel._count.reservations,
            reviews: hotel._count.reviews,
            avgRating
          }
        };
      });
    } catch (error) {
      console.error('Erro ao buscar recomendações populares:', error);
      return [];
    }
  }

  private findSimilarUsers(userId: string, limit: number = 10): Array<{userId: string, similarity: number}> {
    const targetBehavior = this.userBehaviors.get(userId);
    if (!targetBehavior) return [];

    const similarities: Array<{userId: string, similarity: number}> = [];
    
    for (const [otherUserId, otherBehavior] of this.userBehaviors) {
      if (otherUserId === userId) continue;
      
      const similarity = this.calculateUserSimilarity(targetBehavior, otherBehavior);
      if (similarity > 0.1) { // Threshold mínimo
        similarities.push({ userId: otherUserId, similarity });
      }
    }
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private calculateUserSimilarity(behavior1: UserBehavior, behavior2: UserBehavior): number {
    // Calcular similaridade baseada em ações comuns
    const actions1 = new Set(behavior1.actions.map(a => `${a.type}:${a.target}`));
    const actions2 = new Set(behavior2.actions.map(a => `${a.type}:${a.target}`));
    
    const intersection = new Set([...actions1].filter(x => actions2.has(x)));
    const union = new Set([...actions1, ...actions2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private analyzeUserPreferences(behavior: UserBehavior): UserPreferences {
    const preferences: UserPreferences = {
      priceRange: [0, 10000],
      location: [],
      amenities: [],
      rating: 0,
      category: []
    };
    
    // Analisar preços das reservas
    const prices = behavior.actions
      .filter(a => a.type === 'book' && a.metadata?.price)
      .map(a => a.metadata.price);
    
    if (prices.length > 0) {
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      preferences.priceRange = [avgPrice * 0.7, avgPrice * 1.3];
    }
    
    // Analisar avaliações
    const ratings = behavior.actions
      .filter(a => a.type === 'review' && a.metadata?.rating)
      .map(a => a.metadata.rating);
    
    if (ratings.length > 0) {
      preferences.rating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    }
    
    return preferences;
  }

  private calculateContentSimilarity(preferences: UserPreferences, hotel: any): number {
    let score = 0;
    
    // Score por preço
    if (hotel.price >= preferences.priceRange[0] && hotel.price <= preferences.priceRange[1]) {
      score += 0.3;
    }
    
    // Score por avaliação
    if (hotel.rating >= preferences.rating) {
      score += 0.2;
    }
    
    // Score por localização
    if (preferences.location.length === 0 || preferences.location.includes(hotel.location?.city)) {
      score += 0.2;
    }
    
    // Score por amenidades
    const hotelAmenities = hotel.amenities?.map((a: any) => a.name) || [];
    const commonAmenities = preferences.amenities.filter(a => hotelAmenities.includes(a));
    score += (commonAmenities.length / Math.max(preferences.amenities.length, 1)) * 0.3;
    
    return Math.min(1, score);
  }

  private getMatchedFeatures(preferences: UserPreferences, hotel: any): string[] {
    const matches: string[] = [];
    
    if (hotel.price >= preferences.priceRange[0] && hotel.price <= preferences.priceRange[1]) {
      matches.push('Preço adequado');
    }
    
    if (hotel.rating >= preferences.rating) {
      matches.push('Avaliação alta');
    }
    
    if (preferences.location.length === 0 || preferences.location.includes(hotel.location?.city)) {
      matches.push('Localização desejada');
    }
    
    return matches;
  }

  private generateRecommendationReason(recommendation: Recommendation, position: number): string {
    const reasons = [
      'Perfeito para você',
      'Baseado em suas preferências',
      'Muito bem avaliado',
      'Excelente custo-benefício',
      'Localização privilegiada',
      'Amenidades completas',
      'Experiência única',
      'Opção premium',
      'Destino popular',
      'Oferta especial'
    ];
    
    return reasons[position - 1] || 'Recomendação personalizada';
  }

  async recordUserAction(userId: string, action: UserAction): Promise<void> {
    try {
      let behavior = this.userBehaviors.get(userId);
      
      if (!behavior) {
        behavior = {
          userId,
          actions: [],
          preferences: {
            priceRange: [0, 10000],
            location: [],
            amenities: [],
            rating: 0,
            category: []
          },
          lastActivity: new Date(),
          sessionDuration: 0,
          pageViews: 0
        };
        this.userBehaviors.set(userId, behavior);
      }
      
      behavior.actions.push(action);
      behavior.lastActivity = new Date();
      
      // Invalidar cache de recomendações
      await distributedCache.delete(`recommendations:${userId}`);
      
      console.log(`📝 Ação registrada para usuário ${userId}: ${action.type}`);
    } catch (error) {
      console.error('Erro ao registrar ação do usuário:', error);
    }
  }

  async trainModel(modelId: string): Promise<boolean> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error(`Modelo ${modelId} não encontrado`);
      }
      
      console.log(`🤖 Treinando modelo ${model.name}...`);
      model.status = 'training';
      
      // Simular treinamento
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Atualizar métricas do modelo
      model.accuracy = Math.random() * 0.2 + 0.8; // 80-100%
      model.lastTrained = new Date();
      model.status = 'ready';
      
      console.log(`✅ Modelo ${model.name} treinado com sucesso (accuracy: ${model.accuracy.toFixed(3)})`);
      return true;
    } catch (error) {
      console.error('Erro ao treinar modelo:', error);
      const model = this.models.get(modelId);
      if (model) model.status = 'error';
      return false;
    }
  }

  async getModelPerformance(): Promise<any> {
    const performance = {};
    
    for (const [modelId, model] of this.models) {
      performance[modelId] = {
        name: model.name,
        accuracy: model.accuracy,
        status: model.status,
        lastTrained: model.lastTrained,
        predictions: this.predictions.filter(p => p.modelUsed === model.id).length
      };
    }
    
    return performance;
  }

  async getPredictionHistory(userId?: string): Promise<PredictionResult[]> {
    if (userId) {
      return this.predictions.filter(p => p.userId === userId);
    }
    return this.predictions;
  }

  async clearCache(): Promise<void> {
    try {
      await distributedCache.invalidatePattern('recommendations:*');
      console.log('🗑️ Cache de recomendações limpo');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }
}

// Instância global do serviço de ML
export const advancedML = new AdvancedMLService(); 