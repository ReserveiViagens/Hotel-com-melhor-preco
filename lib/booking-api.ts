import axios from 'axios';

export interface BookingHotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  price: {
    amount: number;
    currency: string;
  };
  amenities: string[];
  images: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  availability: {
    available: boolean;
    checkIn: string;
    checkOut: string;
  };
}

export interface BookingSearchParams {
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms: number;
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  amenities?: string[];
}

class BookingAPI {
  private apiKey: string;
  private baseURL: string;
  private partnerId: string;

  constructor() {
    this.apiKey = process.env.BOOKING_API_KEY || '';
    this.baseURL = 'https://distribution-xml.booking.com/2.4/json';
    this.partnerId = process.env.BOOKING_PARTNER_ID || '';
  }

  // Verificar se a API está configurada
  private isConfigured(): boolean {
    return !!(this.apiKey && this.partnerId);
  }

  // Buscar hotéis
  async searchHotels(params: BookingSearchParams): Promise<BookingHotel[]> {
    if (!this.isConfigured()) {
      console.warn('Booking.com API não configurada');
      return this.getMockHotels();
    }

    try {
      const response = await axios.get(`${this.baseURL}/hotels`, {
        params: {
          partner_id: this.partnerId,
          auth: this.apiKey,
          checkin: params.checkIn,
          checkout: params.checkOut,
          adults: params.adults,
          children: params.children || 0,
          rooms: params.rooms,
          city: params.city,
          country: params.country,
          price_min: params.minPrice,
          price_max: params.maxPrice,
          rating: params.rating,
          amenities: params.amenities?.join(',')
        }
      });

      return this.transformBookingResponse(response.data);
    } catch (error) {
      console.error('Erro na busca de hotéis do Booking.com:', error);
      return this.getMockHotels();
    }
  }

  // Obter detalhes de um hotel específico
  async getHotelDetails(hotelId: string): Promise<BookingHotel | null> {
    if (!this.isConfigured()) {
      return this.getMockHotel(hotelId);
    }

    try {
      const response = await axios.get(`${this.baseURL}/hotels/${hotelId}`, {
        params: {
          partner_id: this.partnerId,
          auth: this.apiKey
        }
      });

      return this.transformHotelResponse(response.data);
    } catch (error) {
      console.error('Erro ao obter detalhes do hotel:', error);
      return null;
    }
  }

  // Verificar disponibilidade
  async checkAvailability(hotelId: string, checkIn: string, checkOut: string, guests: number): Promise<{
    available: boolean;
    price?: number;
    currency?: string;
    rooms?: number;
  }> {
    if (!this.isConfigured()) {
      return {
        available: Math.random() > 0.3,
        price: Math.floor(Math.random() * 500) + 100,
        currency: 'BRL',
        rooms: Math.floor(Math.random() * 5) + 1
      };
    }

    try {
      const response = await axios.get(`${this.baseURL}/hotels/${hotelId}/availability`, {
        params: {
          partner_id: this.partnerId,
          auth: this.apiKey,
          checkin: checkIn,
          checkout: checkOut,
          guests: guests
        }
      });

      return {
        available: response.data.available,
        price: response.data.price?.amount,
        currency: response.data.price?.currency,
        rooms: response.data.rooms
      };
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return { available: false };
    }
  }

  // Sincronizar preços
  async syncPrices(hotelIds: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();

    for (const hotelId of hotelIds) {
      try {
        const availability = await this.checkAvailability(
          hotelId,
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          2
        );

        if (availability.available && availability.price) {
          prices.set(hotelId, availability.price);
        }
      } catch (error) {
        console.error(`Erro ao sincronizar preço do hotel ${hotelId}:`, error);
      }
    }

    return prices;
  }

  // Transformar resposta da API
  private transformBookingResponse(data: any): BookingHotel[] {
    if (!data.result || !Array.isArray(data.result)) {
      return [];
    }

    return data.result.map((hotel: any) => ({
      id: hotel.hotel_id,
      name: hotel.hotel_name,
      description: hotel.description || '',
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      rating: hotel.review_score || 0,
      reviewCount: hotel.review_count || 0,
      price: {
        amount: hotel.price?.amount || 0,
        currency: hotel.price?.currency || 'BRL'
      },
      amenities: hotel.amenities || [],
      images: hotel.images || [],
      coordinates: {
        latitude: hotel.latitude || 0,
        longitude: hotel.longitude || 0
      },
      availability: {
        available: hotel.available || false,
        checkIn: hotel.checkin || '',
        checkOut: hotel.checkout || ''
      }
    }));
  }

