import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// GET - Listar todos os ingressos
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

    const tickets = await prisma.ticket.findMany({
      include: {
        attraction: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar ingressos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo ingresso
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
    const { attractionId, name, description, date, time, price, availableTickets, totalTickets, category, active } = body;

    // Validações
    if (!attractionId || !name || !description || !date || !time || !price || !availableTickets || !totalTickets || !category) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    // Verificar se a atração existe
    const attraction = await prisma.attraction.findUnique({
      where: { id: attractionId }
    });

    if (!attraction) {
      return NextResponse.json({ error: 'Atração não encontrada' }, { status: 404 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        attractionId,
        name,
        description,
        date: new Date(date),
        time,
        price: parseFloat(price),
        availableTickets: parseInt(availableTickets),
        totalTickets: parseInt(totalTickets),
        category,
        active: active !== undefined ? active : true
      },
      include: {
        attraction: true
      }
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar ingresso:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 