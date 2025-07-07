import OpenAI from 'openai';

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Função para enviar mensagem para o chat da OpenAI
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  model: string = 'gpt-3.5-turbo',
  maxTokens: number = 1000
): Promise<ChatResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    return {
      message: response,
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    console.error('Erro na API da OpenAI:', error);
    throw new Error('Erro ao processar mensagem com IA');
  }
}

/**
 * Função para gerar resposta de atendimento ao cliente
 */
export async function generateCustomerServiceResponse(
  userMessage: string,
  context: string = 'Reservei Viagens - Agência de viagens especializada em pacotes para Caldas Novas'
): Promise<ChatResponse> {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `Você é um assistente virtual da ${context}. 
    
    Suas responsabilidades incluem:
    - Responder perguntas sobre pacotes de viagem
    - Fornecer informações sobre hotéis, ingressos e atrações
    - Ajudar com reservas e preços
    - Orientar sobre documentação necessária
    - Ser cordial, profissional e sempre em português brasileiro
    
    Informações sobre a empresa:
    - Especializada em pacotes para Caldas Novas
    - Oferece hotéis + parques aquáticos
    - Promoções e descontos especiais
    - Atendimento personalizado
    
    Sempre seja útil, preciso e mantenha um tom amigável.`
  };

  const userMessageObj: ChatMessage = {
    role: 'user',
    content: userMessage
  };

  return await sendChatMessage([systemMessage, userMessageObj]);
}

/**
 * Função para gerar descrições de produtos
 */
export async function generateProductDescription(
  productName: string,
  productType: 'hotel' | 'ingresso' | 'pacote',
  features: string[]
): Promise<ChatResponse> {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `Você é um especialista em marketing de viagens da Reservei Viagens.
    
    Sua tarefa é criar descrições atrativas e persuasivas para produtos turísticos.
    
    Diretrizes:
    - Use linguagem persuasiva mas honesta
    - Destaque benefícios e experiências únicas
    - Inclua informações práticas (localização, facilidades, etc.)
    - Mantenha tom profissional mas acessível
    - Sempre em português brasileiro
    - Máximo 200 palavras`
  };

  const userMessageObj: ChatMessage = {
    role: 'user',
    content: `Crie uma descrição atrativa para: ${productName} (${productType})
    
    Características principais: ${features.join(', ')}
    
    Foque nos benefícios para o cliente e na experiência única que oferecemos.`
  };

  return await sendChatMessage([systemMessage, userMessageObj]);
}

/**
 * Função para análise de sentimento de feedback
 */
export async function analyzeSentiment(
  feedback: string
): Promise<ChatResponse> {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `Você é um analista de feedback da Reservei Viagens.
    
    Analise o sentimento do feedback fornecido e retorne:
    - Sentimento: POSITIVO, NEUTRO ou NEGATIVO
    - Pontuação: 1-10 (onde 10 é muito positivo)
    - Principais pontos mencionados
    - Sugestões de melhoria (se aplicável)
    
    Responda em formato JSON:
    {
      "sentiment": "POSITIVO",
      "score": 8,
      "points": ["atendimento", "preço"],
      "suggestions": ["melhorar comunicação"]
    }`
  };

  const userMessageObj: ChatMessage = {
    role: 'user',
    content: `Analise este feedback: "${feedback}"`
  };

  return await sendChatMessage([systemMessage, userMessageObj]);
}

export default openai; 