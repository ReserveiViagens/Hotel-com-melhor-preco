import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// GET - Listar sessões de chat
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

    // Por enquanto retornar dados mockados
    const mockSessions = [
      {
        id: '1',
        userId: '1',
        userName: 'João Silva',
        userEmail: 'joao@email.com',
        startTime: new Date().toISOString(),
        status: 'active',
        messages: [
          {
            id: '1',
            type: 'user',
            content: 'Olá, gostaria de saber sobre disponibilidade de hotéis',
            timestamp: new Date().toISOString()
          }
        ],
        tags: ['reserva'],
        satisfaction: 5
      }
    ];

    return NextResponse.json(mockSessions);
  } catch (error) {
    console.error('Erro ao buscar sessões de chat:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Enviar mensagem para IA
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { message, sessionId, systemPrompt } = await request.json();

    // Verificar se a chave da OpenAI está configurada
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ 
        error: 'Chave da OpenAI não configurada. Configure OPENAI_API_KEY nas variáveis de ambiente.' 
      }, { status: 500 });
    }

    // Fazer chamada para OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'Você é um assistente especializado em turismo e reservas de hotéis. Seja prestativo e forneça informações precisas sobre nossos serviços.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Erro na API da OpenAI');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const tokensUsed = data.usage.total_tokens;

    // Salvar mensagem no banco (implementar quando necessário)
    // await prisma.chatMessage.create({...})

    return NextResponse.json({
      response: aiResponse,
      tokens: tokensUsed,
      sessionId
    });

  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar mensagem com IA' 
    }, { status: 500 });
  }
} 