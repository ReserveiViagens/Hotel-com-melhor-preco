import { NextRequest, NextResponse } from 'next/server';
import { seasonalEventService } from '@/lib/seasonal-events';

// POST /api/events/progress - Atualizar progresso de missão de evento
export async function POST(request: NextRequest) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste

    const { eventId, missionId, progress } = await request.json();

    if (!eventId || !missionId || progress === undefined) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: eventId, missionId, progress' },
        { status: 400 }
      );
    }

    const completed = await seasonalEventService.updateEventMissionProgress(
      userId,
      eventId,
      missionId,
      progress
    );

    return NextResponse.json({ completed });
  } catch (error) {
    console.error('Erro ao atualizar progresso da missão de evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 