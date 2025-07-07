import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { AdvancedBackupService } from '@/lib/advanced-backup';

const prisma = new PrismaClient();
const execAsync = promisify(exec);

const backupService = new AdvancedBackupService({
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY || 'default-key-change-in-production',
  cloudProvider: 'aws',
  retentionDays: 30,
  compressionLevel: 9,
  includeMedia: true
});

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

// GET /api/admin/backup - Listar backups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'list':
        const backups = await backupService.listBackups();
        return NextResponse.json(backups);
      
      case 'stats':
        const stats = await backupService.getBackupStats();
        return NextResponse.json(stats);
      
      default:
        return NextResponse.json(
          { error: 'Ação não especificada' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/backup - Criar backup
export async function POST(request: NextRequest) {
  try {
    const { action, backupId } = await request.json();

    switch (action) {
      case 'create':
        const cloudUrl = await backupService.createEncryptedBackup();
        return NextResponse.json({ 
          success: true, 
          message: 'Backup criado com sucesso',
          cloudUrl 
        });

      case 'restore':
        if (!backupId) {
          return NextResponse.json({ 
            success: false, 
            message: 'ID do backup é obrigatório' 
          }, { status: 400 });
        }
        
        await backupService.restoreFromBackup(backupId);
        return NextResponse.json({ 
          success: true, 
          message: 'Backup restaurado com sucesso' 
        });

      case 'validate':
        if (!backupId) {
          return NextResponse.json({ 
            success: false, 
            message: 'ID do backup é obrigatório' 
          }, { status: 400 });
        }
        
        const isValid = await backupService.validateBackupIntegrity(backupId);
        return NextResponse.json({ 
          success: true, 
          isValid,
          message: isValid ? 'Backup válido' : 'Backup corrompido'
        });

      case 'schedule':
        await backupService.scheduleAutomaticBackups();
        return NextResponse.json({ 
          success: true, 
          message: 'Backups automáticos agendados' 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Ação não reconhecida' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro no backup:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// DELETE /api/admin/backup - Deletar backup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json(
        { error: 'ID do backup é obrigatório' },
        { status: 400 }
      );
    }

    await backupService.deleteBackup(backupId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 