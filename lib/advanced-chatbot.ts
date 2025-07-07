import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { redis } from './cache';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: {
    currentHotel?: any;
    currentAttraction?: any;
    bookingInProgress?: boolean;
    userPreferences?: Record<string, any>;
    lastIntent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  action?: string;
}

class AdvancedChatbotService {
  private sessions: Map<string, ChatSession> = new Map();

  // Processar mensagem do usuário
  async processMessage(userId: string, message: string): Promise<{
    response: string;
    actions?: string[];
    suggestions?: string[];
    metadata?: Record<string, any>;
  }> {
    try {
      // Obter ou criar sessão
      const session = await this.getOrCreateSession(userId);
      
      // Adicionar mensagem do usuário
      session.messages.push({
        id: `msg_${Date.now()}`,
        userId,
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Analisar intenção
      const intent = await this.analyzeIntent(message, session.context);
      
      // Processar intenção
      const result = await this.handleIntent(intent, session);
      
      // Adicionar resposta do assistente
      session.messages.push({
        id: `msg_${Date.now() + 1}`,
        userId,
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        metadata: result.metadata
      });

      // Atualizar contexto
      session.context.lastIntent = intent.intent;
      session.updatedAt = new Date();

      // Salvar sessão
      await this.saveSession(session);

      return result;
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      return {
        response: 'Desculpe, ocorreu um erro. Como posso ajudá-lo?',
        suggestions: ['Buscar hotéis', 'Ver atrações', 'Fazer reserva']
      };
    }
  }

  // Analisar intenção da mensagem
  private async analyzeIntent(message: string, context: any): Promise<ChatIntent> {
    try {
      const prompt = `
        Analise a intenção da seguinte mensagem do usuário e extraia entidades relevantes.
        
        Contexto atual: ${JSON.stringify(context)}
        Mensagem: "${message}"
        
        Responda em JSON com:
        {
          "intent": "buscar_hotel|fazer_reserva|ver_atracoes|ajuda|reclamacao|elogio",
          "confidence": 0.0-1.0,
          "entities": {
            "location": "string",
            "dates": "string",
            "guests": "number",
            "budget": "number",
            "amenities": ["string"]
          },
          "action": "string"
        }
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Resposta vazia da IA');
      }

      return JSON.parse(response);
    } catch (error) {
      console.error('Erro ao analisar intenção:', error);
      return {
        intent: 'ajuda',
        confidence: 0.5,
        entities: {}
      };
    }
  }

  // Processar intenção específica
  private async handleIntent(intent: ChatIntent, session: ChatSession): Promise<{
    response: string;
    actions?: string[];
    suggestions?: string[];
    metadata?: Record<string, any>;
  }> {
    switch (intent.intent) {
      case 'buscar_hotel':
        return await this.handleHotelSearch(intent, session);
      
      case 'fazer_reserva':
        return await this.handleBooking(intent, session);
      
      case 'ver_atracoes':
        return await this.handleAttractions(intent, session);
      
      case 'ajuda':
        return await this.handleHelp(intent, session);
      
      case 'reclamacao':
        return await this.handleComplaint(intent, session);
      
      case 'elogio':
        return await this.handlePraise(intent, session);
      
      default:
        return {
          response: 'Não entendi sua solicitação. Pode reformular?',
          suggestions: ['Buscar hotéis', 'Ver atrações', 'Fazer reserva', 'Ajuda']
        };
    }
  }

  // Buscar hotéis
  private async handleHotelSearch(intent: ChatIntent, session: ChatSession) {
    const { location, dates, guests, budget, amenities } = intent.entities;
    
    let query: any = { active: true };
    
    if (location) {
      query.OR = [
        { name: { contains: location, mode: 'insensitive' } },
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } }
      ];
    }

    if (budget) {
      query.pricePerNight = { lte: budget };
    }

    const hotels = await prisma.hotel.findMany({
      where: query,
      take: 5,
      include: {
        amenities: true,
        reviews: {
          take: 3,
          orderBy: { rating: 'desc' }
        }
      }
    });

    if (hotels.length === 0) {
      return {
        response: `Não encontrei hotéis em ${location || 'sua região'}. Gostaria de ver outras opções?`,
        suggestions: ['Ver todas as atrações', 'Buscar em outra cidade', 'Ver promoções']
      };
    }

    const hotelList = hotels.map(hotel => 
      `🏨 **${hotel.name}** - ${hotel.city}\n` +
      `⭐ ${hotel.rating}/5 (${hotel.reviews.length} avaliações)\n` +
      `💰 A partir de R$ ${hotel.pricePerNight}/noite\n` +
      `📍 ${hotel.address}`
    ).join('\n\n');

    return {
      response: `Encontrei ${hotels.length} hotéis para você:\n\n${hotelList}\n\nGostaria de ver mais detalhes de algum hotel específico?`,
      suggestions: hotels.map(h => `Ver ${h.name}`),
      metadata: { hotels: hotels.map(h => ({ id: h.id, name: h.name })) }
    };
  }

  // Processar reserva
  private async handleBooking(intent: ChatIntent, session: ChatSession) {
    const { location, dates, guests } = intent.entities;
    
    if (!location || !dates || !guests) {
      return {
        response: 'Para fazer uma reserva, preciso de algumas informações:\n\n' +
                 '📍 **Localização** (cidade ou hotel)\n' +
                 '📅 **Datas** (check-in e check-out)\n' +
                 '👥 **Número de hóspedes**\n\n' +
                 'Pode me fornecer essas informações?',
        suggestions: ['Buscar hotéis primeiro', 'Ver disponibilidade', 'Falar com atendente']
      };
    }

    session.context.bookingInProgress = true;
    
    return {
      response: `Perfeito! Vou ajudá-lo com a reserva:\n\n` +
                `📍 **Localização**: ${location}\n` +
                `📅 **Datas**: ${dates}\n` +
                `👥 **Hóspedes**: ${guests}\n\n` +
                `Vou verificar a disponibilidade e mostrar as melhores opções.`,
      actions: ['check_availability', 'show_payment_options'],
      metadata: { booking: { location, dates, guests } }
    };
  }

  // Mostrar atrações
  private async handleAttractions(intent: ChatIntent, session: ChatSession) {
    const { location } = intent.entities;
    
    let query: any = { active: true };
    
    if (location) {
      query.OR = [
        { name: { contains: location, mode: 'insensitive' } },
        { city: { contains: location, mode: 'insensitive' } }
      ];
    }

    const attractions = await prisma.attraction.findMany({
      where: query,
      take: 5,
      include: {
        reviews: {
          take: 3,
          orderBy: { rating: 'desc' }
        }
      }
    });

    if (attractions.length === 0) {
      return {
        response: `Não encontrei atrações em ${location || 'sua região'}. Gostaria de ver outras opções?`,
        suggestions: ['Ver todos os hotéis', 'Buscar em outra cidade', 'Ver promoções']
      };
    }

    const attractionList = attractions.map(attraction => 
      `🎡 **${attraction.name}** - ${attraction.city}\n` +
      `⭐ ${attraction.rating}/5 (${attraction.reviews.length} avaliações)\n` +
      `💰 A partir de R$ ${attraction.price}\n` +
      `📍 ${attraction.address}`
    ).join('\n\n');

    return {
      response: `Encontrei ${attractions.length} atrações para você:\n\n${attractionList}\n\nGostaria de comprar ingressos para alguma atração?`,
      suggestions: attractions.map(a => `Comprar ${a.name}`),
      metadata: { attractions: attractions.map(a => ({ id: a.id, name: a.name })) }
    };
  }

  // Ajuda
  private async handleHelp(intent: ChatIntent, session: ChatSession) {
    return {
      response: `Olá! Sou o assistente virtual do Reservei Viagens. Como posso ajudá-lo?\n\n` +
                `🎯 **Principais funcionalidades:**\n` +
                `🏨 Buscar e reservar hotéis\n` +
                `🎡 Ver e comprar ingressos para atrações\n` +
                `🎮 Participar da gamificação e ganhar pontos\n` +
                `💬 Suporte 24/7\n\n` +
                `O que você gostaria de fazer?`,
      suggestions: [
        'Buscar hotéis',
        'Ver atrações',
        'Fazer reserva',
        'Ver meus pontos',
        'Falar com atendente'
      ]
    };
  }

  // Reclamação
  private async handleComplaint(intent: ChatIntent, session: ChatSession) {
    return {
      response: `Lamento muito pelo inconveniente! 😔\n\n` +
                `Vou registrar sua reclamação e um atendente entrará em contato em até 2 horas.\n\n` +
                `Para agilizar o atendimento, pode me contar mais detalhes sobre o problema?`,
      actions: ['create_ticket', 'escalate_to_human'],
      metadata: { type: 'complaint', priority: 'high' }
    };
  }

  // Elogio
  private async handlePraise(intent: ChatIntent, session: ChatSession) {
    return {
      response: `Muito obrigado pelo feedback positivo! 😊\n\n` +
                `Ficamos muito felizes em saber que você está satisfeito com nossos serviços.\n\n` +
                `Sua opinião é muito importante para continuarmos melhorando!`,
      actions: ['record_feedback'],
      metadata: { type: 'praise', sentiment: 'positive' }
    };
  }

  // Obter ou criar sessão
  private async getOrCreateSession(userId: string): Promise<ChatSession> {
    let session = this.sessions.get(userId);
    
    if (!session) {
      session = {
        id: `session_${userId}_${Date.now()}`,
        userId,
        messages: [],
        context: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.sessions.set(userId, session);
    }
    
    return session;
  }

  // Salvar sessão
  private async saveSession(session: ChatSession): Promise<void> {
    try {
      await prisma.chatSession.upsert({
        where: { id: session.id },
        update: {
          messages: JSON.stringify(session.messages),
          context: JSON.stringify(session.context),
          updatedAt: session.updatedAt
        },
        create: {
          id: session.id,
          userId: session.userId,
          messages: JSON.stringify(session.messages),
          context: JSON.stringify(session.context),
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      });
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  }

  // Obter histórico de conversas
  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const session = await prisma.chatSession.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });

      if (!session) return [];

      const messages = JSON.parse(session.messages);
      return messages.slice(-limit);
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return [];
    }
  }

  // Limpar sessão
  async clearSession(userId: string): Promise<void> {
    this.sessions.delete(userId);
    
    try {
      await prisma.chatSession.deleteMany({
        where: { userId }
      });
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  }

  // Gerar sugestões inteligentes
  async generateSuggestions(userId: string, context: any): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userMissions: { take: 5 },
          userAchievements: { take: 5 }
        }
      });

      const suggestions: string[] = [];

      // Sugestões baseadas no contexto
      if (context.bookingInProgress) {
        suggestions.push('Finalizar reserva', 'Ver outras opções', 'Falar com atendente');
      } else if (context.currentHotel) {
        suggestions.push('Ver detalhes', 'Fazer reserva', 'Ver avaliações');
      } else {
        suggestions.push('Buscar hotéis', 'Ver atrações', 'Ver promoções');
      }

      // Sugestões baseadas em gamificação
      if (user?.userMissions && user.userMissions.length > 0) {
        suggestions.push('Ver minhas missões', 'Ver meus pontos');
      }

      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      return ['Buscar hotéis', 'Ver atrações', 'Ajuda'];
    }
  }
}

export const advancedChatbotService = new AdvancedChatbotService(); 