import { NextRequest, NextResponse } from 'next/server';
import { dailyMissionService } from '@/lib/daily-missions';
import { rateLimiters } from '@/lib/rate-limiter';
import { missionSchemas, validateData } from '@/lib/validation';
import { auditService } from '@/lib/audit';

// POST /api/missions/progress - Atualizar progresso de missão
export async function POST(request: NextRequest) {
  try {
    // TODO: Implementar autenticação
    const userId = 'test-user-id'; // Temporário para teste
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Rate limiting
    const rateLimit = await rateLimiters.missions.checkLimit(`${userId}:${ipAddress}`);
    if (!rateLimit.allowed) {
      await auditService.logSecurityEvent('rate_limit_exceeded', {
        userId,
        ipAddress,
        action: 'mission_progress_update'
      }, 'medium', userId, ipAddress);

      return NextResponse.json(
        { 
          error: 'Rate limit excedido',
          retryAfter: rateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': rateLimit.retryAfter?.toString() || '60'
          }
        }
      );
    }

    // Detectar atividade suspeita
    const isSuspicious = await auditService.detectSuspiciousActivity(userId, 'mission_progress');
    if (isSuspicious) {
      return NextResponse.json(
        { error: 'Atividade suspeita detectada' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validação de entrada
    const validatedData = validateData(missionSchemas.updateProgress, body);
    const { missionId, progress } = validatedData;

    const completed = await dailyMissionService.updateMissionProgress(
      userId,
      missionId,
      progress
    );

    // Log de atividade
    await auditService.logActivity(
      userId,
      'mission_progress_update',
      'mission',
      {
        missionId,
        progress,
        completed,
        ipAddress
      },
      'low',
      ipAddress,
      request.headers.get('user-agent')
    );

    return NextResponse.json({ 
      completed,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso da missão:', error);
    
    if (error instanceof Error && error.message.includes('Validação falhou')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 