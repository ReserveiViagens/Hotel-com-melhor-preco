import { NextRequest, NextResponse } from 'next/server';
import { autoScaling } from '@/lib/auto-scaling';
import { distributedCache } from '@/lib/distributed-cache';
import { advancedMonitoring } from '@/lib/advanced-monitoring';

export async function GET() {
  try {
    // Obter métricas de diferentes serviços
    const [scalingMetrics, cacheStats, monitoringData] = await Promise.all([
      autoScaling.getScalingMetrics(1), // Última hora
      distributedCache.getStats(),
      advancedMonitoring.getDashboardData()
    ]);

    const currentMetrics = scalingMetrics[scalingMetrics.length - 1];
    const resourceUsage = await autoScaling.getResourceUsage();

    // Calcular métricas agregadas
    const metrics = {
      cpu: currentMetrics?.cpu || 0,
      memory: currentMetrics?.memory || 0,
      disk: currentMetrics?.disk || 0,
      network: currentMetrics?.network || 0,
      responseTime: currentMetrics?.responseTime || 0,
      requestsPerSecond: currentMetrics?.requestsPerSecond || 0,
      errorRate: currentMetrics?.errorRate || 0,
      cacheHitRate: cacheStats.connected ? parseFloat(cacheStats.hitRate) : 0,
      databaseConnections: Math.floor(Math.random() * 50) + 10, // Simulado
      activeUsers: Math.floor(Math.random() * 100) + 20, // Simulado
      uptime: monitoringData.summary?.uptime || 100,
      totalRequests: monitoringData.summary?.totalRequests || 0,
      averageResponseTime: monitoringData.summary?.averageResponseTime || 0,
      errorCount: monitoringData.summary?.errorRate || 0
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Erro ao obter métricas de performance:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 