import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// PUT - Atualizar hotel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const hotel = await prisma.hotel.update({
      where: { id: params.id },
      data: {
        name,
        description,
        address,
        phone,
        email,
        price: parseFloat(price),
        rating: rating ? parseFloat(rating) : 0,
        amenities: amenities || '[]',
        images: images || '[]',
        active: active !== undefined ? active : true
      }
    });

    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Erro ao atualizar hotel:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar hotel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    await prisma.hotel.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Hotel deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar hotel:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 