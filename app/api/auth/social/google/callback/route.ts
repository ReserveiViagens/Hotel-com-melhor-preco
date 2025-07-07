import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // redirect_uri
    const error = searchParams.get('error');

    if (error) {
      console.error('Erro na autenticação Google:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=google_auth_failed`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_code`);
    }

    // Processar o código de autorização
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/social/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao processar callback Google:', errorData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=callback_failed`);
    }

    const data = await response.json();

    if (data.success) {
      // Redirecionar para a página de sucesso com dados do usuário
      const redirectUrl = state || '/';
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}${redirectUrl}?social_login=success&provider=google`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=login_failed`);
    }

  } catch (error) {
    console.error('Erro no callback do Google:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=server_error`);
  }
} 