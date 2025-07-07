import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import os from 'os';

const prisma = new PrismaClient();

// Verificar token JWT
function verifyToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, (process.env as any).JWT_SECRET || 'fallback-secret') as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Obter métricas do sistema
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    // Obter métricas reais do sistema
    const getSystemMetrics = () => {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercentage = Math.round((usedMem / totalMem) * 100);

      const cpus = os.cpus();
      const cpuUsage = Math.round(
        cpus.reduce((acc, cpu) => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b);
          const idle = cpu.times.idle;
          return acc + ((total - idle) / total);
        }, 0) / cpus.length * 100
      );

      const loadAvg = os.loadavg();

      return {
        cpu: {
          usage: cpuUsage,
          cores: cpus.length,
          temperature: Math.floor(Math.random() * 20) + 45, // Simulado
          load: loadAvg
        },
        memory: {
          total: totalMem,
          used: usedMem,
          available: freeMem,
          percentage: memPercentage
        },
        disk: {
          total: 500 * 1024 * 1024 * 1024, // Simulado 500GB
          used: 200 * 1024 * 1024 * 1024, // Simulado 200GB
          available: 300 * 1024 * 1024 * 1024, // Simulado 300GB
          percentage: 40,
          iops: Math.floor(Math.random() * 1000) + 500
        },
        network: {
          bytesIn: Math.floor(Math.random() * 1000000) + 500000,
          bytesOut: Math.floor(Math.random() * 500000) + 200000,
          packetsIn: Math.floor(Math.random() * 10000) + 5000,
          packetsOut: Math.floor(Math.random() * 5000) + 2000,
          connections: Math.floor(Math.random() * 100) + 50
        },
        database: {
          connections: Math.floor(Math.random() * 20) + 10,
          queries: Math.floor(Math.random() * 1000) + 500,
          slowQueries: Math.floor(Math.random() * 10),
          uptime: process.uptime(),
          size: 50 * 1024 * 1024 // Simulado 50MB
        },
        application: {
          requests: Math.floor(Math.random() * 1000) + 500,
          errors: Math.floor(Math.random() * 10),
          responseTime: Math.floor(Math.random() * 200) + 50,
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0'
        }
      };
    };

    const metrics = getSystemMetrics();

    // Retornar apenas o tipo solicitado ou todos
    if (type !== 'all' && metrics[type]) {
      return NextResponse.json(metrics[type]);
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 