import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// GET - Listar todos os clientes
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

    // Buscar clientes com estatísticas
    const clientes = await prisma.user.findMany({
      where: {
        role: 'client'
      },
      include: {
        _count: {
          select: {
            reservations: true
          }
        },
        reservations: {
          select: {
            totalPrice: true,
            createdAt: true,
            status: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatar dados para incluir estatísticas
    const clientesFormatados = clientes.map(cliente => {
      const totalSpent = cliente.reservations.reduce((sum, r) => {
        if (r.status === 'completed' || r.status === 'confirmed') {
          return sum + r.totalPrice;
        }
        return sum;
      }, 0);

      const avgRating = cliente.reviews.length > 0
        ? cliente.reviews.reduce((sum, r) => sum + r.rating, 0) / cliente.reviews.length
        : 0;

      return {
        id: cliente.id,
        name: cliente.name,
        email: cliente.email,
        phone: cliente.phone || '',
        cpf: cliente.cpf || '',
        birthDate: cliente.birthDate || null,
        address: cliente.address || '',
        city: cliente.city || '',
        state: cliente.state || '',
        zipCode: cliente.zipCode || '',
        active: cliente.active,
        createdAt: cliente.createdAt,
        updatedAt: cliente.updatedAt,
        totalReservations: cliente._count.reservations,
        totalSpent,
        lastReservation: cliente.reservations[0]?.createdAt || null,
        rating: avgRating
      };
    });

    return NextResponse.json(clientesFormatados);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 