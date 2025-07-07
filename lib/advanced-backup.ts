import { PrismaClient } from '@prisma/client';
import { createReadStream, createWriteStream } from 'fs';
import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface BackupConfig {
  encryptionKey: string;
  cloudProvider: 'aws' | 'gcp' | 'azure';
  retentionDays: number;
  compressionLevel: number;
  includeMedia: boolean;
}

interface BackupRecord {
  filename: string;
  size: number;
  cloudUrl: string;
  checksum: string;
  type: string;
  status: string;
  createdAt: Date;
}

export class AdvancedBackupService {
  private config: BackupConfig;

  constructor(config: BackupConfig) {
    this.config = config;
  }

  async createEncryptedBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = join(process.cwd(), 'backups', timestamp);
    const backupFile = join(backupDir, 'backup.sql');
    const compressedFile = join(backupDir, 'backup.sql.gz');
    const encryptedFile = join(backupDir, 'backup.enc');

    try {
      // Criar diretório de backup
      await mkdir(backupDir, { recursive: true });

      // Exportar dados do banco
      await this.exportDatabase(backupFile);

      // Comprimir backup
      await this.compressFile(backupFile, compressedFile);

      // Criptografar backup
      await this.encryptFile(compressedFile, encryptedFile);

      // Upload para cloud
      const cloudUrl = await this.uploadToCloud(encryptedFile);

      // Limpar arquivos temporários
      await this.cleanupTempFiles([backupFile, compressedFile, encryptedFile]);

      // Registrar backup no banco
      await this.recordBackup({
        filename: `backup-${timestamp}.enc`,
        size: await this.getFileSize(encryptedFile),
        cloudUrl,
        checksum: await this.calculateChecksum(encryptedFile),
        type: 'FULL_ENCRYPTED'
      });

      return cloudUrl;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  }

  private async exportDatabase(outputFile: string): Promise<void> {
    // Exportar dados principais
    const tables = [
      'users', 'hotels', 'attractions', 'tickets', 'reservations',
      'payments', 'vouchers', 'promotions', 'gamification_progress',
      'missions', 'events', 'notifications', 'audit_logs'
    ];

    let sqlContent = '';

    for (const table of tables) {
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM ${table}`) as any[];
      sqlContent += `-- Table: ${table}\n`;
      sqlContent += `INSERT INTO ${table} VALUES\n`;
      
      // Converter dados para SQL
      const values = data.map((row: any) => {
        const cols = Object.values(row).map(val => 
          val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`
        );
        return `(${cols.join(', ')})`;
      });
      
      sqlContent += values.join(',\n') + ';\n\n';
    }

    await writeFile(outputFile, sqlContent);
  }

  private async compressFile(inputFile: string, outputFile: string): Promise<void> {
    const gzip = createGzip({ level: this.config.compressionLevel });
    const source = createReadStream(inputFile);
    const destination = createWriteStream(outputFile);

    await pipeline(source, gzip, destination);
  }

  private async encryptFile(inputFile: string, outputFile: string): Promise<void> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    cipher.setAAD(Buffer.from('backup-data'));

    const source = createReadStream(inputFile);
    const destination = createWriteStream(outputFile);

    // Escrever IV no início do arquivo
    destination.write(iv);

    await pipeline(source, cipher, destination);
  }

  private async uploadToCloud(filePath: string): Promise<string> {
    // Simulação de upload para cloud
    // Em produção, implementar com AWS S3, Google Cloud Storage, etc.
    const filename = filePath.split('/').pop();
    return `https://cloud-storage.example.com/backups/${filename}`;
  }

  private async cleanupTempFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        await unlink(file);
      } catch (error) {
        console.warn(`Erro ao deletar arquivo temporário ${file}:`, error);
      }
    }
  }

  private async getFileSize(filePath: string): Promise<number> {
    const stats = await readFile(filePath);
    return stats.length;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const data = await readFile(filePath);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async recordBackup(backupInfo: {
    filename: string;
    size: number;
    cloudUrl: string;
    checksum: string;
    type: string;
  }): Promise<void> {
    // Simular registro no banco (modelo backup não existe ainda)
    console.log('Registrando backup:', backupInfo);
  }

  async restoreFromBackup(backupId: string): Promise<void> {
    // Simular busca de backup
    console.log('Restaurando backup:', backupId);

    // Download do cloud
    const encryptedFile = await this.downloadFromCloud('cloud-url');

    // Descriptografar
    const decryptedFile = await this.decryptFile(encryptedFile);

    // Descomprimir
    const sqlFile = await this.decompressFile(decryptedFile);

    // Restaurar banco
    await this.restoreDatabase(sqlFile);

    // Limpar arquivos temporários
    await this.cleanupTempFiles([encryptedFile, decryptedFile, sqlFile]);
  }

  private async downloadFromCloud(cloudUrl: string): Promise<string> {
    // Simulação de download
    const tempFile = `/tmp/backup-${Date.now()}.enc`;
    // Implementar download real
    return tempFile;
  }

  private async decryptFile(inputFile: string): Promise<string> {
    const outputFile = inputFile.replace('.enc', '.dec');
    // Implementar descriptografia
    return outputFile;
  }

  private async decompressFile(inputFile: string): Promise<string> {
    const outputFile = inputFile.replace('.gz', '');
    // Implementar descompressão
    return outputFile;
  }

  private async restoreDatabase(sqlFile: string): Promise<void> {
    // Implementar restauração do banco
    console.log('Restaurando banco de dados...');
  }

  async scheduleAutomaticBackups(): Promise<void> {
    // Configurar cron job para backups automáticos
    console.log('Agendando backups automáticos...');
  }

  async validateBackupIntegrity(backupId: string): Promise<boolean> {
    // Simular validação de backup
    console.log('Validando integridade do backup:', backupId);
    return true;
  }
} 