import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// GET - Listar todos os pagamentos
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        reservation: {
          select: {
            id: true,
            hotelName: true
          }
        },
        order: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      userId: payment.userId,
      userName: payment.user.name,
      userEmail: payment.user.email,
      reservationId: payment.reservationId,
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      gateway: payment.gateway,
      status: payment.status,
      gatewayId: payment.gatewayId,
      gatewayData: payment.gatewayData ? JSON.parse(payment.gatewayData) : null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 