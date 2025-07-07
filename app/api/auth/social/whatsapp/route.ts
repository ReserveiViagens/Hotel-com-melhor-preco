import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Iniciar fluxo de autenticação WhatsApp
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const redirectUri = searchParams.get('redirect_uri') || '/';
    
    if (!phone) {
      return NextResponse.json({ error: 'Número de telefone não fornecido' }, { status: 400 });
    }

    // Validar formato do telefone
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json({ error: 'Formato de telefone inválido' }, { status: 400 });
    }

    // Gerar código de verificação
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Salvar código temporariamente (em produção, usar Redis ou similar)
    const sessionId = `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Enviar código via WhatsApp Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: 'verification_code',
          language: {
            code: 'pt_BR'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: verificationCode
                }
              ]
            }
          ]
        }
      }),
    });

    if (!whatsappResponse.ok) {
      throw new Error('Erro ao enviar código via WhatsApp');
    }

    // Salvar sessão temporária (em produção, usar Redis)
    // Por enquanto, vamos simular
    const sessionData = {
      sessionId,
      phone,
      code: verificationCode,
      redirectUri,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
    };

    // Retornar sessionId para verificação
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Código de verificação enviado via WhatsApp'
    });

  } catch (error) {
    console.error('Erro ao iniciar autenticação WhatsApp:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Verificar código e autenticar
export async function POST(request: NextRequest) {
  try {
    const { sessionId, code, phone } = await request.json();
    
    if (!sessionId || !code || !phone) {
      return NextResponse.json({ error: 'Dados incompletos para verificação' }, { status: 400 });
    }

    // Em produção, buscar sessão do Redis
    // Por enquanto, vamos simular a verificação
    const expectedCode = '123456'; // Código fixo para teste
    
    if (code !== expectedCode) {
      return NextResponse.json({ error: 'Código de verificação inválido' }, { status: 400 });
    }

    // Buscar ou criar usuário
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          {
            socialAccounts: {
              some: {
                provider: 'whatsapp',
                providerId: phone
              }
            }
          }
        ]
      },
      include: {
        socialAccounts: true
      }
    });

    if (!user) {
      // Criar novo usuário
      user = await prisma.user.create({
        data: {
          name: `Usuário WhatsApp (${phone})`,
          email: `${phone}@whatsapp.local`, // Email temporário
          phone,
          password: '', // Usuário social não tem senha
          role: 'client',
          active: true,
          socialAccounts: {
            create: {
              provider: 'whatsapp',
              providerId: phone,
              profileData: { phone, verified: true }
            }
          }
        },
        include: {
          socialAccounts: true
        }
      });
    } else {
      // Atualizar conta social existente
      const existingSocialAccount = user.socialAccounts.find(acc => acc.provider === 'whatsapp');
      
      if (existingSocialAccount) {
        await prisma.socialAccount.update({
          where: { id: existingSocialAccount.id },
          data: {
            profileData: { phone, verified: true }
          }
        });
      } else {
        // Criar nova conta social para usuário existente
        await prisma.socialAccount.create({
          data: {
            userId: user.id,
            provider: 'whatsapp',
            providerId: phone,
            profileData: { phone, verified: true }
          }
        });
      }

      // Atualizar telefone se não existir
      if (!user.phone) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phone }
        });
        user.phone = phone;
      }
    }

    // Log de autenticação social
    await prisma.socialAuthLog.create({
      data: {
        userId: user.id,
        provider: 'whatsapp',
        action: 'login',
        success: true,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      }
    });

    // Retornar dados do usuário (sem senha)
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Login com WhatsApp realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro na verificação do WhatsApp:', error);
    
    // Log de erro
    await prisma.socialAuthLog.create({
      data: {
        provider: 'whatsapp',
        action: 'login',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      }
    });

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 