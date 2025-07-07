import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BackupService } from '@/lib/backup-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do backup é obrigatório' },
        { status: 400 }
      );
    }

    const backupService = new BackupService();
    const result = await backupService.restoreBackup(id);

    return NextResponse.json({
      success: true,
      message: 'Backup restaurado com sucesso',
      data: result
    });

  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 