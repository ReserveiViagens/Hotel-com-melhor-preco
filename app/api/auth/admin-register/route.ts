import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Simulação de banco de dados (substituir por Prisma quando configurado)
let admins: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    // Validações
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingAdmin = admins.find(admin => admin.email === email);
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar admin
    const newAdmin = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: role || 'admin',
      createdAt: new Date().toISOString()
    };

    admins.push(newAdmin);

    // Retornar dados sem a senha
    const { password: _, ...adminWithoutPassword } = newAdmin;

    return NextResponse.json({
      message: 'Administrador criado com sucesso',
      admin: adminWithoutPassword
    });

  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 