import { NextRequest, NextResponse } from 'next/server';
import { autoScaling } from '@/lib/auto-scaling';

export async function GET() {
  try {
    const [rules, history] = await Promise.all([
      autoScaling.getScalingRules(),
      autoScaling.getScalingHistory()
    ]);

    return NextResponse.json({
      rules,
      history,
      enabled: true // Simulado - em produção seria uma configuração real
    });
  } catch (error) {
    console.error('Erro ao obter dados de scaling:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled, ruleId, updates } = body;

    if (enabled !== undefined) {
      // Alternar auto-scaling
      if (enabled) {
        await autoScaling.startAutoScaling();
      } else {
        await autoScaling.stopAutoScaling();
      }
      
      return NextResponse.json({ 
        message: `Auto-scaling ${enabled ? 'iniciado' : 'parado'} com sucesso` 
      });
    }

    if (ruleId && updates) {
      // Atualizar regra de scaling
      const success = await autoScaling.updateScalingRule(ruleId, updates);
      
      if (success) {
        return NextResponse.json({ message: 'Regra atualizada com sucesso' });
      } else {
        return NextResponse.json(
          { error: 'Erro ao atualizar regra' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Parâmetros inválidos' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao gerenciar auto-scaling:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 