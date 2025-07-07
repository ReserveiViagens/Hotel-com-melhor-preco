import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import webpush from 'web-push';

const prisma = new PrismaClient();

// Configurar web-push
webpush.setVapidDetails(
  'mailto:admin@reservei.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9w6NMzH7g',
  process.env.VAPID_PRIVATE_KEY || 'your-private-key-here'
);

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

// POST - Enviar push notification
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    const { 
      title, 
      body, 
      icon, 
      badge, 
      image, 
      url, 
      tag, 
      requireInteraction, 
      silent,
      targetUsers,
      scheduleAt 
    } = data;

    if (!title || !body) {
      return NextResponse.json({ error: 'Título e corpo são obrigatórios' }, { status: 400 });
    }

    // Payload da notificação
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-72x72.png',
      image,
      url,
      tag: tag || 'reservei-notification',
      requireInteraction: requireInteraction || false,
      silent: silent || false,
      timestamp: Date.now(),
      data: {
        url,
        notificationId: Date.now().toString()
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/icons/open-action.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icons/close-action.png'
        }
      ]
    });

    // Em um ambiente real, você buscaria as inscrições ativas do banco
    // const subscriptions = await prisma.pushSubscription.findMany({
    //   where: {
    //     isActive: true,
    //     ...(targetUsers && { userId: { in: targetUsers } })
    //   }
    // });

    // Simular inscrições
    const mockSubscriptions = [
      {
        id: '1',
        userId: user.id,
        endpoint: 'https://fcm.googleapis.com/fcm/send/mock-endpoint-1',
        p256dh: 'mock-p256dh-key',
        auth: 'mock-auth-key'
      }
    ];

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Enviar notificações para todas as inscrições
    for (const subscription of mockSubscriptions) {
      try {
        // Em um ambiente real, você enviaria a notificação
        // await webpush.sendNotification(
        //   {
        //     endpoint: subscription.endpoint,
        //     keys: {
        //       p256dh: subscription.p256dh,
        //       auth: subscription.auth
        //     }
        //   },
        //   payload
        // );

        // Simular envio bem-sucedido
        console.log(`Notificação enviada para usuário ${subscription.userId}`);
        
        results.push({
          subscriptionId: subscription.id,
          userId: subscription.userId,
          status: 'success'
        });
        successCount++;
      } catch (error) {
        console.error(`Erro ao enviar notificação para ${subscription.userId}:`, error);
        
        results.push({
          subscriptionId: subscription.id,
          userId: subscription.userId,
          status: 'failed',
          error: error.message
        });
        failureCount++;

        // Se a inscrição é inválida, marcar como inativa
        if (error.statusCode === 410) {
          // await prisma.pushSubscription.update({
          //   where: { id: subscription.id },
          //   data: { isActive: false }
          // });
        }
      }
    }

    // Salvar log da notificação
    const notificationLog = {
      id: Date.now().toString(),
      title,
      body,
      payload,
      sentBy: user.id,
      sentAt: new Date(),
      successCount,
      failureCount,
      results
    };

    // Em um ambiente real, você salvaria o log no banco
    // await prisma.notificationLog.create({ data: notificationLog });

    return NextResponse.json({
      success: true,
      message: `Notificação enviada com sucesso para ${successCount} usuários`,
      stats: {
        total: mockSubscriptions.length,
        success: successCount,
        failed: failureCount
      },
      notificationId: notificationLog.id
    });
  } catch (error) {
    console.error('Erro ao enviar push notification:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 