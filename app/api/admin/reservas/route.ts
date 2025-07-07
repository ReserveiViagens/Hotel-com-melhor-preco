import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// GET - Listar todas as reservas
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        hotel: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PATCH - Atualizar status da reserva
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID da reserva não fornecido' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        hotel: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova reserva
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }
    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    const body = await request.json();
    const {
      userId,
      hotelId,
      apartmentId,
      checkIn,
      checkOut,
      adults,
      children,
      babies,
      totalPrice,
      paidAmount,
      paymentMethod,
      installmentPlan,
      realEstateAgent,
      isCota,
      cotaInfo,
      specialRequests,
      notes,
      channel
    } = body;
    if (!userId || !hotelId || !checkIn || !checkOut || !totalPrice) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 });
    }
    const remainingAmount = totalPrice - (paidAmount || 0);
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        hotelId,
        apartmentId: apartmentId || null,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        adults: parseInt(adults) || 0,
        children: parseInt(children) || 0,
        babies: parseInt(babies) || 0,
        totalPrice: parseFloat(totalPrice),
        paidAmount: parseFloat(paidAmount) || 0,
        remainingAmount,
        paymentMethod,
        installmentPlan,
        realEstateAgent,
        isCota: Boolean(isCota),
        cotaInfo: cotaInfo ? JSON.parse(cotaInfo) : null,
        specialRequests,
        notes,
        channel: channel || 'website'
      },
      include: {
        user: true,
        hotel: true,
        apartment: true
      }
    });
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 