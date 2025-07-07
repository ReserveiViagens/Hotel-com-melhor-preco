import { NextRequest, NextResponse } from 'next/server';
import { bookingAPI } from '@/lib/booking-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/price-comparison - Comparar preços
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = parseInt(searchParams.get('guests') || '2');

    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: hotelId, checkIn, checkOut' },
        { status: 400 }
      );
    }

    // Obter hotel da nossa base
    const ourHotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });

    if (!ourHotel) {
      return NextResponse.json(
        { error: 'Hotel não encontrado' },
        { status: 404 }
      );
    }

    // Obter preço do Booking.com
    const bookingAvailability = await bookingAPI.checkAvailability(
      hotelId,
      checkIn,
      checkOut,
      guests
    );

    // Comparar preços
    const comparison = {
      ourPrice: ourHotel.price,
      bookingPrice: bookingAvailability.price || 0,
      difference: Math.abs(ourHotel.price - (bookingAvailability.price || 0)),
      percentage: bookingAvailability.price 
        ? Math.abs(((ourHotel.price - bookingAvailability.price) / bookingAvailability.price) * 100)
        : 0,
      cheaper: ourHotel.price < (bookingAvailability.price || 0),
      savings: bookingAvailability.price 
        ? Math.max(0, bookingAvailability.price - ourHotel.price)
        : 0
    };

    return NextResponse.json({
      hotel: {
        id: ourHotel.id,
        name: ourHotel.name,
        location: ourHotel.address
      },
      dates: { checkIn, checkOut, guests },
      prices: comparison,
      availability: {
        ourHotel: true,
        booking: bookingAvailability.available
      }
    });

  } catch (error) {
    console.error('Erro na comparação de preços:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/price-comparison - Comparar múltiplos hotéis
export async function POST(request: NextRequest) {
  try {
    const { hotelIds, checkIn, checkOut, guests = 2 } = await request.json();

    if (!hotelIds || !Array.isArray(hotelIds) || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: hotelIds[], checkIn, checkOut' },
        { status: 400 }
      );
    }

    const comparisons = [];

    for (const hotelId of hotelIds) {
      try {
        // Obter hotel da nossa base
        const ourHotel = await prisma.hotel.findUnique({
          where: { id: hotelId }
        });

        if (!ourHotel) continue;

        // Obter preço do Booking.com
        const bookingAvailability = await bookingAPI.checkAvailability(
          hotelId,
          checkIn,
          checkOut,
          guests
        );

        const comparison = {
          hotelId,
          hotelName: ourHotel.name,
          ourPrice: ourHotel.price,
          bookingPrice: bookingAvailability.price || 0,
          difference: Math.abs(ourHotel.price - (bookingAvailability.price || 0)),
          percentage: bookingAvailability.price 
            ? Math.abs(((ourHotel.price - bookingAvailability.price) / bookingAvailability.price) * 100)
            : 0,
          cheaper: ourHotel.price < (bookingAvailability.price || 0),
          savings: bookingAvailability.price 
            ? Math.max(0, bookingAvailability.price - ourHotel.price)
            : 0,
          available: bookingAvailability.available
        };

        comparisons.push(comparison);
      } catch (error) {
        console.error(`Erro ao comparar hotel ${hotelId}:`, error);
      }
    }

    // Ordenar por economia (maior para menor)
    comparisons.sort((a, b) => b.savings - a.savings);

    return NextResponse.json({
      comparisons,
      summary: {
        totalHotels: comparisons.length,
        cheaperOnOurSite: comparisons.filter(c => c.cheaper).length,
        totalSavings: comparisons.reduce((sum, c) => sum + c.savings, 0),
        averageSavings: comparisons.length > 0 
          ? comparisons.reduce((sum, c) => sum + c.savings, 0) / comparisons.length 
          : 0
      }
    });

  } catch (error) {
    console.error('Erro na comparação múltipla de preços:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 