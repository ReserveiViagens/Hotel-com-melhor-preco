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

// GET - Listar segmentos
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Simular dados de segmentos
    const segments = [
      {
        id: '1',
        name: 'Todos os Assinantes',
        description: 'Lista completa de assinantes ativos',
        criteria: { status: 'active' },
        subscriberCount: 1250,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Clientes VIP',
        description: 'Clientes com mais de 5 reservas',
        criteria: { 
          reservations: { $gte: 5 },
          totalSpent: { $gte: 2000 }
        },
        subscriberCount: 180,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Novos Cadastros',
        description: 'Usuários cadastrados nos últimos 30 dias',
        criteria: { 
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
        },
        subscriberCount: 95,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Interessados em Hotéis',
        description: 'Usuários que fizeram reservas de hotéis',
        criteria: { 
          reservationType: 'hotel',
          lastReservation: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() }
        },
        subscriberCount: 420,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Fãs de Atrações',
        description: 'Usuários que compraram ingressos para atrações',
        criteria: { 
          reservationType: 'attraction',
          frequency: { $gte: 3 }
        },
        subscriberCount: 280,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Clientes Inativos',
        description: 'Usuários sem reservas nos últimos 6 meses',
        criteria: { 
          lastReservation: { $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() },
          status: 'inactive'
        },
        subscriberCount: 150,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(segments);
  } catch (error) {
    console.error('Erro ao buscar segmentos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo segmento
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.name || !data.criteria) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    // Simular criação de segmento
    const newSegment = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description || '',
      criteria: data.criteria,
      subscriberCount: Math.floor(Math.random() * 500) + 10, // Simular contagem
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(newSegment, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar segmento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 