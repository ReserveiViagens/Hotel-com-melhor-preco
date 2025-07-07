import { NextRequest, NextResponse } from 'next/server';
import { dailyMissionService } from '@/lib/daily-missions';

// GET /api/missions - Obter missões do usuário
export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste

    const missions = await dailyMissionService.getUserMissions(userId);
    
    return NextResponse.json(missions);
  } catch (error) {
    console.error('Erro ao obter missões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/missions - Gerar novas missões
export async function POST(request: NextRequest) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste

    const missions = await dailyMissionService.generateDailyMissions(userId);
    
    return NextResponse.json(missions);
  } catch (error) {
    console.error('Erro ao gerar missões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 