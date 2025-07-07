import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MERCADOPAGO_CONFIG = {
  baseURL: 'https://api.mercadopago.com',
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-1234567890',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook Mercado Pago recebido:', body);

    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Tipo de notificação não suportado' }, { status: 200 });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ message: 'ID do pagamento não encontrado' }, { status: 400 });
    }

    // Consultar dados do pagamento no Mercado Pago
    const response = await fetch(`${MERCADOPAGO_CONFIG.baseURL}/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Erro ao consultar pagamento no Mercado Pago');
      return NextResponse.json({ error: 'Erro ao consultar pagamento' }, { status: 400 });
    }

    const mercadoPagoData = await response.json();

    // Encontrar pagamento no nosso banco
    const payment = await prisma.payment.findFirst({
      where: { gatewayId: paymentId.toString() },
    });

    if (!payment) {
      console.error('Pagamento não encontrado no banco:', paymentId);
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Mapear status do Mercado Pago para nosso sistema
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'approved': 'paid',
      'authorized': 'paid',
      'in_process': 'pending',
      'in_mediation': 'pending',
      'rejected': 'failed',
      'cancelled': 'failed',
      'refunded': 'refunded',
      'charged_back': 'refunded',
    };

    const newStatus = statusMap[mercadoPagoData.status] || 'pending';

    // Atualizar status do pagamento
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: newStatus,
        gatewayData: mercadoPagoData,
        updatedAt: new Date(),
      },
    });

    // Atualizar status da reserva/pedido
    if (payment.reservationId && newStatus === 'paid') {
      await prisma.reservation.update({
        where: { id: payment.reservationId },
        data: { 
          paymentStatus: 'paid',
          status: 'confirmed',
        },
      });
    }

    if (payment.orderId && newStatus === 'paid') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { 
          paymentStatus: 'paid',
          status: 'confirmed',
        },
      });
    }

    // Log da atualização
    console.log(`Pagamento ${payment.id} atualizado para status: ${newStatus}`);

    return NextResponse.json({ 
      message: 'Webhook processado com sucesso',
      paymentId: payment.id,
      status: newStatus,
    });

  } catch (error) {
    console.error('Erro ao processar webhook Mercado Pago:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Método GET para verificação do webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Webhook Mercado Pago ativo',
    timestamp: new Date().toISOString(),
  });
} 