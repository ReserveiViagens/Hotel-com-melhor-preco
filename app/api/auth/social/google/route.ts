import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Iniciar fluxo de autenticação Google
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri') || '/';
    
    // Construir URL de autorização do Google
    const googleAuthUrl = new URL('https://accounts.google.com/oauth/authorize');
    googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID || '');
    googleAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/social/google/callback`);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', redirectUri); // Salvar redirect_uri no state
    
    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Erro ao iniciar autenticação Google:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Processar callback do Google
export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Código de autorização não fornecido' }, { status: 400 });
    }

    // Trocar código por token de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/social/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Erro ao trocar código por token');
    }

    const tokenData = await tokenResponse.json();

    // Obter informações do usuário
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Erro ao obter informações do usuário');
    }

    const userData = await userResponse.json();

    // Buscar ou criar usuário
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          {
            socialAccounts: {
              some: {
                provider: 'google',
                providerId: userData.id
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
          name: userData.name,
          email: userData.email,
          password: '', // Usuário social não tem senha
          avatar: userData.picture,
          role: 'client',
          active: true,
          socialAccounts: {
            create: {
              provider: 'google',
              providerId: userData.id,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
              profileData: userData
            }
          }
        },
        include: {
          socialAccounts: true
        }
      });
    } else {
      // Atualizar conta social existente
      const existingSocialAccount = user.socialAccounts.find(acc => acc.provider === 'google');
      
      if (existingSocialAccount) {
        await prisma.socialAccount.update({
          where: { id: existingSocialAccount.id },
          data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            profileData: userData
          }
        });
      } else {
        // Criar nova conta social para usuário existente
        await prisma.socialAccount.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerId: userData.id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            profileData: userData
          }
        });
      }

      // Atualizar avatar se não existir
      if (!user.avatar && userData.picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: userData.picture }
        });
        user.avatar = userData.picture;
      }
    }

    // Log de autenticação social
    await prisma.socialAuthLog.create({
      data: {
        userId: user.id,
        provider: 'google',
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
      message: 'Login com Google realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no callback do Google:', error);
    
    // Log de erro
    await prisma.socialAuthLog.create({
      data: {
        provider: 'google',
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