import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Verificar token JWT
function verifyToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, (process.env as any).JWT_SECRET || 'fallback-secret') as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Listar templates
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Simular dados de templates
    const templates = [
      {
        id: '1',
        name: 'Newsletter Padrão',
        description: 'Template para newsletters semanais',
        type: 'newsletter',
        subject: 'Newsletter {{company_name}}',
        preheader: 'Confira nossas novidades e ofertas especiais',
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <header style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
                <h1>{{company_name}}</h1>
              </header>
              <main style="padding: 20px;">
                <h2>{{title}}</h2>
                <p>{{content}}</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{cta_url}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">{{cta_text}}</a>
                </div>
              </main>
              <footer style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
                <p>{{company_name}} - {{company_address}}</p>
                <p><a href="{{unsubscribe_url}}">Descadastrar</a></p>
              </footer>
            </body>
          </html>
        `,
        textContent: '{{title}}\n\n{{content}}\n\n{{cta_text}}: {{cta_url}}\n\n{{company_name}}\n{{unsubscribe_url}}',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Promoção Especial',
        description: 'Template para campanhas promocionais',
        type: 'promotional',
        subject: 'Oferta Especial - {{discount}}% OFF',
        preheader: 'Aproveite esta oferta por tempo limitado',
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <header style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                <h1>OFERTA ESPECIAL!</h1>
                <h2>{{discount}}% OFF</h2>
              </header>
              <main style="padding: 20px;">
                <h2>{{title}}</h2>
                <p>{{content}}</p>
                <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-weight: bold;">Oferta válida até: {{expiry_date}}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{cta_url}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px;">{{cta_text}}</a>
                </div>
              </main>
              <footer style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
                <p>{{company_name}} - {{company_address}}</p>
                <p><a href="{{unsubscribe_url}}">Descadastrar</a></p>
              </footer>
            </body>
          </html>
        `,
        textContent: 'OFERTA ESPECIAL!\n{{discount}}% OFF\n\n{{title}}\n\n{{content}}\n\nOferta válida até: {{expiry_date}}\n\n{{cta_text}}: {{cta_url}}\n\n{{company_name}}\n{{unsubscribe_url}}',
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Boas-vindas',
        description: 'Template para novos usuários',
        type: 'welcome',
        subject: 'Bem-vindo à {{company_name}}! 🎉',
        preheader: 'Estamos felizes em tê-lo conosco',
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <header style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
                <h1>Bem-vindo! 🎉</h1>
              </header>
              <main style="padding: 20px;">
                <h2>Olá, {{user_name}}!</h2>
                <p>{{content}}</p>
                <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 5px;">
                  <h3>Próximos passos:</h3>
                  <ul>
                    <li>Complete seu perfil</li>
                    <li>Explore nossas ofertas</li>
                    <li>Faça sua primeira reserva</li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{cta_url}}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">{{cta_text}}</a>
                </div>
              </main>
              <footer style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
                <p>{{company_name}} - {{company_address}}</p>
                <p><a href="{{unsubscribe_url}}">Descadastrar</a></p>
              </footer>
            </body>
          </html>
        `,
        textContent: 'Bem-vindo! 🎉\n\nOlá, {{user_name}}!\n\n{{content}}\n\nPróximos passos:\n- Complete seu perfil\n- Explore nossas ofertas\n- Faça sua primeira reserva\n\n{{cta_text}}: {{cta_url}}\n\n{{company_name}}\n{{unsubscribe_url}}',
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Filtrar por tipo se especificado
    let filteredTemplates = templates;
    if (type) {
      filteredTemplates = filteredTemplates.filter(t => t.type === type);
    }

    return NextResponse.json(filteredTemplates);
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo template
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.name || !data.type || !data.subject || !data.htmlContent) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    // Simular criação de template
    const newTemplate = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description || '',
      type: data.type,
      subject: data.subject,
      preheader: data.preheader || '',
      htmlContent: data.htmlContent,
      textContent: data.textContent || '',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 