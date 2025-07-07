import { NextRequest, NextResponse } from 'next/server';
import { seasonalEventService } from '@/lib/seasonal-events';

// GET /api/events - Obter eventos ativos
export async function GET(request: NextRequest) {
  try {
    const events = await seasonalEventService.getActiveEvents();
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Erro ao obter eventos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 