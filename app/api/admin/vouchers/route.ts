import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateVoucher, VoucherData } from '@/lib/pdf-generator';

const prisma = new PrismaClient();

// Listar vouchers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    // Buscar reservas para vouchers de hotel
    const hotelReservations = await prisma.reservation.findMany({
      where: {
        ...where,
        paymentStatus: 'paid',
      },
      include: {
        user: true,
        hotel: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Buscar pedidos para vouchers de ingressos
    const ticketOrders = await prisma.order.findMany({
      where: {
        ...where,
        paymentStatus: 'paid',
        ticket: { isNot: null },
      },
      include: {
        ticket: {
          include: {
            attraction: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Combinar e formatar dados
    const vouchers = [
      ...hotelReservations.map(reservation => ({
        id: reservation.id,
        type: 'hotel' as const,
        customerName: reservation.user.name,
        customerEmail: reservation.user.email,
        customerPhone: reservation.user.phone,
        reservationNumber: reservation.id,
        hotelName: reservation.hotel.name,
        checkIn: reservation.checkIn.toISOString().split('T')[0],
        checkOut: reservation.checkOut.toISOString().split('T')[0],
        adults: reservation.adults,
        children: reservation.children,
        babies: reservation.babies,
        totalPrice: reservation.totalPrice,
        paymentStatus: reservation.paymentStatus,
        specialRequests: reservation.specialRequests,
        status: reservation.status,
        createdAt: reservation.createdAt,
      })),
      ...ticketOrders.map(order => ({
        id: order.id,
        type: 'ticket' as const,
        customerName: 'Cliente', // Buscar dados do usuário
        customerEmail: 'cliente@email.com',
        reservationNumber: order.id,
        attractionName: order.ticket?.attraction.name,
        ticketName: order.ticket?.name,
        eventDate: order.ticket?.date.toISOString().split('T')[0],
        eventTime: order.ticket?.time,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt,
      })),
    ];

    // Ordenar por data de criação
    vouchers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = hotelReservations.length + ticketOrders.length;

    return NextResponse.json({
      success: true,
      vouchers: vouchers.slice(0, limit),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar vouchers:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Gerar voucher PDF
export async function POST(request: NextRequest) {
  try {
    const { voucherId, type, template = 'classic' } = await request.json();

    if (!voucherId || !type) {
      return NextResponse.json({ error: 'ID do voucher e tipo são obrigatórios' }, { status: 400 });
    }

    let voucherData: VoucherData;

    if (type === 'hotel') {
      const reservation = await prisma.reservation.findUnique({
        where: { id: voucherId },
        include: {
          user: true,
          hotel: true,
        },
      });

      if (!reservation) {
        return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
      }

      voucherData = {
        id: reservation.id,
        type: 'hotel',
        customerName: reservation.user.name,
        customerEmail: reservation.user.email,
        customerPhone: reservation.user.phone || undefined,
        reservationNumber: reservation.id,
        hotelName: reservation.hotel.name,
        checkIn: reservation.checkIn.toLocaleDateString('pt-BR'),
        checkOut: reservation.checkOut.toLocaleDateString('pt-BR'),
        adults: reservation.adults,
        children: reservation.children,
        babies: reservation.babies,
        totalPrice: reservation.totalPrice,
        paymentStatus: reservation.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
        specialRequests: reservation.specialRequests || undefined,
        qrCodeData: `https://reservei.com/voucher/${reservation.id}`,
        terms: [
          'Este voucher deve ser apresentado no check-in junto com documento de identidade.',
          'Cancelamentos devem ser feitos com 24 horas de antecedência.',
          'Crianças até 5 anos não pagam (mediante comprovação).',
          'Horário de check-in: 14h00 | Check-out: 12h00',
        ],
      };
    } else if (type === 'ticket') {
      const order = await prisma.order.findUnique({
        where: { id: voucherId },
        include: {
          ticket: {
            include: {
              attraction: true,
            },
          },
        },
      });

      if (!order || !order.ticket) {
        return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
      }

      voucherData = {
        id: order.id,
        type: 'ticket',
        customerName: 'Cliente', // Buscar dados do usuário
        customerEmail: 'cliente@email.com',
        reservationNumber: order.id,
        attractionName: order.ticket.attraction.name,
        ticketName: order.ticket.name,
        eventDate: order.ticket.date.toLocaleDateString('pt-BR'),
        eventTime: order.ticket.time,
        adults: order.quantity,
        totalPrice: order.totalPrice,
        paymentStatus: order.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
        qrCodeData: `https://reservei.com/voucher/${order.id}`,
        validUntil: order.ticket.date.toLocaleDateString('pt-BR'),
        terms: [
          'Este voucher deve ser apresentado na entrada junto com documento de identidade.',
          'Não é permitida a entrada após o horário especificado.',
          'Em caso de chuva, o evento pode ser cancelado ou adiado.',
          'Não é permitido o compartilhamento deste voucher.',
        ],
      };
    } else {
      return NextResponse.json({ error: 'Tipo de voucher não suportado' }, { status: 400 });
    }

    // Gerar PDF
    const pdfBuffer = await generateVoucher(voucherData, template);

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="voucher-${voucherId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Erro ao gerar voucher:', error);
    return NextResponse.json({ 
      error: 'Erro ao gerar voucher',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 