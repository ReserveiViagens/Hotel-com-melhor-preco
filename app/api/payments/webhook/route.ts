import { NextRequest, NextResponse } from 'next/server'

interface WebhookData {
  id: string
  status: string
  amount: number
  gateway: string
  metadata?: {
    reservationId?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const gateway = request.headers.get('x-gateway') || 'unknown'
    
    console.log(`Webhook recebido do gateway: ${gateway}`, body)
    
    // Processar webhook baseado no gateway
    let webhookData: WebhookData
    
    switch (gateway) {
      case 'mercadoPago':
        webhookData = processMercadoPagoWebhook(body)
        break
      case 'pagarme':
        webhookData = processPagarmeWebhook(body)
        break
      case 'stone':
        webhookData = processStoneWebhook(body)
        break
      case 'stripe':
        webhookData = processStripeWebhook(body)
        break
      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Gateway não reconhecido' 
        }, { status: 400 })
    }
    
    // Atualizar status da reserva
    if (webhookData.metadata?.reservationId) {
      await updateReservationFromWebhook(
        webhookData.metadata.reservationId,
        webhookData.status,
        webhookData.id
      )
    }
    
    // Enviar notificação se necessário
    if (webhookData.status === 'approved') {
      await sendPaymentNotification(webhookData)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

function processMercadoPagoWebhook(body: any): WebhookData {
  return {
    id: body.data?.id || body.id,
    status: mapMercadoPagoStatus(body.data?.status || body.status),
    amount: body.data?.transaction_amount || body.amount,
    gateway: 'mercadoPago',
    metadata: {
      reservationId: body.data?.external_reference || body.metadata?.reservationId
    }
  }
}

function processPagarmeWebhook(body: any): WebhookData {
  return {
    id: body.id,
    status: mapPagarmeStatus(body.status),
    amount: body.amount,
    gateway: 'pagarme',
    metadata: {
      reservationId: body.metadata?.reservationId
    }
  }
}

function processStoneWebhook(body: any): WebhookData {
  return {
    id: body.id,
    status: mapStoneStatus(body.status),
    amount: body.amount,
    gateway: 'stone',
    metadata: {
      reservationId: body.metadata?.reservationId
    }
  }
}

function processStripeWebhook(body: any): WebhookData {
  return {
    id: body.data?.object?.id,
    status: mapStripeStatus(body.data?.object?.status),
    amount: body.data?.object?.amount,
    gateway: 'stripe',
    metadata: {
      reservationId: body.data?.object?.metadata?.reservationId
    }
  }
}

function mapMercadoPagoStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'approved': 'approved',
    'pending': 'pending',
    'rejected': 'rejected',
    'cancelled': 'cancelled'
  }
  return statusMap[status] || 'unknown'
}

function mapPagarmeStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'paid': 'approved',
    'pending': 'pending',
    'refused': 'rejected',
    'cancelled': 'cancelled'
  }
  return statusMap[status] || 'unknown'
}

function mapStoneStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'approved': 'approved',
    'pending': 'pending',
    'declined': 'rejected',
    'cancelled': 'cancelled'
  }
  return statusMap[status] || 'unknown'
}

function mapStripeStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'succeeded': 'approved',
    'pending': 'pending',
    'failed': 'rejected',
    'canceled': 'cancelled'
  }
  return statusMap[status] || 'unknown'
}

async function updateReservationFromWebhook(reservationId: string, status: string, transactionId: string) {
  // Aqui você atualizaria o status da reserva no banco de dados
  console.log(`Atualizando reserva ${reservationId} para status: ${status}`)
  console.log(`Transaction ID: ${transactionId}`)
  
  // Exemplo de atualização:
  // await db.reservation.update({
  //   where: { id: reservationId },
  //   data: { 
  //     status: status === 'approved' ? 'confirmada' : 'cancelada',
  //     transactionId,
  //     updatedAt: new Date()
  //   }
  // })
}

async function sendPaymentNotification(webhookData: WebhookData) {
  // Enviar notificação por email/WhatsApp quando pagamento for aprovado
  console.log(`Enviando notificação de pagamento aprovado para reserva: ${webhookData.metadata?.reservationId}`)
  
  // Exemplo de envio de email:
  // await sendEmail({
  //   to: customerEmail,
  //   subject: 'Pagamento Confirmado - Reservei Viagens',
  //   template: 'payment-confirmed',
  //   data: { reservationId, amount: webhookData.amount }
  // })
} 