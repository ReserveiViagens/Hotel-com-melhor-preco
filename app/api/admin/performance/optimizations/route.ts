import { NextRequest, NextResponse } from 'next/server';
import { autoScaling } from '@/lib/auto-scaling';

export async function GET() {
  try {
    const optimizations = await autoScaling.getOptimizations();
    return NextResponse.json(optimizations);
  } catch (error) {
    console.error('Erro ao obter otimizações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { optimizationId } = body;

    if (!optimizationId) {
      return NextResponse.json(
        { error: 'ID da otimização é obrigatório' },
        { status: 400 }
      );
    }

    // Aplicar otimização
    const success = await autoScaling.applyOptimization(optimizationId);
    
    if (success) {
      return NextResponse.json({ message: 'Otimização aplicada com sucesso' });
    } else {
      return NextResponse.json(
        { error: 'Erro ao aplicar otimização' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao aplicar otimização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 