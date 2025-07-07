import { NextRequest, NextResponse } from 'next/server';
import { seasonalEventService } from '@/lib/seasonal-events';

// GET /api/events/[eventId]/missions - Obter missões de um evento
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste

    const missions = await seasonalEventService.getUserEventMissions(
      userId,
      params.eventId
    );
    
    return NextResponse.json(missions);
  } catch (error) {
    console.error('Erro ao obter missões do evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/events/[eventId]/missions - Gerar missões para um evento
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste

    const missions = await seasonalEventService.generateEventMissions(
      userId,
      params.eventId
    );
    
    return NextResponse.json(missions);
  } catch (error) {
    console.error('Erro ao gerar missões do evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 