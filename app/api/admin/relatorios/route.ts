import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// GET - Gerar relatórios
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
    const periodo = searchParams.get('periodo') || '30';
    const dias = parseInt(periodo);

    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    // Métricas principais
    const totalReservas = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: dataInicio
        }
      }
    });

    const totalReceita = await prisma.reservation.aggregate({
      where: {
        createdAt: {
          gte: dataInicio
        },
        paymentStatus: 'paid'
      },
      _sum: {
        totalPrice: true
      }
    });

    const reservasConfirmadas = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: dataInicio
        },
        status: 'confirmed'
      }
    });

    const reservasPendentes = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: dataInicio
        },
        status: 'pending'
      }
    });

    const reservasCanceladas = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: dataInicio
        },
        status: 'cancelled'
      }
    });

    // Top hotéis
    const topHoteis = await prisma.hotel.findMany({
      include: {
        _count: {
          select: {
            reservations: {
              where: {
                createdAt: {
                  gte: dataInicio
                }
              }
            }
          }
        },
        reservations: {
          where: {
            createdAt: {
              gte: dataInicio
            },
            paymentStatus: 'paid'
          },
          select: {
            totalPrice: true
          }
        }
      },
      orderBy: {
        reservations: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Vendas por mês (últimos 6 meses)
    const vendasPorMes = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const inicioMes = new Date(data.getFullYear(), data.getMonth(), 1);
      const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0);

      const vendas = await prisma.reservation.count({
        where: {
          createdAt: {
            gte: inicioMes,
            lte: fimMes
          }
        }
      });

      const receita = await prisma.reservation.aggregate({
        where: {
          createdAt: {
            gte: inicioMes,
            lte: fimMes
          },
          paymentStatus: 'paid'
        },
        _sum: {
          totalPrice: true
        }
      });

      vendasPorMes.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
        vendas,
        receita: receita._sum.totalPrice || 0
      });
    }

    const mediaTicket = totalReceita._sum.totalPrice ? totalReceita._sum.totalPrice / totalReservas : 0;
    const taxaConversao = totalReservas > 0 ? (reservasConfirmadas / totalReservas) * 100 : 0;

    const relatorio = {
      periodo: `${periodo} dias`,
      totalReservas,
      totalReceita: totalReceita._sum.totalPrice || 0,
      reservasConfirmadas,
      reservasPendentes,
      reservasCanceladas,
      taxaConversao: parseFloat(taxaConversao.toFixed(1)),
      mediaTicket: parseFloat(mediaTicket.toFixed(2)),
      topHoteis: topHoteis.map(hotel => ({
        nome: hotel.name,
        reservas: hotel._count.reservations,
        receita: hotel.reservations.reduce((sum, r) => sum + r.totalPrice, 0)
      })),
      vendasPorMes
    };

    return NextResponse.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 