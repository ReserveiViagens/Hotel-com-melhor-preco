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

// GET - Obter configurações de backup
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Simular configurações de backup
    const config = {
      autoBackup: true,
      frequency: 'daily',
      time: '02:00',
      retention: 30,
      compression: true,
      encryption: true,
      location: 'cloud',
      includeFiles: false,
      excludeTables: ['logs', 'sessions'],
      notificationEmail: 'admin@reservei.com',
      maxBackupSize: 1024 * 1024 * 1024, // 1GB
      parallelBackups: 2
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar configurações de backup
export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validar dados
    const allowedFields = [
      'autoBackup', 'frequency', 'time', 'retention', 
      'compression', 'encryption', 'location', 'includeFiles',
      'excludeTables', 'notificationEmail', 'maxBackupSize', 'parallelBackups'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Em um ambiente real, você salvaria as configurações no banco
    // await prisma.backupConfig.upsert({
    //   where: { id: 'default' },
    //   update: updateData,
    //   create: { id: 'default', ...updateData }
    // });

    // Simular configurações atualizadas
    const updatedConfig = {
      autoBackup: true,
      frequency: 'daily',
      time: '02:00',
      retention: 30,
      compression: true,
      encryption: true,
      location: 'cloud',
      includeFiles: false,
      excludeTables: ['logs', 'sessions'],
      notificationEmail: 'admin@reservei.com',
      maxBackupSize: 1024 * 1024 * 1024,
      parallelBackups: 2,
      ...updateData
    };

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 