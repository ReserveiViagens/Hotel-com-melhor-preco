import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// GET - Listar todas as atrações
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

    const attractions = await prisma.attraction.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(attractions);
  } catch (error) {
    console.error('Erro ao buscar atrações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova atração
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
    const { name, description, location, duration, price, rating, category, highlights, images, active } = body;

    // Validações
    if (!name || !description || !location || !duration || !price || !category) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    const attraction = await prisma.attraction.create({
      data: {
        name,
        description,
        location,
        duration,
        price: parseFloat(price),
        rating: rating ? parseFloat(rating) : 0,
        category,
        highlights: highlights || [],
        images: images || [],
        active: active !== undefined ? active : true
      }
    });

    return NextResponse.json(attraction, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar atração:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 