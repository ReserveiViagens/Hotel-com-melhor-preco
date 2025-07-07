'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Mail,
  Send,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Copy,
  Download,
  Upload,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  MousePointer,
  Loader2,
  FileText,
  Image as ImageIcon,
  Palette,
  Type,
  Layout
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  type: 'newsletter' | 'promotional' | 'transactional' | 'welcome';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  templateId: string;
  segmentId: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  type: 'newsletter' | 'promotional' | 'transactional' | 'welcome';
  subject: string;
  preheader: string;
  htmlContent: string;
  textContent: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailSegment {
  id: string;
  name: string;
  description: string;
  criteria: any;
  subscriberCount: number;
  createdAt: string;
}

interface EmailStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSubscribers: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalSent: number;
  recentCampaigns: EmailCampaign[];
}

export default function AdminEmailMarketingPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<EmailSegment[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Simular dados de email marketing
      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'Newsletter Semanal - Janeiro',
          subject: 'Ofertas especiais para suas próximas férias!',
          type: 'newsletter',
          status: 'sent',
          templateId: '1',
          segmentId: '1',
          sentAt: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          stats: {
            sent: 1250,
            delivered: 1230,
            opened: 492,
            clicked: 87,
            bounced: 20,
            unsubscribed: 3
          }
        },
        {
          id: '2',
          name: 'Promoção Fim de Semana',
          subject: 'Últimas vagas! 50% OFF em hotéis selecionados',
          type: 'promotional',
          status: 'scheduled',
          templateId: '2',
          segmentId: '2',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0
          }
        },
        {
          id: '3',
          name: 'Boas-vindas Novos Clientes',
          subject: 'Bem-vindo à Reservei Viagens! 🎉',
          type: 'welcome',
          status: 'sending',
          templateId: '3',
          segmentId: '3',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          stats: {
            sent: 45,
            delivered: 44,
            opened: 23,
            clicked: 8,
            bounced: 1,
            unsubscribed: 0
          }
        }
      ];

      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Newsletter Padrão',
          description: 'Template para newsletters semanais',
          type: 'newsletter',
          subject: 'Newsletter {{company_name}}',
          preheader: 'Confira nossas novidades e ofertas especiais',
          htmlContent: '<html><body><h1>{{title}}</h1><p>{{content}}</p></body></html>',
          textContent: '{{title}}\n\n{{content}}',
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Promoção Especial',
          description: 'Template para campanhas promocionais',
          type: 'promotional',
          subject: 'Oferta Especial - {{discount}}% OFF',
          preheader: 'Aproveite esta oferta por tempo limitado',
          htmlContent: '<html><body><h1>{{title}}</h1><p>{{content}}</p><a href="{{cta_url}}">{{cta_text}}</a></body></html>',
          textContent: '{{title}}\n\n{{content}}\n\n{{cta_text}}: {{cta_url}}',
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const mockSegments: EmailSegment[] = [
        {
          id: '1',
          name: 'Todos os Assinantes',
          description: 'Lista completa de assinantes ativos',
          criteria: { status: 'active' },
          subscriberCount: 1250,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Clientes VIP',
          description: 'Clientes com mais de 5 reservas',
          criteria: { reservations: { $gte: 5 } },
          subscriberCount: 180,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Novos Cadastros',
          description: 'Usuários cadastrados nos últimos 30 dias',
          criteria: { createdAt: { $gte: '2024-01-01' } },
          subscriberCount: 95,
          createdAt: new Date().toISOString()
        }
      ];

      const mockStats: EmailStats = {
        totalCampaigns: 25,
        activeCampaigns: 3,
        totalSubscribers: 1250,
        avgOpenRate: 39.2,
        avgClickRate: 7.1,
        totalSent: 18500,
        recentCampaigns: mockCampaigns.slice(0, 3)
      };

      setCampaigns(mockCampaigns);
      setTemplates(mockTemplates);
      setSegments(mockSegments);
      setStats(mockStats);
    } catch (error) {
      console.error('Erro ao carregar dados de email:', error);
      setError('Erro ao carregar dados de email marketing');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Campanha enviada com sucesso!');
        loadEmailData();
      } else {
        setError('Erro ao enviar campanha');
      }
    } catch (error) {
      setError('Erro ao enviar campanha');
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Campanha pausada com sucesso!');
        loadEmailData();
      } else {
        setError('Erro ao pausar campanha');
      }
    } catch (error) {
      setError('Erro ao pausar campanha');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-gray-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-gray-600">Gerencie campanhas e automações de email</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeCampaigns} ativas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assinantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Lista ativa
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
                  <Progress value={stats.avgOpenRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Clique</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgClickRate}%</div>
                  <Progress value={stats.avgClickRate} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar campanhas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="sending">Enviando</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Lista de Campanhas */}
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {campaign.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Criado em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {campaign.status === 'sent' && (
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold">{campaign.stats.sent}</p>
                            <p className="text-xs text-gray-500">Enviados</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">
                              {formatPercentage(campaign.stats.opened, campaign.stats.delivered)}
                            </p>
                            <p className="text-xs text-gray-500">Taxa Abertura</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{campaign.stats.clicked}</p>
                            <p className="text-xs text-gray-500">Cliques</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">
                              {formatPercentage(campaign.stats.clicked, campaign.stats.opened)}
                            </p>
                            <p className="text-xs text-gray-500">Taxa Clique</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {getStatusIcon(campaign.status)}
                        <Badge
                          variant={
                            campaign.status === 'sent' ? 'default' :
                            campaign.status === 'sending' ? 'secondary' :
                            campaign.status === 'scheduled' ? 'outline' :
                            campaign.status === 'paused' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {campaign.status === 'sent' && 'Enviado'}
                          {campaign.status === 'sending' && 'Enviando'}
                          {campaign.status === 'scheduled' && 'Agendado'}
                          {campaign.status === 'paused' && 'Pausado'}
                          {campaign.status === 'draft' && 'Rascunho'}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {campaign.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendCampaign(campaign.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === 'sending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePauseCampaign(campaign.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    {template.isDefault && (
                      <Badge variant="secondary">Padrão</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <Layout className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Tipo:</span> {template.type}
                    </div>
                    <div>
                      <span className="font-medium">Assunto:</span> {template.subject}
                    </div>
                    <div>
                      <span className="font-medium">Criado:</span> {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <CardTitle>{segment.name}</CardTitle>
                  <CardDescription>{segment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {segment.subscriberCount.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500">assinantes</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Criado:</span> {new Date(segment.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Ver Lista
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance das Campanhas</CardTitle>
                <CardDescription>Métricas dos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emails Enviados</span>
                    <span className="font-bold">{stats?.totalSent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Entrega</span>
                    <span className="font-bold">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Abertura</span>
                    <span className="font-bold">{stats?.avgOpenRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Clique</span>
                    <span className="font-bold">{stats?.avgClickRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Descadastro</span>
                    <span className="font-bold">0.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crescimento da Lista</CardTitle>
                <CardDescription>Evolução do número de assinantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Gráfico de crescimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes da Campanha */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Campanha</DialogTitle>
            <DialogDescription>
              Informações completas e estatísticas da campanha
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Campanha</Label>
                  <p className="font-medium">{selectedCampaign.name}</p>
                </div>
                <div>
                  <Label>Assunto</Label>
                  <p className="font-medium">{selectedCampaign.subject}</p>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Badge variant="outline">{selectedCampaign.type}</Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedCampaign.status)}
                    <span className="capitalize">{selectedCampaign.status}</span>
                  </div>
                </div>
              </div>

              {selectedCampaign.status === 'sent' && (
                <div>
                  <Label>Estatísticas de Performance</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{selectedCampaign.stats.sent}</div>
                        <p className="text-xs text-gray-500">Enviados</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{selectedCampaign.stats.opened}</div>
                        <p className="text-xs text-gray-500">Abertos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{selectedCampaign.stats.clicked}</div>
                        <p className="text-xs text-gray-500">Cliques</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fechar
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Campanha
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 