import { NextRequest, NextResponse } from 'next/server';
import { generateProductDescription } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, productType, features } = body;

    if (!productName || !productType || !features) {
      return NextResponse.json(
        { error: 'Nome do produto, tipo e características são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API da OpenAI não configurada' },
        { status: 500 }
      );
    }

    // Gerar descrição usando OpenAI
    const response = await generateProductDescription(productName, productType, features);

    return NextResponse.json({
      description: response.message,
      usage: response.usage
    });

  } catch (error: any) {
    console.error('Erro ao gerar descrição:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 