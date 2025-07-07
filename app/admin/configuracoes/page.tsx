'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, TestTube, Database, Shield, Key, Activity, Globe } from 'lucide-react';
import AdminModulos from '@/components/admin/admin-modulos'

interface ConfigData {
  openaiApiKey: string;
  databaseUrl: string;
  jwtSecret: string;
  emailHost: string;
  emailPort: string;
  emailUser: string;
  emailPass: string;
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfigData>({
    openaiApiKey: '',
    databaseUrl: '',
    jwtSecret: '',
    emailHost: '',
    emailPort: '',
    emailUser: '',
    emailPass: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleInputChange = (field: keyof ConfigData, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setSuccess('Configurações salvas com sucesso!');
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      setError('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const testOpenAI = async () => {
    setTesting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Teste de conexão com OpenAI',
          context: 'Reservei Viagens'
        }),
      });

      if (response.ok) {
        setSuccess('✅ Conexão com OpenAI funcionando perfeitamente!');
      } else {
        const data = await response.json();
        setError(`❌ Erro na API da OpenAI: ${data.error}`);
      }
    } catch (error) {
      setError('❌ Erro ao testar conexão com OpenAI');
    } finally {
      setTesting(false);
    }
  };

  const testDatabase = async () => {
    setTesting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/test-database');
      
      if (response.ok) {
        setSuccess('✅ Conexão com banco de dados funcionando!');
      } else {
        const data = await response.json();
        setError(`❌ Erro no banco de dados: ${data.error}`);
      }
    } catch (error) {
      setError('❌ Erro ao testar banco de dados');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600">Gerencie as configurações da Reservei Viagens</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="openai" className="space-y-4">
        <TabsList>
          <TabsTrigger value="openai" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            OpenAI
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Banco de Dados
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="modulos" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Módulos & Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="openai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configuração da OpenAI
              </CardTitle>
              <CardDescription>
                Configure sua chave da API da OpenAI para ativar o chat inteligente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">Chave da API da OpenAI</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  placeholder="sk-..."
                  value={config.openaiApiKey}
                  onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Obtenha sua chave em: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://platform.openai.com/api-keys</a>
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={testOpenAI} disabled={testing || !config.openaiApiKey}>
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuração do Banco de Dados
              </CardTitle>
              <CardDescription>
                Configure a conexão com o banco de dados PostgreSQL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="databaseUrl">URL do Banco de Dados</Label>
                <Input
                  id="databaseUrl"
                  type="text"
                  placeholder="postgresql://user:password@localhost:5432/reservei_viagens"
                  value={config.databaseUrl}
                  onChange={(e) => handleInputChange('databaseUrl', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Formato: postgresql://usuario:senha@host:porta/nome_do_banco
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={testDatabase} disabled={testing || !config.databaseUrl}>
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configure as chaves secretas para JWT e autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jwtSecret">Chave Secreta JWT</Label>
                <Input
                  id="jwtSecret"
                  type="password"
                  placeholder="Chave secreta para JWT"
                  value={config.jwtSecret}
                  onChange={(e) => handleInputChange('jwtSecret', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Use uma chave forte e única para assinar tokens JWT
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Configuração de Email
              </CardTitle>
              <CardDescription>
                Configure o servidor de email para recuperação de senha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailHost">Servidor SMTP</Label>
                  <Input
                    id="emailHost"
                    type="text"
                    placeholder="smtp.gmail.com"
                    value={config.emailHost}
                    onChange={(e) => handleInputChange('emailHost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailPort">Porta</Label>
                  <Input
                    id="emailPort"
                    type="text"
                    placeholder="587"
                    value={config.emailPort}
                    onChange={(e) => handleInputChange('emailPort', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailUser">Email</Label>
                <Input
                  id="emailUser"
                  type="email"
                  placeholder="seu-email@gmail.com"
                  value={config.emailUser}
                  onChange={(e) => handleInputChange('emailUser', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPass">Senha do App</Label>
                <Input
                  id="emailPass"
                  type="password"
                  placeholder="Senha de aplicativo"
                  value={config.emailPass}
                  onChange={(e) => handleInputChange('emailPass', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Use senha de aplicativo para Gmail ou senha normal para outros provedores
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modulos">
          <AdminModulos />
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 