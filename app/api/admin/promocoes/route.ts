import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar promoções
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar promoções
    const [promocoes, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.promotion.count({ where })
    ]);

    return NextResponse.json({
      promocoes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar promoções:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar promoção
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      description,
      type,
      discountType,
      discountValue,
      minValue,
      maxDiscount,
      validFrom,
      validUntil,
      maxUses,
      applicableModules,
      conditions
    } = body;

    // Validações
    if (!name || !code || !type || !discountType || !discountValue) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    // Verificar se o código já existe
    const existingPromotion = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingPromotion) {
      return NextResponse.json({ error: 'Código de promoção já existe' }, { status: 400 });
    }

    // Criar promoção
    const promocao = await prisma.promotion.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        type,
        discountType,
        discountValue: parseFloat(discountValue),
        minValue: minValue ? parseFloat(minValue) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        applicableModules: applicableModules || [],
        conditions: conditions || {},
        status: 'active',
        currentUses: 0
      }
    });

    return NextResponse.json({
      success: true,
      promocao,
      message: 'Promoção criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar promoção
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID da promoção não fornecido' }, { status: 400 });
    }

    // Verificar se a promoção existe
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id }
    });

    if (!existingPromotion) {
      return NextResponse.json({ error: 'Promoção não encontrada' }, { status: 404 });
    }

    // Se estiver alterando o código, verificar se já existe
    if (updateData.code && updateData.code !== existingPromotion.code) {
      const codeExists = await prisma.promotion.findUnique({
        where: { code: updateData.code.toUpperCase() }
      });

      if (codeExists) {
        return NextResponse.json({ error: 'Código de promoção já existe' }, { status: 400 });
      }
    }

    // Atualizar promoção
    const promocao = await prisma.promotion.update({
      where: { id },
      data: {
        ...updateData,
        code: updateData.code ? updateData.code.toUpperCase() : undefined,
        discountValue: updateData.discountValue ? parseFloat(updateData.discountValue) : undefined,
        minValue: updateData.minValue ? parseFloat(updateData.minValue) : undefined,
        maxDiscount: updateData.maxDiscount ? parseFloat(updateData.maxDiscount) : undefined,
        validFrom: updateData.validFrom ? new Date(updateData.validFrom) : undefined,
        validUntil: updateData.validUntil ? new Date(updateData.validUntil) : undefined,
        maxUses: updateData.maxUses ? parseInt(updateData.maxUses) : undefined
      }
    });

    return NextResponse.json({
      success: true,
      promocao,
      message: 'Promoção atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar promoção:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar promoção
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da promoção não fornecido' }, { status: 400 });
    }

    // Verificar se a promoção existe
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id }
    });

    if (!existingPromotion) {
      return NextResponse.json({ error: 'Promoção não encontrada' }, { status: 404 });
    }

    // Deletar promoção
    await prisma.promotion.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Promoção deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar promoção:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 