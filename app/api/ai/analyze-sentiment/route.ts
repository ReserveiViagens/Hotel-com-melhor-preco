import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback } = body;

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback é obrigatório' },
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

    // Analisar sentimento usando OpenAI
    const response = await analyzeSentiment(feedback);

    try {
      // Tentar parsear a resposta JSON
      const sentimentData = JSON.parse(response.message);
      return NextResponse.json({
        ...sentimentData,
        usage: response.usage
      });
    } catch (parseError) {
      // Se não conseguir parsear, retornar a resposta como texto
      return NextResponse.json({
        sentiment: 'NEUTRO',
        score: 5,
        points: ['feedback'],
        suggestions: ['Analisar feedback manualmente'],
        rawResponse: response.message,
        usage: response.usage
      });
    }

  } catch (error: any) {
    console.error('Erro ao analisar sentimento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 