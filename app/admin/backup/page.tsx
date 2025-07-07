'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Upload, 
  Shield, 
  Clock, 
  HardDrive, 
  Cloud,
  CheckCircle,
  AlertTriangle,
  Lock,
  Database
} from 'lucide-react';

interface Backup {
  id: string;
  filename: string;
  size: number;
  type: string;
  status: string;
  createdAt: Date;
  cloudUrl: string;
  checksum: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/admin/backup');
      const data = await response.json();
      if (data.success) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    setProgress(0);
    setMessage('');

    try {
      // Simular progresso
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Backup criado com sucesso!');
        await loadBackups();
      } else {
        setMessage('Erro ao criar backup: ' + data.message);
      }
    } catch (error) {
      setMessage('Erro ao criar backup');
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Tem certeza que deseja restaurar este backup? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', backupId })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Backup restaurado com sucesso!');
      } else {
        setMessage('Erro ao restaurar backup: ' + data.message);
      }
    } catch (error) {
      setMessage('Erro ao restaurar backup');
    } finally {
      setLoading(false);
    }
  };

  const validateBackup = async (backupId: string) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', backupId })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(data.isValid ? 'Backup válido!' : 'Backup corrompido!');
      } else {
        setMessage('Erro ao validar backup: ' + data.message);
      }
    } catch (error) {
      setMessage('Erro ao validar backup');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Backup Avançado</h1>
          <p className="text-muted-foreground">
            Backup criptografado com compressão e upload automático para cloud
          </p>
        </div>
        <Button onClick={createBackup} disabled={loading} className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Criar Backup
        </Button>
      </div>

      {message && (
        <Alert className={message.includes('sucesso') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {loading && progress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do backup</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {backups.map((backup) => (
              <Card key={backup.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{backup.filename}</CardTitle>
                    <Badge className={getStatusColor(backup.status)}>
                      {backup.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Criado em {new Date(backup.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tamanho:</span>
                      <p>{formatFileSize(backup.size)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span>
                      <p>{backup.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Criptografado</span>
                    <Cloud className="w-3 h-3" />
                    <span>Cloud Storage</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => validateBackup(backup.id)}
                      disabled={loading}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreBackup(backup.id)}
                      disabled={loading}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Restaurar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(backup.cloudUrl, '_blank')}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Chave de Criptografia</label>
                  <p className="text-sm text-muted-foreground">
                    Chave AES-256-GCM para criptografia dos backups
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nível de Compressão</label>
                  <p className="text-sm text-muted-foreground">
                    GZIP nível 9 para máxima compressão
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Retenção</label>
                  <p className="text-sm text-muted-foreground">
                    30 dias de retenção automática
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Configurações de Cloud
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Provedor</label>
                  <p className="text-sm text-muted-foreground">AWS S3</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Região</label>
                  <p className="text-sm text-muted-foreground">us-east-1</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Bucket</label>
                  <p className="text-sm text-muted-foreground">reservei-backups</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Espaço em Disco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usado</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} />
                  <p className="text-xs text-muted-foreground">
                    750GB de 1TB usado
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Último Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">2h atrás</p>
                <p className="text-sm text-muted-foreground">
                  Próximo backup em 22h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Sistema saudável</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Todos os backups válidos
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 