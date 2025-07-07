import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ApiUsageData {
  endpoint: string;
  method: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  responseTime?: number;
  statusCode: number;
}

export async function logApiUsage(data: ApiUsageData) {
  try {
    await prisma.apiUsage.create({
      data: {
        endpoint: data.endpoint,
        method: data.method,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        responseTime: data.responseTime,
        statusCode: data.statusCode,
      }
    });
  } catch (error) {
    console.error('Erro ao registrar uso da API:', error);
  }
}

export async function getApiUsageStats(days: number = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await prisma.apiUsage.groupBy({
      by: ['endpoint', 'method', 'statusCode'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      _avg: {
        responseTime: true
      }
    });

    const totalRequests = await prisma.apiUsage.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    const errorCount = await prisma.apiUsage.count({
      where: {
        createdAt: {
          gte: startDate
        },
        statusCode: {
          gte: 400
        }
      }
    });

    return {
      totalRequests,
      errorCount,
      errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
      endpointStats: stats,
      period: `${days} dias`
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas da API:', error);
    return null;
  }
}

export async function getTopUsers(days: number = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topUsers = await prisma.apiUsage.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate
        },
        userId: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Buscar informações dos usuários
    const userIds = topUsers.map(user => user.userId).filter(Boolean);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    return topUsers.map(user => {
      const userInfo = users.find(u => u.id === user.userId);
      return {
        userId: user.userId,
        userName: userInfo?.name || 'Usuário desconhecido',
        userEmail: userInfo?.email || '',
        requestCount: user._count.id
      };
    });
  } catch (error) {
    console.error('Erro ao obter top usuários:', error);
    return [];
  }
}

export async function cleanupOldLogs(days: number = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await prisma.apiUsage.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return deleted.count;
  } catch (error) {
    console.error('Erro ao limpar logs antigos:', error);
    return 0;
  }
} 