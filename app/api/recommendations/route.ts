import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine } from '@/lib/recommendation-engine';
import { rateLimiters } from '@/lib/rate-limiter';
import { auditService } from '@/lib/audit';

// GET /api/recommendations - Obter recomendações personalizadas
export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Rate limiting
    const rateLimit = await rateLimiters.api.checkLimit(`${userId}:${ipAddress}`);
    if (!rateLimit.allowed) {
      await auditService.logSecurityEvent('rate_limit_exceeded', {
        userId,
        ipAddress,
        action: 'recommendations_request'
      }, 'medium', userId, ipAddress);

      return NextResponse.json(
        { error: 'Rate limit excedido' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const includePredictions = searchParams.get('predictions') === 'true';

    // Gerar recomendações
    const recommendations = await recommendationEngine.generateRecommendations(userId, limit);

    // Predições de comportamento (opcional)
    let predictions = null;
    if (includePredictions) {
      predictions = await recommendationEngine.predictUserBehavior(userId);
    }

    // Log de atividade
    await auditService.logActivity(
      userId,
      'recommendations_requested',
      'recommendations',
      {
        limit,
        count: recommendations.length,
        includePredictions
      },
      'low',
      ipAddress,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      recommendations,
      predictions,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      }
    });
  } catch (error) {
    console.error('Erro ao gerar recomendações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 