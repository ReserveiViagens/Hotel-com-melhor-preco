import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurações do Stripe
const STRIPE_CONFIG = {
  baseURL: 'https://api.stripe.com',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_1234567890',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_1234567890',
};

// Criar Payment Intent no Stripe
export async function POST(request: NextRequest) {
  try {
    const { 
      reservationId, 
      orderId, 
      amount, 
      description, 
      payerEmail, 
      payerName,
      currency = 'brl',
      paymentMethod = 'credit_card'
    } = await request.json();

    // Validações
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    if (!payerEmail || !payerName) {
      return NextResponse.json({ error: 'Dados do pagador são obrigatórios' }, { status: 400 });
    }

    // Criar Payment Intent no Stripe
    const paymentIntentData = {
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: currency.toLowerCase(),
      description: description || 'Reserva - Reservei Viagens',
      receipt_email: payerEmail,
      metadata: {
        reservationId: reservationId || '',
        orderId: orderId || '',
        payerName,
        payerEmail,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    const response = await fetch(`${STRIPE_CONFIG.baseURL}/v1/payment_intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${STRIPE_CONFIG.secretKey}`,
      },
      body: new URLSearchParams(paymentIntentData as any).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Stripe:', data);
      return NextResponse.json({ 
        error: 'Erro ao criar pagamento no Stripe',
        details: data 
      }, { status: 400 });
    }

    // Salvar pagamento no banco
    const payment = await prisma.payment.create({
      data: {
        userId: 'temp-user-id', // Substituir por ID real do usuário
        reservationId: reservationId || null,
        orderId: orderId || null,
        amount,
        method: paymentMethod,
        gateway: 'stripe',
        status: 'pending',
        gatewayId: data.id,
        gatewayData: data,
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        gatewayId: data.id,
        clientSecret: data.client_secret,
        publishableKey: STRIPE_CONFIG.publishableKey,
      },
    });

  } catch (error) {
    console.error('Erro ao criar pagamento Stripe:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Confirmar pagamento no Stripe
export async function PUT(request: NextRequest) {
  try {
    const { paymentIntentId, paymentMethodId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'ID do Payment Intent é obrigatório' }, { status: 400 });
    }

    // Confirmar Payment Intent no Stripe
    const confirmData: any = {
      payment_intent: paymentIntentId,
    };

    if (paymentMethodId) {
      confirmData.payment_method = paymentMethodId;
    }

    const response = await fetch(`${STRIPE_CONFIG.baseURL}/v1/payment_intents/${paymentIntentId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${STRIPE_CONFIG.secretKey}`,
      },
      body: new URLSearchParams(confirmData).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao confirmar pagamento Stripe:', data);
      return NextResponse.json({ 
        error: 'Erro ao confirmar pagamento no Stripe',
        details: data 
      }, { status: 400 });
    }

    // Atualizar pagamento no banco
    const payment = await prisma.payment.findFirst({
      where: { gatewayId: paymentIntentId },
    });

    if (payment) {
      const statusMap: { [key: string]: string } = {
        'requires_payment_method': 'pending',
        'requires_confirmation': 'pending',
        'requires_action': 'pending',
        'processing': 'pending',
        'requires_capture': 'pending',
        'canceled': 'failed',
        'succeeded': 'paid',
      };

      const newStatus = statusMap[data.status] || 'pending';

      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: newStatus,
          gatewayData: data,
        },
      });

      // Atualizar status da reserva/pedido
      if (payment.reservationId && newStatus === 'paid') {
        await prisma.reservation.update({
          where: { id: payment.reservationId },
          data: { paymentStatus: 'paid' },
        });
      }

      if (payment.orderId && newStatus === 'paid') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'paid' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment?.id,
        status: data.status,
        gatewayId: data.id,
        clientSecret: data.client_secret,
      },
    });

  } catch (error) {
    console.error('Erro ao confirmar pagamento Stripe:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Consultar status do pagamento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const gatewayId = searchParams.get('gatewayId');

    if (!paymentId && !gatewayId) {
      return NextResponse.json({ error: 'ID do pagamento é obrigatório' }, { status: 400 });
    }

    let payment;
    
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });
    } else if (gatewayId) {
      payment = await prisma.payment.findFirst({
        where: { gatewayId },
      });
    }

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Consultar status no Stripe
    const response = await fetch(`${STRIPE_CONFIG.baseURL}/v1/payment_intents/${payment.gatewayId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_CONFIG.secretKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao consultar pagamento no Stripe' }, { status: 400 });
    }

    const stripeData = await response.json();

    // Mapear status do Stripe para nosso sistema
    const statusMap: { [key: string]: string } = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'processing': 'pending',
      'requires_capture': 'pending',
      'canceled': 'failed',
      'succeeded': 'paid',
    };

    const newStatus = statusMap[stripeData.status] || 'pending';

    // Atualizar status no banco se necessário
    if (payment.status !== newStatus) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: newStatus,
          gatewayData: stripeData,
        },
      });

      // Atualizar status da reserva/pedido
      if (payment.reservationId && newStatus === 'paid') {
        await prisma.reservation.update({
          where: { id: payment.reservationId },
          data: { paymentStatus: 'paid' },
        });
      }

      if (payment.orderId && newStatus === 'paid') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'paid' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: newStatus,
        amount: payment.amount,
        method: payment.method,
        gateway: payment.gateway,
        gatewayId: payment.gatewayId,
        createdAt: payment.createdAt,
        stripeData,
      },
    });

  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 