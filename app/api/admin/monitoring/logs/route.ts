import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

// GET - Obter logs do sistema
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Em um ambiente real, você buscaria os logs do banco
    // const logs = await prisma.systemLog.findMany({
    //   where: {
    //     ...(level && { level }),
    //     ...(category && { category })
    //   },
    //   orderBy: { timestamp: 'desc' },
    //   take: limit,
    //   skip: offset
    // });

    // Simular logs do sistema
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        category: 'auth',
        message: 'Usuário admin@reservei.com fez login com sucesso',
        userId: 'admin',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        duration: 150,
        details: { method: 'POST', route: '/api/admin/login' }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'warning',
        category: 'database',
        message: 'Query lenta detectada: SELECT * FROM reservations WHERE date > ?',
        details: { 
          query: 'SELECT * FROM reservations WHERE date > ?', 
          duration: 2500,
          table: 'reservations',
          rows: 1500
        },
        duration: 2500
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'error',
        category: 'api',
        message: 'Erro 500 na rota /api/admin/hoteis',
        details: { 
          route: '/api/admin/hoteis', 
          error: 'Database connection failed',
          stack: 'Error: connect ECONNREFUSED 127.0.0.1:5432'
        },
        duration: 5000
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        level: 'info',
        category: 'backup',
        message: 'Backup automático concluído com sucesso',
        details: { 
          size: '145.6 MB', 
          duration: 180,
          tables: ['users', 'reservations', 'hotels', 'attractions', 'payments'],
          compression: 0.65
        },
        duration: 180
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        level: 'critical',
        category: 'system',
        message: 'Uso de CPU acima de 90%',
        details: { 
          cpu: 95, 
          threshold: 90,
          load: [2.5, 2.3, 2.1],
          uptime: 86400
        },
        duration: 0
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'info',
        category: 'email',
        message: 'Campanha de email enviada: Newsletter Semanal',
        details: { 
          campaignId: '1',
          recipients: 1250,
          sent: 1230,
          failed: 20
        },
        duration: 45
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 360000).toISOString(),
        level: 'warning',
        category: 'security',
        message: 'Múltiplas tentativas de login falhadas',
        details: { 
          ip: '192.168.1.105',
          attempts: 5,
          user: 'unknown@example.com',
          blocked: true
        },
        duration: 0
      },
      {
        id: '8',
        timestamp: new Date(Date.now() - 420000).toISOString(),
        level: 'info',
        category: 'payment',
        message: 'Pagamento processado com sucesso',
        details: { 
          paymentId: 'pay_123456',
          amount: 1250.00,
          method: 'credit_card',
          gateway: 'stripe'
        },
        duration: 1200
      }
    ];

    // Filtrar logs baseado nos parâmetros
    let filteredLogs = mockLogs;
    
    if (level && level !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    // Aplicar paginação
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return NextResponse.json({
      logs: paginatedLogs,
      total: filteredLogs.length,
      limit,
      offset,
      hasMore: offset + limit < filteredLogs.length
    });
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo log
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    const { level, category, message, details, userId, ip, userAgent, duration } = data;

    if (!level || !category || !message) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    // Em um ambiente real, você salvaria o log no banco
    // const log = await prisma.systemLog.create({
    //   data: {
    //     level,
    //     category,
    //     message,
    //     details: details ? JSON.stringify(details) : null,
    //     userId: userId || user.id,
    //     ip: ip || request.headers.get('x-forwarded-for') || request.ip,
    //     userAgent: userAgent || request.headers.get('user-agent'),
    //     duration: duration || 0,
    //     timestamp: new Date()
    //   }
    // });

    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      userId: userId || user.id,
      ip: ip || '192.168.1.100',
      userAgent: userAgent || 'Mozilla/5.0',
      duration: duration || 0
    };

    console.log('Novo log criado:', newLog);

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar log:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 