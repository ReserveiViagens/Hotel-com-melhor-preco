import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface PushNotification {
  id: string
  title: string
  body: string
  data?: Record<string, any>
  image?: string
  badge?: number
  sound?: string
  priority?: 'high' | 'normal' | 'low'
  ttl?: number
  channelId?: string
}

export interface NotificationSubscription {
  id: string
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  createdAt: Date
  updatedAt: Date
}

class PushNotificationService {
  private vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || ''
  }

  async subscribeUser(userId: string, subscription: PushSubscription) {
    try {
      const existingSubscription = await prisma.notificationSubscription.findFirst({
        where: { userId }
      })

      if (existingSubscription) {
        // Atualizar subscription existente
        await prisma.notificationSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            endpoint: subscription.endpoint,
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
            updatedAt: new Date()
          }
        })
      } else {
        // Criar nova subscription
        await prisma.notificationSubscription.create({
          data: {
            userId,
            endpoint: subscription.endpoint,
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao salvar subscription:', error)
      throw error
    }
  }

  async unsubscribeUser(userId: string) {
    try {
      await prisma.notificationSubscription.deleteMany({
        where: { userId }
      })
      return { success: true }
    } catch (error) {
      console.error('Erro ao remover subscription:', error)
      throw error
    }
  }

  async sendNotification(userId: string, notification: PushNotification) {
    try {
      const subscription = await prisma.notificationSubscription.findFirst({
        where: { userId }
      })

      if (!subscription) {
        throw new Error('Usuário não possui subscription para notificações')
      }

      const payload = this.createNotificationPayload(notification)
      const headers = this.createNotificationHeaders()

      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Erro ao enviar notificação: ${response.status}`)
      }

      // Salvar histórico da notificação
      await prisma.notificationHistory.create({
        data: {
          userId,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sentAt: new Date(),
          status: 'sent'
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      
      // Salvar erro no histórico
      await prisma.notificationHistory.create({
        data: {
          userId,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sentAt: new Date(),
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      })

      throw error
    }
  }

  async sendBulkNotification(userIds: string[], notification: PushNotification) {
    const results = []
    
    for (const userId of userIds) {
      try {
        await this.sendNotification(userId, notification)
        results.push({ userId, success: true })
      } catch (error) {
        results.push({ 
          userId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Erro desconhecido' 
        })
      }
    }

    return results
  }

  async sendNotificationToSegment(segment: string, notification: PushNotification) {
    try {
      // Buscar usuários do segmento
      const users = await prisma.user.findMany({
        where: {
          segments: {
            has: segment
          }
        },
        select: { id: true }
      })

      const userIds = users.map(user => user.id)
      return await this.sendBulkNotification(userIds, notification)
    } catch (error) {
      console.error('Erro ao enviar notificação para segmento:', error)
      throw error
    }
  }

  async getNotificationHistory(userId: string, limit = 50) {
    try {
      const history = await prisma.notificationHistory.findMany({
        where: { userId },
        orderBy: { sentAt: 'desc' },
        take: limit
      })

      return history
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      throw error
    }
  }

  async getNotificationStats() {
    try {
      const stats = await prisma.notificationHistory.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      })

      const total = await prisma.notificationHistory.count()
      const today = await prisma.notificationHistory.count({
        where: {
          sentAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })

      return {
        total,
        today,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status
          return acc
        }, {} as Record<string, number>)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  private createNotificationPayload(notification: PushNotification) {
    return {
      title: notification.title,
      body: notification.body,
      icon: notification.image || '/logo-reservei.png',
      badge: notification.badge || 1,
      data: notification.data || {},
      actions: [
        {
          action: 'view',
          title: 'Ver'
        },
        {
          action: 'dismiss',
          title: 'Fechar'
        }
      ],
      requireInteraction: notification.priority === 'high',
      tag: notification.id,
      renotify: true
    }
  }

  private createNotificationHeaders() {
    const ttl = 86400 // 24 horas

    return {
      'Content-Type': 'application/json',
      'TTL': ttl.toString(),
      'Urgency': 'high',
      'Authorization': `vapid t=${this.generateVAPIDToken()}, k=${this.vapidKeys.publicKey}`
    }
  }

  private generateVAPIDToken() {
    // Em produção, implementar geração de token JWT para VAPID
    return 'vapid-token-placeholder'
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

export const pushNotificationService = new PushNotificationService()

// Templates de notificações
export const notificationTemplates = {
  welcome: (userName: string) => ({
    title: `Bem-vindo, ${userName}!`,
    body: 'Obrigado por se cadastrar no Reservei Viagens. Descubra nossas melhores ofertas!',
    data: { type: 'welcome', action: 'explore' }
  }),

  newPromotion: (promotionName: string, discount: string) => ({
    title: '🎉 Nova Promoção Disponível!',
    body: `${promotionName} - ${discount} de desconto. Aproveite agora!`,
    data: { type: 'promotion', action: 'view_promotion' }
  }),

  bookingConfirmation: (bookingId: string, destination: string) => ({
    title: '✅ Reserva Confirmada!',
    body: `Sua reserva para ${destination} foi confirmada. ID: ${bookingId}`,
    data: { type: 'booking', action: 'view_booking', bookingId }
  }),

  paymentReminder: (amount: string, dueDate: string) => ({
    title: '💳 Lembrete de Pagamento',
    body: `Pagamento de ${amount} vence em ${dueDate}. Evite cancelamentos!`,
    data: { type: 'payment', action: 'pay_now' }
  }),

  priceDrop: (destination: string, oldPrice: string, newPrice: string) => ({
    title: '📉 Queda de Preço!',
    body: `${destination}: de ${oldPrice} por ${newPrice}. Economize agora!`,
    data: { type: 'price_drop', action: 'book_now' }
  }),

  specialOffer: (offer: string) => ({
    title: '⭐ Oferta Especial!',
    body: offer,
    data: { type: 'special_offer', action: 'claim_offer' }
  })
} 