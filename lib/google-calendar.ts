import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

class GoogleCalendarService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Configurar credenciais do usuário
  setCredentials(userId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { googleAccessToken: true, googleRefreshToken: true }
        });

        if (!user?.googleAccessToken) {
          reject(new Error('Usuário não possui token do Google'));
          return;
        }

        this.oauth2Client.setCredentials({
          access_token: user.googleAccessToken,
          refresh_token: user.googleRefreshToken
        });

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Criar evento no Google Calendar
  async createEvent(userId: string, eventData: CalendarEvent) {
    try {
      await this.setCredentials(userId);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData,
        sendUpdates: 'all'
      });

      // Salvar referência do evento no banco
      await prisma.calendarEvent.create({
        data: {
          reservationId: eventData.id,
          title: eventData.summary,
          description: eventData.description,
          startDate: new Date(eventData.start.dateTime),
          endDate: new Date(eventData.end.dateTime),
          type: 'checkin',
          externalId: event.data.id
        }
      });

      return event.data;
    } catch (error) {
      console.error('Erro ao criar evento no Google Calendar:', error);
      throw error;
    }
  }

  // Atualizar evento no Google Calendar
  async updateEvent(userId: string, eventId: string, eventData: Partial<CalendarEvent>) {
    try {
      await this.setCredentials(userId);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: eventData,
        sendUpdates: 'all'
      });

      // Atualizar evento no banco
      await prisma.calendarEvent.update({
        where: { externalId: eventId },
        data: {
          title: eventData.summary,
          description: eventData.description,
          startDate: eventData.start ? new Date(eventData.start.dateTime) : undefined,
          endDate: eventData.end ? new Date(eventData.end.dateTime) : undefined
        }
      });

      return event.data;
    } catch (error) {
      console.error('Erro ao atualizar evento no Google Calendar:', error);
      throw error;
    }
  }

  // Deletar evento do Google Calendar
  async deleteEvent(userId: string, eventId: string) {
    try {
      await this.setCredentials(userId);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      // Remover evento do banco
      await prisma.calendarEvent.delete({
        where: { externalId: eventId }
      });

      return true;
    } catch (error) {
      console.error('Erro ao deletar evento do Google Calendar:', error);
      throw error;
    }
  }

  // Listar eventos do Google Calendar
  async listEvents(userId: string, timeMin?: string, timeMax?: string) {
    try {
      await this.setCredentials(userId);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items;
    } catch (error) {
      console.error('Erro ao listar eventos do Google Calendar:', error);
      throw error;
    }
  }

  // Sincronizar reservas com Google Calendar
  async syncReservationsWithCalendar(userId: string) {
    try {
      // Buscar reservas do usuário
      const reservations = await prisma.reservation.findMany({
        where: { userId },
        include: { hotel: true }
      });

      for (const reservation of reservations) {
        // Verificar se já existe evento para esta reserva
        const existingEvent = await prisma.calendarEvent.findFirst({
          where: { reservationId: reservation.id }
        });

        if (!existingEvent) {
          // Criar evento de check-in
          await this.createEvent(userId, {
            id: reservation.id,
            summary: `Check-in: ${reservation.hotel.name}`,
            description: `Reserva confirmada para ${reservation.hotel.name}\n\nDetalhes:\n- Check-in: ${reservation.checkIn.toLocaleDateString('pt-BR')}\n- Check-out: ${reservation.checkOut.toLocaleDateString('pt-BR')}\n- Hóspedes: ${reservation.adults} adultos, ${reservation.children} crianças\n- Valor: R$ ${reservation.totalPrice.toFixed(2)}`,
            start: {
              dateTime: reservation.checkIn.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            end: {
              dateTime: new Date(reservation.checkIn.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas de duração
              timeZone: 'America/Sao_Paulo'
            },
            location: reservation.hotel.address,
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 60 },
                { method: 'email', minutes: 1440 } // 24 horas antes
              ]
            }
          });

          // Criar evento de check-out
          await this.createEvent(userId, {
            id: `${reservation.id}-checkout`,
            summary: `Check-out: ${reservation.hotel.name}`,
            description: `Check-out da reserva em ${reservation.hotel.name}\n\nLembre-se de fazer o check-out até ${reservation.checkOut.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
            start: {
              dateTime: reservation.checkOut.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            end: {
              dateTime: new Date(reservation.checkOut.getTime() + 1 * 60 * 60 * 1000).toISOString(), // 1 hora de duração
              timeZone: 'America/Sao_Paulo'
            },
            location: reservation.hotel.address,
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 30 },
                { method: 'email', minutes: 720 } // 12 horas antes
              ]
            }
          });
        }
      }

      return { success: true, message: 'Reservas sincronizadas com sucesso' };
    } catch (error) {
      console.error('Erro ao sincronizar reservas:', error);
      throw error;
    }
  }

  // Configurar lembretes automáticos
  async setupAutomaticReminders(userId: string) {
    try {
      const reservations = await prisma.reservation.findMany({
        where: { 
          userId,
          status: 'confirmed',
          checkIn: {
            gte: new Date()
          }
        },
        include: { hotel: true }
      });

      for (const reservation of reservations) {
        // Lembrete 1 dia antes do check-in
        const checkInReminder = new Date(reservation.checkIn.getTime() - 24 * 60 * 60 * 1000);
        
        if (checkInReminder > new Date()) {
          await this.createEvent(userId, {
            id: `${reservation.id}-reminder-1`,
            summary: `Lembrete: Check-in amanhã - ${reservation.hotel.name}`,
            description: `Sua reserva em ${reservation.hotel.name} começa amanhã!\n\nHorário de check-in: ${reservation.checkIn.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\nEndereço: ${reservation.hotel.address}`,
            start: {
              dateTime: checkInReminder.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            end: {
              dateTime: new Date(checkInReminder.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutos
              timeZone: 'America/Sao_Paulo'
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 0 }
              ]
            }
          });
        }

        // Lembrete 1 hora antes do check-in
        const checkInReminderHour = new Date(reservation.checkIn.getTime() - 60 * 60 * 1000);
        
        if (checkInReminderHour > new Date()) {
          await this.createEvent(userId, {
            id: `${reservation.id}-reminder-2`,
            summary: `Check-in em 1 hora - ${reservation.hotel.name}`,
            description: `Prepare-se! Seu check-in em ${reservation.hotel.name} será em 1 hora.\n\nEndereço: ${reservation.hotel.address}`,
            start: {
              dateTime: checkInReminderHour.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            end: {
              dateTime: new Date(checkInReminderHour.getTime() + 15 * 60 * 1000).toISOString(), // 15 minutos
              timeZone: 'America/Sao_Paulo'
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 0 }
              ]
            }
          });
        }
      }

      return { success: true, message: 'Lembretes automáticos configurados' };
    } catch (error) {
      console.error('Erro ao configurar lembretes:', error);
      throw error;
    }
  }

  // Obter URL de autorização
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Trocar código por tokens
  async getTokensFromCode(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Erro ao obter tokens:', error);
      throw error;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService(); 