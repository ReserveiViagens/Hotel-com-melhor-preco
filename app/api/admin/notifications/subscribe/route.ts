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

// POST - Inscrever para push notifications
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    const { subscription, userAgent, timestamp } = data;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Dados de inscrição inválidos' }, { status: 400 });
    }

    // Em um ambiente real, você salvaria a inscrição no banco
    // const subscriptionRecord = await prisma.pushSubscription.create({
    //   data: {
    //     userId: user.id,
    //     endpoint: subscription.endpoint,
    //     p256dh: subscription.keys?.p256dh,
    //     auth: subscription.keys?.auth,
    //     userAgent: userAgent,
    //     subscribedAt: new Date(timestamp)
    //   }
    // });

    // Simular salvamento da inscrição
    const subscriptionRecord = {
      id: Date.now().toString(),
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh,
      auth: subscription.keys?.auth,
      userAgent: userAgent,
      subscribedAt: new Date(timestamp),
      isActive: true
    };

    console.log('Nova inscrição de push notification:', {
      userId: user.id,
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      userAgent: userAgent
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscriptionRecord.id,
      message: 'Inscrição realizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao inscrever para push notifications:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 