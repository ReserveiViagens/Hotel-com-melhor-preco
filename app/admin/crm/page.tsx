'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare,
  Plus,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  DollarSign,
  UserPlus,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'website' | 'social' | 'referral' | 'chat' | 'phone';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score: number;
  interests: string[];
  budget: number;
  timeline: string;
  notes: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  lastContact: string;
  nextFollowUp: string;
}

interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  totalLeads: number;
  conversionRate: number;
}

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  leads: Lead[];
  conversionRate: number;
}

interface Activity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'proposal' | 'follow_up';
  description: string;
  outcome: string;
  nextAction: string;
  scheduledDate: string;
  completedDate: string;
  assignedTo: string;
}

interface CRMStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  avgResponseTime: number;
  totalRevenue: number;
  monthlyGrowth: number;
  topSources: Array<{ source: string; count: number; percentage: number }>;
  pipelineStages: Array<{ stage: string; count: number; value: number }>;
}

export default function AdminCRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCRMData();
  }, []);

  const loadCRMData = async () => {
    try {
      // Simular dados do CRM
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'Ana Silva',
          email: 'ana.silva@email.com',
          phone: '(11) 98765-4321',
          source: 'website',
          status: 'qualified',
          score: 85,
          interests: ['hotéis', 'parques aquáticos'],
          budget: 2500,
          timeline: 'próximas 2 semanas',
          notes: 'Interessada em pacote família para Caldas Novas',
          assignedTo: 'João Vendedor',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-22T15:30:00Z',
          lastContact: '2024-01-22T15:30:00Z',
          nextFollowUp: '2024-01-25T10:00:00Z'
        },
        {
          id: '2',
          name: 'Carlos Mendes',
          email: 'carlos.mendes@email.com',
          phone: '(21) 99876-5432',
          source: 'chat',
          status: 'new',
          score: 65,
          interests: ['ingressos', 'atrações'],
          budget: 800,
          timeline: 'este mês',
          notes: 'Perguntou sobre ingressos para Hot Park',
          assignedTo: 'Maria Atendente',
          createdAt: '2024-01-23T14:00:00Z',
          updatedAt: '2024-01-23T14:00:00Z',
          lastContact: '2024-01-23T14:00:00Z',
          nextFollowUp: '2024-01-24T10:00:00Z'
        },
        {
          id: '3',
          name: 'Fernanda Costa',
          email: 'fernanda.costa@email.com',
          phone: '(31) 97654-3210',
          source: 'social',
          status: 'proposal',
          score: 92,
          interests: ['pacotes completos', 'luxo'],
          budget: 5000,
          timeline: 'próximo mês',
          notes: 'Cliente VIP, interessada em pacote premium',
          assignedTo: 'João Vendedor',
          createdAt: '2024-01-18T09:00:00Z',
          updatedAt: '2024-01-21T16:00:00Z',
          lastContact: '2024-01-21T16:00:00Z',
          nextFollowUp: '2024-01-24T14:00:00Z'
        }
      ];

      const mockStats: CRMStats = {
        totalLeads: 156,
        newLeads: 23,
        qualifiedLeads: 45,
        conversionRate: 28.8,
        avgResponseTime: 2.3,
        totalRevenue: 125000,
        monthlyGrowth: 15.5,
        topSources: [
          { source: 'Website', count: 67, percentage: 42.9 },
          { source: 'Chat', count: 34, percentage: 21.8 },
          { source: 'Social Media', count: 28, percentage: 17.9 },
          { source: 'Referral', count: 18, percentage: 11.5 },
          { source: 'Phone', count: 9, percentage: 5.8 }
        ],
        pipelineStages: [
          { stage: 'Novos', count: 23, value: 0 },
          { stage: 'Contatados', count: 34, value: 0 },
          { stage: 'Qualificados', count: 45, value: 125000 },
          { stage: 'Proposta', count: 28, value: 89000 },
          { stage: 'Negociação', count: 16, value: 67000 },
          { stage: 'Fechados', count: 10, value: 45000 }
        ]
      };

      setLeads(mockLeads);
      setStats(mockStats);
    } catch (error) {
      console.error('Erro ao carregar dados do CRM:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      proposal: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      website: '🌐',
      social: '📱',
      referral: '👥',
      chat: '��',
      phone: '��'
    };
    return icons[source as keyof typeof icons] || '📋';
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSource && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservei CRM</h1>
          <p className="text-gray-600">Gestão completa de leads e pipeline de vendas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalLeads}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{stats?.monthlyGrowth}% este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.conversionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              {stats?.qualifiedLeads} qualificados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {(stats?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12.5% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio Resposta</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.avgResponseTime}h</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-orange-600">
              <Activity className="w-4 h-4 mr-1" />
              Meta: 2h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
        </TabsList>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            {stats?.pipelineStages.map((stage, index) => (
              <Card key={index} className="min-h-[400px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {stage.stage}
                    <Badge variant="secondary">{stage.count}</Badge>
                  </CardTitle>
                  <CardDescription>
                    R$ {stage.value.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredLeads
                    .filter(lead => {
                      const stageMap = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];
                      return lead.status === stageMap[index];
                    })
                    .map(lead => (
                      <div key={lead.id} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{lead.name}</h4>
                          <span className="text-xs text-gray-500">{getSourceIcon(lead.source)}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{lead.email}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Score: {lead.score}
                          </span>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="new">Novos</SelectItem>
                <SelectItem value="contacted">Contatados</SelectItem>
                <SelectItem value="qualified">Qualificados</SelectItem>
                <SelectItem value="proposal">Proposta</SelectItem>
                <SelectItem value="negotiation">Negociação</SelectItem>
                <SelectItem value="won">Fechados</SelectItem>
                <SelectItem value="lost">Perdidos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Origens</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social">Redes Sociais</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="referral">Indicação</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredLeads.map(lead => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{lead.name}</h3>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                        <p className="text-sm text-gray-500">{lead.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          Score: {lead.score}
                        </p>
                        <p className="text-sm text-gray-500">
                          R$ {lead.budget.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Origem dos Leads</CardTitle>
                <CardDescription>Distribuição por fonte de aquisição</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">{source.source}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{source.count}</span>
                        <span className="text-sm text-gray-500">({source.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance do Pipeline</CardTitle>
                <CardDescription>Conversão por estágio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.pipelineStages.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{stage.stage}</span>
                        <span className="font-medium">{stage.count} leads</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(stage.count / (stats?.totalLeads || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Histórico de interações com leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.slice(0, 5).map(lead => (
                  <div key={lead.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-gray-600">
                        Último contato: {new Date(lead.lastContact).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Próximo follow-up: {new Date(lead.nextFollowUp).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 