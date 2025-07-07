import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('Erro na autorização Facebook:', error, errorDescription);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=facebook_auth_failed&message=${encodeURIComponent(errorDescription || 'Erro na autenticação com Facebook')}`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_code&message=${encodeURIComponent('Código de autorização não fornecido')}`);
    }

    // Fazer requisição para processar o código
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/social/facebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    const result = await response.json();

    if (result.success) {
      // Login bem-sucedido - redirecionar para a página inicial ou dashboard
      const redirectUrl = state || '/';
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}${redirectUrl}?success=facebook_login&message=${encodeURIComponent('Login com Facebook realizado com sucesso!')}`);
    } else {
      // Erro no processamento
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=processing_failed&message=${encodeURIComponent(result.error || 'Erro ao processar login')}`);
    }

  } catch (error) {
    console.error('Erro no callback do Facebook:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=callback_error&message=${encodeURIComponent('Erro interno no processamento do login')}`);
  }
} 