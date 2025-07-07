import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Validar cupom de promoção
export async function POST(request: NextRequest) {
  try {
    const { code, amount, module, userId } = await request.json();

    if (!code || !amount) {
      return NextResponse.json({ 
        error: 'Código e valor são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar promoção pelo código
    const promotion = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promotion) {
      return NextResponse.json({
        valid: false,
        error: 'Cupom não encontrado'
      });
    }

    // Verificar se a promoção está ativa
    if (promotion.status !== 'active') {
      return NextResponse.json({
        valid: false,
        error: 'Cupom inativo'
      });
    }

    // Verificar validade
    const now = new Date();
    if (promotion.validFrom && now < promotion.validFrom) {
      return NextResponse.json({
        valid: false,
        error: 'Cupom ainda não está válido'
      });
    }

    if (promotion.validUntil && now > promotion.validUntil) {
      return NextResponse.json({
        valid: false,
        error: 'Cupom expirado'
      });
    }

    // Verificar limite de usos
    if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) {
      return NextResponse.json({
        valid: false,
        error: 'Cupom esgotado'
      });
    }

    // Verificar valor mínimo
    if (promotion.minValue && amount < promotion.minValue) {
      return NextResponse.json({
        valid: false,
        error: `Valor mínimo para este cupom: R$ ${promotion.minValue.toFixed(2)}`
      });
    }

    // Verificar módulos aplicáveis
    if (promotion.applicableModules && module) {
      const applicableModules = Array.isArray(promotion.applicableModules) 
        ? promotion.applicableModules 
        : JSON.parse(promotion.applicableModules as string);
      
      if (!applicableModules.includes(module)) {
        return NextResponse.json({
          valid: false,
          error: 'Cupom não válido para este tipo de serviço'
        });
      }
    }

    // Calcular desconto
    let discountAmount = 0;
    
    if (promotion.discountType === 'percentage') {
      discountAmount = amount * (promotion.discountValue / 100);
      
      // Aplicar desconto máximo se definido
      if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
        discountAmount = promotion.maxDiscount;
      }
    } else if (promotion.discountType === 'fixed') {
      discountAmount = promotion.discountValue;
      
      // Não permitir desconto maior que o valor total
      if (discountAmount > amount) {
        discountAmount = amount;
      }
    }

    // Verificar se o desconto é válido
    if (discountAmount <= 0) {
      return NextResponse.json({
        valid: false,
        error: 'Cupom não aplicável para este valor'
      });
    }

    // Retornar resultado da validação
    return NextResponse.json({
      valid: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxDiscount: promotion.maxDiscount
      },
      discount: {
        amount: discountAmount,
        percentage: promotion.discountType === 'percentage' ? promotion.discountValue : null,
        finalAmount: amount - discountAmount
      },
      message: `Desconto de R$ ${discountAmount.toFixed(2)} aplicado!`
    });

  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
} 