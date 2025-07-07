import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// GET - Listar todos os hotéis
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

    const hotels = await prisma.hotel.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(hotels);
  } catch (error) {
    console.error('Erro ao buscar hotéis:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo hotel
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
    const { name, description, address, phone, email, price, rating, amenities, images, active } = body;

    // Validações
    if (!name || !description || !address || !phone || !email || !price) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        price: parseFloat(price),
        rating: rating ? parseFloat(rating) : 0,
        amenities: amenities || [],
        images: images || [],
        active: active !== undefined ? active : true
      }
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar hotel:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 