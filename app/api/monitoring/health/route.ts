import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/lib/monitoring';

// GET /api/monitoring/health - Health check do sistema
export async function GET(request: NextRequest) {
  try {
    const health = await monitoringService.healthCheck();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    return NextResponse.json({
      status: health.status,
      timestamp: new Date().toISOString(),
      checks: health.checks,
      details: health.details
    }, { status: statusCode });
  } catch (error) {
    console.error('Erro no health check:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Erro interno no health check'
    }, { status: 503 });
  }
} 