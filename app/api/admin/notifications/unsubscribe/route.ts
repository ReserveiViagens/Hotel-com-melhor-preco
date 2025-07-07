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

// POST - Cancelar inscrição de push notifications
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    const { endpoint } = data;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint obrigatório' }, { status: 400 });
    }

    // Em um ambiente real, você removeria a inscrição do banco
    // const result = await prisma.pushSubscription.updateMany({
    //   where: {
    //     userId: user.id,
    //     endpoint: endpoint
    //   },
    //   data: {
    //     isActive: false,
    //     unsubscribedAt: new Date()
    //   }
    // });

    // Simular remoção da inscrição
    console.log('Inscrição de push notification cancelada:', {
      userId: user.id,
      endpoint: endpoint.substring(0, 50) + '...'
    });

    return NextResponse.json({
      success: true,
      message: 'Inscrição cancelada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 