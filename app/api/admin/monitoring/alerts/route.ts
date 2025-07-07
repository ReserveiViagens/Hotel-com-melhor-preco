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

// GET - Obter regras de alerta
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Em um ambiente real, você buscaria as regras do banco
    // const alerts = await prisma.alertRule.findMany({
    //   where: { userId: user.id },
    //   orderBy: { createdAt: 'desc' }
    // });

    // Simular regras de alerta
    const mockAlerts = [
      {
        id: '1',
        name: 'CPU Alto',
        metric: 'cpu.usage',
        condition: 'gt',
        threshold: 80,
        enabled: true,
        severity: 'high',
        actions: ['email', 'slack', 'webhook'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Memória Baixa',
        metric: 'memory.available',
        condition: 'lt',
        threshold: 2 * 1024 * 1024 * 1024, // 2GB
        enabled: true,
        severity: 'medium',
        actions: ['email'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Disco Cheio',
        metric: 'disk.percentage',
        condition: 'gt',
        threshold: 90,
        enabled: true,
        severity: 'critical',
        actions: ['email', 'slack', 'webhook', 'sms'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Erros de API',
        metric: 'application.errors',
        condition: 'gt',
        threshold: 10,
        enabled: true,
        severity: 'high',
        actions: ['email', 'slack'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Tempo de Resposta Alto',
        metric: 'application.responseTime',
        condition: 'gt',
        threshold: 1000, // 1 segundo
        enabled: false,
        severity: 'medium',
        actions: ['email'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(mockAlerts);
  } catch (error) {
    console.error('Erro ao obter alertas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova regra de alerta
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    const { name, metric, condition, threshold, severity, actions } = data;

    if (!name || !metric || !condition || threshold === undefined || !severity) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    // Validar condições
    const validConditions = ['gt', 'lt', 'eq', 'gte', 'lte'];
    if (!validConditions.includes(condition)) {
      return NextResponse.json({ error: 'Condição inválida' }, { status: 400 });
    }

    // Validar severidade
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json({ error: 'Severidade inválida' }, { status: 400 });
    }

    // Em um ambiente real, você salvaria no banco
    // const alert = await prisma.alertRule.create({
    //   data: {
    //     userId: user.id,
    //     name,
    //     metric,
    //     condition,
    //     threshold,
    //     severity,
    //     actions: JSON.stringify(actions || []),
    //     enabled: true
    //   }
    // });

    const newAlert = {
      id: Date.now().toString(),
      name,
      metric,
      condition,
      threshold,
      enabled: true,
      severity,
      actions: actions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Nova regra de alerta criada:', newAlert);

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar regra de alerta
export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    const { id, enabled, ...updates } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    }

    // Em um ambiente real, você atualizaria no banco
    // const alert = await prisma.alertRule.update({
    //   where: { id, userId: user.id },
    //   data: {
    //     ...updates,
    //     enabled,
    //     updatedAt: new Date()
    //   }
    // });

    // Simular atualização
    const updatedAlert = {
      id,
      ...updates,
      enabled,
      updatedAt: new Date().toISOString()
    };

    console.log('Regra de alerta atualizada:', updatedAlert);

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error('Erro ao atualizar alerta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Excluir regra de alerta
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    }

    // Em um ambiente real, você excluiria do banco
    // await prisma.alertRule.delete({
    //   where: { id, userId: user.id }
    // });

    console.log('Regra de alerta excluída:', id);

    return NextResponse.json({ success: true, message: 'Alerta excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir alerta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 