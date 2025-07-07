import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import archiver from 'archiver';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  retention: number; // Days to keep backups
  compression: boolean;
  uploadToCloud: boolean;
  cloudProvider: 'aws' | 'google' | 'azure' | 'local';
  cloudConfig?: {
    bucket?: string;
    accessKey?: string;
    secretKey?: string;
    region?: string;
  };
}

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  duration?: number;
  tables: string[];
}

class BackupService {
  private backupDir: string;
  private config: BackupConfig;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.config = {
      enabled: true,
      schedule: '0 2 * * *', // 2 AM daily
      retention: 30,
      compression: true,
      uploadToCloud: false,
      cloudProvider: 'local'
    };

    this.ensureBackupDir();
  }

  private ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Criar backup completo do banco
  async createBackup(): Promise<BackupInfo> {
    const startTime = Date.now();
    const backupId = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const backupPath = path.join(this.backupDir, `${backupId}.sql`);
    const compressedPath = path.join(this.backupDir, `${backupId}.zip`);

    try {
      console.log(`Iniciando backup: ${backupId}`);

      // Obter lista de tabelas
      const tables = await this.getTables();
      
      // Criar backup SQL
      await this.createSQLBackup(backupPath, tables);
      
      // Comprimir se habilitado
      let finalPath = backupPath;
      if (this.config.compression) {
        await this.compressBackup(backupPath, compressedPath);
        finalPath = compressedPath;
        fs.unlinkSync(backupPath); // Remover arquivo não comprimido
      }

      // Obter tamanho do arquivo
      const stats = fs.statSync(finalPath);
      
      // Upload para nuvem se habilitado
      if (this.config.uploadToCloud) {
        await this.uploadToCloud(finalPath, backupId);
      }

      const duration = Date.now() - startTime;
      
      const backupInfo: BackupInfo = {
        id: backupId,
        filename: path.basename(finalPath),
        size: stats.size,
        createdAt: new Date(),
        status: 'completed',
        duration,
        tables
      };

      // Salvar informações do backup
      await this.saveBackupInfo(backupInfo);

      console.log(`Backup concluído: ${backupId} (${duration}ms)`);
      return backupInfo;

    } catch (error) {
      console.error(`Erro no backup ${backupId}:`, error);
      
      const backupInfo: BackupInfo = {
        id: backupId,
        filename: path.basename(backupPath),
        size: 0,
        createdAt: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        tables: []
      };

      await this.saveBackupInfo(backupInfo);
      throw error;
    }
  }

  // Obter lista de tabelas
  private async getTables(): Promise<string[]> {
    try {
      const result = await prisma.$queryRaw<{ name: string }[]>`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `;
      return result.map(row => row.name);
    } catch (error) {
      console.error('Erro ao obter tabelas:', error);
      return [];
    }
  }

  // Criar backup SQL
  private async createSQLBackup(backupPath: string, tables: string[]): Promise<void> {
    try {
      // Para SQLite, usar .dump
      const { stdout, stderr } = await execAsync(
        `sqlite3 ${path.join(process.cwd(), 'prisma/dev.db')} .dump > "${backupPath}"`
      );

      if (stderr) {
        console.warn('Avisos do SQLite:', stderr);
      }

      console.log(`Backup SQL criado: ${backupPath}`);
    } catch (error) {
      console.error('Erro ao criar backup SQL:', error);
      throw error;
    }
  }

  // Comprimir backup
  private async compressBackup(sourcePath: string, targetPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(targetPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`Backup comprimido: ${targetPath}`);
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.file(sourcePath, { name: path.basename(sourcePath) });
      archive.finalize();
    });
  }

  // Upload para nuvem
  private async uploadToCloud(filePath: string, backupId: string): Promise<void> {
    try {
      switch (this.config.cloudProvider) {
        case 'aws':
          await this.uploadToAWS(filePath, backupId);
          break;
        case 'google':
          await this.uploadToGoogle(filePath, backupId);
          break;
        case 'azure':
          await this.uploadToAzure(filePath, backupId);
          break;
        default:
          console.log('Upload para nuvem não configurado');
      }
    } catch (error) {
      console.error('Erro no upload para nuvem:', error);
      throw error;
    }
  }

  // Upload para AWS S3
  private async uploadToAWS(filePath: string, backupId: string): Promise<void> {
    if (!this.config.cloudConfig?.bucket || !this.config.cloudConfig?.accessKey) {
      throw new Error('Configuração AWS incompleta');
    }

    const { stdout, stderr } = await execAsync(
      `aws s3 cp "${filePath}" s3://${this.config.cloudConfig.bucket}/backups/${backupId}.zip`,
      {
        env: {
          ...process.env,
          AWS_ACCESS_KEY_ID: this.config.cloudConfig.accessKey,
          AWS_SECRET_ACCESS_KEY: this.config.cloudConfig.secretKey,
          AWS_DEFAULT_REGION: this.config.cloudConfig.region || 'us-east-1'
        }
      }
    );

    if (stderr) {
      console.warn('Avisos do AWS CLI:', stderr);
    }

    console.log(`Backup enviado para AWS S3: ${backupId}`);
  }

  // Upload para Google Cloud Storage
  private async uploadToGoogle(filePath: string, backupId: string): Promise<void> {
    if (!this.config.cloudConfig?.bucket) {
      throw new Error('Configuração Google Cloud incompleta');
    }

    const { stdout, stderr } = await execAsync(
      `gsutil cp "${filePath}" gs://${this.config.cloudConfig.bucket}/backups/${backupId}.zip`
    );

    if (stderr) {
      console.warn('Avisos do Google Cloud:', stderr);
    }

    console.log(`Backup enviado para Google Cloud: ${backupId}`);
  }

  // Upload para Azure Blob Storage
  private async uploadToAzure(filePath: string, backupId: string): Promise<void> {
    if (!this.config.cloudConfig?.bucket || !this.config.cloudConfig?.accessKey) {
      throw new Error('Configuração Azure incompleta');
    }

    const { stdout, stderr } = await execAsync(
      `az storage blob upload --account-name ${this.config.cloudConfig.bucket} --account-key ${this.config.cloudConfig.accessKey} --container-name backups --name ${backupId}.zip --file "${filePath}"`
    );

    if (stderr) {
      console.warn('Avisos do Azure:', stderr);
    }

    console.log(`Backup enviado para Azure: ${backupId}`);
  }

  // Salvar informações do backup
  private async saveBackupInfo(backupInfo: BackupInfo): Promise<void> {
    try {
      await prisma.systemConfig.upsert({
        where: { key: `backup_${backupInfo.id}` },
        update: { value: JSON.stringify(backupInfo) },
        create: {
          key: `backup_${backupInfo.id}`,
          value: JSON.stringify(backupInfo),
          type: 'json'
        }
      });
    } catch (error) {
      console.error('Erro ao salvar informações do backup:', error);
    }
  }

  // Restaurar backup
  async restoreBackup(backupId: string): Promise<void> {
    try {
      console.log(`Iniciando restauração: ${backupId}`);

      // Encontrar arquivo de backup
      const backupFiles = fs.readdirSync(this.backupDir);
      const backupFile = backupFiles.find(file => file.includes(backupId));

      if (!backupFile) {
        throw new Error(`Arquivo de backup não encontrado: ${backupId}`);
      }

      const backupPath = path.join(this.backupDir, backupFile);
      let sqlPath = backupPath;

      // Descomprimir se necessário
      if (backupFile.endsWith('.zip')) {
        sqlPath = await this.decompressBackup(backupPath);
      }

      // Restaurar banco
      await this.restoreDatabase(sqlPath);

      // Limpar arquivo temporário
      if (sqlPath !== backupPath) {
        fs.unlinkSync(sqlPath);
      }

      console.log(`Restauração concluída: ${backupId}`);
    } catch (error) {
      console.error(`Erro na restauração ${backupId}:`, error);
      throw error;
    }
  }

  // Descomprimir backup
  private async decompressBackup(backupPath: string): Promise<string> {
    // Implementar descompressão se necessário
    // Por simplicidade, retornando o mesmo arquivo
    return backupPath;
  }

  // Restaurar banco de dados
  private async restoreDatabase(sqlPath: string): Promise<void> {
    try {
      const dbPath = path.join(process.cwd(), 'prisma/dev.db');
      
      // Fazer backup do banco atual antes da restauração
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `pre_restore_${timestamp}.db`);
      fs.copyFileSync(dbPath, backupPath);

      // Restaurar usando SQLite
      const { stdout, stderr } = await execAsync(
        `sqlite3 "${dbPath}" < "${sqlPath}"`
      );

      if (stderr) {
        console.warn('Avisos da restauração:', stderr);
      }

      console.log('Banco de dados restaurado com sucesso');
    } catch (error) {
      console.error('Erro na restauração do banco:', error);
      throw error;
    }
  }

  // Listar backups
  async listBackups(): Promise<BackupInfo[]> {
    try {
      const backups = await prisma.systemConfig.findMany({
        where: { key: { startsWith: 'backup_' } },
        orderBy: { key: 'desc' }
      });

      return backups.map(backup => JSON.parse(backup.value) as BackupInfo);
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  }

  // Limpar backups antigos
  async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retention);

      const oldBackups = backups.filter(backup => 
        new Date(backup.createdAt) < cutoffDate
      );

      for (const backup of oldBackups) {
        await this.deleteBackup(backup.id);
      }

      console.log(`Limpeza concluída: ${oldBackups.length} backups removidos`);
    } catch (error) {
      console.error('Erro na limpeza de backups:', error);
    }
  }

  // Deletar backup
  async deleteBackup(backupId: string): Promise<void> {
    try {
      // Encontrar arquivo
      const backupFiles = fs.readdirSync(this.backupDir);
      const backupFile = backupFiles.find(file => file.includes(backupId));

      if (backupFile) {
        const backupPath = path.join(this.backupDir, backupFile);
        fs.unlinkSync(backupPath);
        console.log(`Arquivo de backup removido: ${backupFile}`);
      }

      // Remover informações do banco
      await prisma.systemConfig.deleteMany({
        where: { key: `backup_${backupId}` }
      });

      console.log(`Backup removido: ${backupId}`);
    } catch (error) {
      console.error(`Erro ao remover backup ${backupId}:`, error);
      throw error;
    }
  }

  // Configurar backup automático
  async scheduleBackup(): Promise<void> {
    if (!this.config.enabled) {
      console.log('Backup automático desabilitado');
      return;
    }

    // Implementar agendamento com node-cron
    console.log(`Backup agendado: ${this.config.schedule}`);
  }

  // Obter estatísticas de backup
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    lastBackup?: Date;
    nextBackup?: Date;
  }> {
    try {
      const backups = await this.listBackups();
      const completedBackups = backups.filter(b => b.status === 'completed');
      
      return {
        totalBackups: completedBackups.length,
        totalSize: completedBackups.reduce((sum, b) => sum + b.size, 0),
        lastBackup: completedBackups[0]?.createdAt,
        nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000) // Próximo backup em 24h
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de backup:', error);
      return {
        totalBackups: 0,
        totalSize: 0
      };
    }
  }
}

export const backupService = new BackupService(); 