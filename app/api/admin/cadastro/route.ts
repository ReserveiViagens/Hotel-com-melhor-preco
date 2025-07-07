import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, cpf } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
    }

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const existingCPF = await prisma.user.findUnique({
        where: { cpf }
      });

      if (existingCPF) {
        return NextResponse.json({ error: 'CPF já cadastrado' }, { status: 400 });
      }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário admin
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        phone: phone || null,
        cpf: cpf || null,
        active: true
      }
    });

    // Gerar token JWT
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Registrar uso da API
    await prisma.apiUsage.create({
      data: {
        endpoint: '/api/admin/cadastro',
        method: 'POST',
        userId: user.id,
        statusCode: 201
      }
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 