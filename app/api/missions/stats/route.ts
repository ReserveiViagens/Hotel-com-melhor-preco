import { NextRequest, NextResponse } from 'next/server';
import { dailyMissionService } from '@/lib/daily-missions';

// GET /api/missions/stats - Obter estatísticas de missões
export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste

    const stats = await dailyMissionService.getMissionStats(userId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas de missões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 