import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todos os módulos
export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar módulos' }, { status: 500 });
  }
}

// POST - Criar novo módulo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, label, icon, active, order, config } = body;
    if (!name || !label || !icon) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }
    const module = await prisma.module.create({
      data: { name, label, icon, active, order, config }
    });
    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar módulo' }, { status: 500 });
  }
}

// PUT - Atualizar módulo (incluindo chaves de API social)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, label, icon, active, order, config } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID do módulo é obrigatório' }, { status: 400 });
    }
    // Permite atualizar campos de configuração, incluindo chaves de API social
    const module = await prisma.module.update({
      where: { id },
      data: { label, icon, active, order, config }
    });
    return NextResponse.json(module);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar módulo' }, { status: 500 });
  }
}

// DELETE - Remover módulo
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID do módulo é obrigatório' }, { status: 400 });
    }
    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ message: 'Módulo removido com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover módulo' }, { status: 500 });
  }
} 