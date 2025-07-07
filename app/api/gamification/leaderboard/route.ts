import { NextRequest, NextResponse } from 'next/server';
import { gamificationService } from '@/lib/gamification';

// GET /api/gamification/leaderboard - Obter ranking de usuários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const leaderboard = await gamificationService.getLeaderboard(limit);
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Erro ao obter leaderboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 