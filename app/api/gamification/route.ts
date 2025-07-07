import { NextRequest, NextResponse } from 'next/server';
import { gamificationService } from '@/lib/gamification';

// GET /api/gamification/stats - Obter estatísticas do usuário
export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste

    const stats = await gamificationService.getUserStats(userId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas de gamificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/points - Adicionar pontos
export async function POST(request: NextRequest) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste

    const { action, amount } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'Ação é obrigatória' },
        { status: 400 }
      );
    }

    const result = await gamificationService.addPoints(
      userId,
      action,
      amount
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 