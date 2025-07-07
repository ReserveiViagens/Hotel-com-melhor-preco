import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    
    // Testar uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({ 
      message: 'Conexão com banco de dados funcionando',
      test: result 
    });
  } catch (error) {
    console.error('Erro ao testar banco de dados:', error);
    return NextResponse.json(
      { error: 'Erro na conexão com banco de dados' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 