  // Transformar resposta de hotel individual
  private transformHotelResponse(data: any): BookingHotel | null {
    if (!data.result) {
      return null;
    }

    const hotel = data.result;
    return {
      id: hotel.hotel_id,
      name: hotel.hotel_name,
      description: hotel.description || '',
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      rating: hotel.review_score || 0,
      reviewCount: hotel.review_count || 0,
      price: {
        amount: hotel.price?.amount || 0,
        currency: hotel.price?.currency || 'BRL'
      },
      amenities: hotel.amenities || [],
      images: hotel.images || [],
      coordinates: {
        latitude: hotel.latitude || 0,
        longitude: hotel.longitude || 0
      },
      availability: {
        available: hotel.available || false,
        checkIn: hotel.checkin || '',
        checkOut: hotel.checkout || ''
      }
    };
  }

  // Dados mock para desenvolvimento
  private getMockHotels(): BookingHotel[] {
    return [
      {
        id: 'booking_001',
        name: 'Hotel Luxo Resort',
        description: 'Resort de luxo com vista para o mar',
        address: 'Av. Beira Mar, 1000',
        city: 'Fortaleza',
        country: 'Brasil',
        rating: 4.8,
        reviewCount: 1250,
        price: { amount: 450, currency: 'BRL' },
        amenities: ['Wi-Fi', 'Piscina', 'Spa', 'Restaurante'],
        images: ['https://via.placeholder.com/400x300'],
        coordinates: { latitude: -3.7319, longitude: -38.5267 },
        availability: { available: true, checkIn: '2024-01-15', checkOut: '2024-01-20' }
      },
      {
        id: 'booking_002',
        name: 'Pousada Charmosa',
        description: 'Pousada familiar no centro histórico',
        address: 'Rua das Flores, 123',
        city: 'Salvador',
        country: 'Brasil',
        rating: 4.5,
        reviewCount: 890,
        price: { amount: 280, currency: 'BRL' },
        amenities: ['Wi-Fi', 'Café da manhã', 'Estacionamento'],
        images: ['https://via.placeholder.com/400x300'],
        coordinates: { latitude: -12.9714, longitude: -38.5011 },
        availability: { available: true, checkIn: '2024-01-15', checkOut: '2024-01-20' }
      },
      {
        id: 'booking_003',
        name: 'Hotel Business Center',
        description: 'Hotel executivo próximo ao centro empresarial',
        address: 'Av. Paulista, 2000',
        city: 'São Paulo',
        country: 'Brasil',
        rating: 4.2,
        reviewCount: 2100,
        price: { amount: 380, currency: 'BRL' },
        amenities: ['Wi-Fi', 'Academia', 'Sala de reuniões', 'Restaurante'],
        images: ['https://via.placeholder.com/400x300'],
        coordinates: { latitude: -23.5505, longitude: -46.6333 },
        availability: { available: true, checkIn: '2024-01-15', checkOut: '2024-01-20' }
      }
    ];
  }

  private getMockHotel(hotelId: string): BookingHotel | null {
    const hotels = this.getMockHotels();
    return hotels.find(h => h.id === hotelId) || null;
  }

  // Comparar preços com nossa base
  async comparePrices(hotelId: string, ourPrice: number): Promise<{
    bookingPrice: number;
    difference: number;
    percentage: number;
    cheaper: boolean;
  }> {
    const bookingHotel = await this.getHotelDetails(hotelId);
    
    if (!bookingHotel) {
      return {
        bookingPrice: 0,
        difference: 0,
        percentage: 0,
        cheaper: false
      };
    }

    const bookingPrice = bookingHotel.price.amount;
    const difference = ourPrice - bookingPrice;
    const percentage = ((difference / bookingPrice) * 100);
    const cheaper = ourPrice < bookingPrice;

    return {
      bookingPrice,
      difference: Math.abs(difference),
      percentage: Math.abs(percentage),
      cheaper
    };
  }

  // Obter recomendações baseadas em histórico
  async getRecommendations(userId: string, preferences: {
    budget: number;
    amenities: string[];
    location: string;
  }): Promise<BookingHotel[]> {
    // Implementar lógica de recomendação baseada em ML
    const hotels = await this.searchHotels({
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      adults: 2,
      rooms: 1,
      city: preferences.location,
      maxPrice: preferences.budget
    });

    // Filtrar por amenities preferidas
    return hotels.filter(hotel => 
      preferences.amenities.some(amenity => 
        hotel.amenities.includes(amenity)
      )
    );
  }
}

export const bookingAPI = new BookingAPI(); 