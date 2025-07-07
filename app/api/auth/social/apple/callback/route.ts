import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const id_token = formData.get('id_token') as string;
    const state = formData.get('state') as string;
    const error = formData.get('error') as string;
    const errorDescription = formData.get('error_description') as string;

    if (error) {
      console.error('Erro na autorização Apple:', error, errorDescription);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=apple_auth_failed&message=${encodeURIComponent(errorDescription || 'Erro na autenticação com Apple')}`);
    }

    if (!code || !id_token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_code&message=${encodeURIComponent('Código de autorização ou ID token não fornecido')}`);
    }

    // Fazer requisição para processar o código
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/social/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, id_token, state }),
    });

    const result = await response.json();

    if (result.success) {
      // Login bem-sucedido - redirecionar para a página inicial ou dashboard
      const redirectUrl = state || '/';
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}${redirectUrl}?success=apple_login&message=${encodeURIComponent('Login com Apple realizado com sucesso!')}`);
    } else {
      // Erro no processamento
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=processing_failed&message=${encodeURIComponent(result.error || 'Erro ao processar login')}`);
    }

  } catch (error) {
    console.error('Erro no callback do Apple:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=callback_error&message=${encodeURIComponent('Erro interno no processamento do login')}`);
  }
} 