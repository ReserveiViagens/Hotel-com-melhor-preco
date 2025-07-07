import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurações do Mercado Pago
const MERCADOPAGO_CONFIG = {
  baseURL: 'https://api.mercadopago.com',
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-1234567890',
};

// Criar pagamento no Mercado Pago
export async function POST(request: NextRequest) {
  try {
    const { 
      reservationId, 
      orderId, 
      amount, 
      description, 
      payerEmail, 
      payerName,
      payerPhone,
      payerDocument,
      paymentMethod = 'credit_card'
    } = await request.json();

    // Validações
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    if (!payerEmail || !payerName) {
      return NextResponse.json({ error: 'Dados do pagador são obrigatórios' }, { status: 400 });
    }

    // Criar preferência no Mercado Pago
    const preference = {
      items: [
        {
          title: description || 'Reserva - Reservei Viagens',
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: payerName,
        email: payerEmail,
        phone: payerPhone ? {
          area_code: payerPhone.substring(0, 2),
          number: payerPhone.substring(2),
        } : undefined,
        identification: payerDocument ? {
          type: 'CPF',
          number: payerDocument,
        } : undefined,
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/erro`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/pendente`,
      },
      auto_return: 'approved',
      external_reference: reservationId || orderId,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    };

    // Fazer requisição para o Mercado Pago
    const response = await fetch(`${MERCADOPAGO_CONFIG.baseURL}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Mercado Pago:', data);
      return NextResponse.json({ 
        error: 'Erro ao criar pagamento no Mercado Pago',
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
        gateway: 'mercadopago',
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
        checkoutUrl: data.init_point,
        sandboxUrl: data.sandbox_init_point,
      },
    });

  } catch (error) {
    console.error('Erro ao criar pagamento Mercado Pago:', error);
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

    // Consultar status no Mercado Pago
    const response = await fetch(`${MERCADOPAGO_CONFIG.baseURL}/v1/payments/${payment.gatewayId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao consultar pagamento no Mercado Pago' }, { status: 400 });
    }

    const mercadoPagoData = await response.json();

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

    // Atualizar status no banco se necessário
    if (payment.status !== newStatus) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: newStatus,
          gatewayData: mercadoPagoData,
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
        mercadoPagoData,
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