import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET - Iniciar fluxo de autenticação Apple
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri') || '/';
    
    // Construir URL de autorização do Apple
    const appleAuthUrl = new URL('https://appleid.apple.com/auth/authorize');
    appleAuthUrl.searchParams.set('client_id', process.env.APPLE_SERVICE_ID || '');
    appleAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/social/apple/callback`);
    appleAuthUrl.searchParams.set('response_type', 'code id_token');
    appleAuthUrl.searchParams.set('scope', 'name email');
    appleAuthUrl.searchParams.set('state', redirectUri);
    appleAuthUrl.searchParams.set('response_mode', 'form_post');
    
    return NextResponse.redirect(appleAuthUrl.toString());
  } catch (error) {
    console.error('Erro ao iniciar autenticação Apple:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Processar callback do Apple
export async function POST(request: NextRequest) {
  try {
    const { code, id_token, state } = await request.json();
    
    if (!code || !id_token) {
      return NextResponse.json({ error: 'Código de autorização ou ID token não fornecido' }, { status: 400 });
    }

    // Verificar o ID token do Apple
    const applePublicKeysResponse = await fetch('https://appleid.apple.com/auth/keys');
    const applePublicKeys = await applePublicKeysResponse.json();
    
    // Decodificar o ID token para obter informações do usuário
    const decodedToken = jwt.decode(id_token) as any;
    
    if (!decodedToken) {
      throw new Error('Token inválido do Apple');
    }

    // Trocar código por token de acesso
    const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.APPLE_SERVICE_ID || '',
        client_secret: generateAppleClientSecret(),
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/social/apple/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Erro ao trocar código por token');
    }

    const tokenData = await tokenResponse.json();

    // Extrair informações do usuário do ID token
    const userData = {
      id: decodedToken.sub,
      email: decodedToken.email,
      name: decodedToken.name || 'Usuário Apple',
      picture: null // Apple não fornece foto por padrão
    };

    // Buscar ou criar usuário
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          {
            socialAccounts: {
              some: {
                provider: 'apple',
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
              provider: 'apple',
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
      const existingSocialAccount = user.socialAccounts.find(acc => acc.provider === 'apple');
      
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
            provider: 'apple',
            providerId: userData.id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            profileData: userData
          }
        });
      }
    }

    // Log de autenticação social
    await prisma.socialAuthLog.create({
      data: {
        userId: user.id,
        provider: 'apple',
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
      message: 'Login com Apple realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no callback do Apple:', error);
    
    // Log de erro
    await prisma.socialAuthLog.create({
      data: {
        provider: 'apple',
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

// Função para gerar client secret do Apple
function generateAppleClientSecret() {
  const privateKey = process.env.APPLE_PRIVATE_KEY || '';
  const keyId = process.env.APPLE_KEY_ID || '';
  const teamId = process.env.APPLE_TEAM_ID || '';
  const clientId = process.env.APPLE_SERVICE_ID || '';

  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: 'ES256',
    kid: keyId,
    typ: 'JWT'
  };

  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 15777000, // 6 meses
    aud: 'https://appleid.apple.com',
    sub: clientId
  };

  try {
    return jwt.sign(payload, privateKey, { 
      algorithm: 'ES256', 
      header 
    });
  } catch (error) {
    console.error('Erro ao gerar client secret do Apple:', error);
    return '';
  }
} 