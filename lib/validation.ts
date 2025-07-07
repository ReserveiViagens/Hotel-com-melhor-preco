import { z } from 'zod';

// Schemas de validação para gamificação
export const gamificationSchemas = {
  // Schema para adicionar pontos
  addPoints: z.object({
    userId: z.string().min(1, 'ID do usuário é obrigatório'),
    action: z.string().min(1, 'Ação é obrigatória'),
    points: z.number().int().positive('Pontos devem ser um número positivo'),
    metadata: z.record(z.any()).optional(),
  }),

  // Schema para obter estatísticas
  getUserStats: z.object({
    userId: z.string().min(1, 'ID do usuário é obrigatório'),
  }),

  // Schema para leaderboard
  leaderboard: z.object({
    limit: z.number().int().min(1).max(100).default(10),
    offset: z.number().int().min(0).default(0),
  }),
};

// Schemas de validação para missões
export const missionSchemas = {
  // Schema para atualizar progresso de missão
  updateProgress: z.object({
    missionId: z.string().min(1, 'ID da missão é obrigatório'),
    progress: z.number().int().min(0, 'Progresso deve ser um número não negativo'),
  }),

  // Schema para reivindicar recompensa
  claimReward: z.object({
    missionId: z.string().min(1, 'ID da missão é obrigatório'),
  }),

  // Schema para gerar missões
  generateMissions: z.object({
    userId: z.string().min(1, 'ID do usuário é obrigatório'),
  }),
};

// Schemas de validação para eventos
export const eventSchemas = {
  // Schema para atualizar progresso de evento
  updateEventProgress: z.object({
    eventId: z.string().min(1, 'ID do evento é obrigatório'),
    missionId: z.string().min(1, 'ID da missão é obrigatório'),
    progress: z.number().int().min(0, 'Progresso deve ser um número não negativo'),
  }),

  // Schema para obter missões de evento
  getEventMissions: z.object({
    eventId: z.string().min(1, 'ID do evento é obrigatório'),
  }),
};

// Schemas de validação para autenticação
export const authSchemas = {
  // Schema para login
  login: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  }),

  // Schema para registro
  register: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  }),

  // Schema para reset de senha
  resetPassword: z.object({
    email: z.string().email('Email inválido'),
  }),
};

// Schemas de validação para promoções
export const promotionSchemas = {
  // Schema para criar promoção
  createPromotion: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    code: z.string().min(1, 'Código é obrigatório'),
    type: z.enum(['percentage', 'fixed', 'free_shipping']),
    discountValue: z.number().positive('Valor do desconto deve ser positivo'),
    validFrom: z.string().datetime(),
    validUntil: z.string().datetime(),
    maxUses: z.number().int().positive().optional(),
    applicableModules: z.array(z.string()).optional(),
  }),

  // Schema para aplicar promoção
  applyPromotion: z.object({
    code: z.string().min(1, 'Código é obrigatório'),
    module: z.string().min(1, 'Módulo é obrigatório'),
    amount: z.number().positive('Valor deve ser positivo'),
  }),
};

// Schemas de validação para reservas
export const bookingSchemas = {
  // Schema para criar reserva
  createBooking: z.object({
    module: z.enum(['hoteis', 'ingressos', 'atracoes']),
    itemId: z.string().min(1, 'ID do item é obrigatório'),
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    guests: z.number().int().positive().optional(),
    quantity: z.number().int().positive().default(1),
    specialRequests: z.string().optional(),
  }),

  // Schema para atualizar reserva
  updateBooking: z.object({
    bookingId: z.string().min(1, 'ID da reserva é obrigatório'),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    notes: z.string().optional(),
  }),
};

// Função para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validação falhou: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Função para validar dados de forma segura (retorna null em caso de erro)
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}

// Função para sanitizar strings
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres potencialmente perigosos
    .substring(0, 1000); // Limita tamanho
}

// Função para validar e sanitizar email
export function validateEmail(email: string): string | null {
  const sanitized = sanitizeString(email).toLowerCase();
  const emailSchema = z.string().email();
  
  try {
    emailSchema.parse(sanitized);
    return sanitized;
  } catch {
    return null;
  }
}

// Função para validar e sanitizar nome
export function validateName(name: string): string | null {
  const sanitized = sanitizeString(name);
  const nameSchema = z.string().min(2).max(100);
  
  try {
    nameSchema.parse(sanitized);
    return sanitized;
  } catch {
    return null;
  }
} 