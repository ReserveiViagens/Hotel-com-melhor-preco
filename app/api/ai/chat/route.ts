import { NextRequest, NextResponse } from 'next/server';
import { generateCustomerServiceResponse } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
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

    // Gerar resposta usando OpenAI
    const response = await generateCustomerServiceResponse(message, context);

    return NextResponse.json({
      message: response.message,
      usage: response.usage
    });

  } catch (error: any) {
    console.error('Erro no chat AI:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 