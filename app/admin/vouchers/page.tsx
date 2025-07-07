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
import { 
  Loader2, 
  FileText, 
  Download, 
  Send,
  Eye,
  Printer,
  Mail,
  QrCode,
  Calendar,
  MapPin,
  User,
  Hotel,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Upload,
  Image as ImageIcon,
  Palette,
  Type,
  Layout
} from 'lucide-react';

interface Voucher {
  id: string;
  reservationId: string;
  code: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  guestName: string;
  guestEmail: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  pdfUrl: string | null;
  qrCode: string;
  sentAt: string | null;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VoucherTemplate {
  id: string;
  name: string;
  description: string;
  layout: 'classic' | 'modern' | 'minimal';
  primaryColor: string;
  logo: string | null;
  headerText: string;
  footerText: string;
  includeQrCode: boolean;
  includeMap: boolean;
  customFields: any[];
  isDefault: boolean;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [templates, setTemplates] = useState<VoucherTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VoucherTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('vouchers');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadVouchers();
    loadTemplates();
  }, []);

  const loadVouchers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch('/api/admin/vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVouchers(data);
      } else {
        // Dados mockados
        const mockVouchers: Voucher[] = [
          {
            id: '1',
            reservationId: '1',
            code: 'RV2024-001',
            status: 'active',
            guestName: 'João Silva',
            guestEmail: 'joao@email.com',
            hotelName: 'Spazzio DiRoma',
            checkIn: '2024-02-15',
            checkOut: '2024-02-18',
            totalAmount: 1200.00,
            pdfUrl: '/vouchers/RV2024-001.pdf',
            qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RV2024-001',
            sentAt: new Date().toISOString(),
            usedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            reservationId: '2',
            code: 'RV2024-002',
            status: 'used',
            guestName: 'Maria Santos',
            guestEmail: 'maria@email.com',
            hotelName: 'Lagoa Eco Towers',
            checkIn: '2024-01-20',
            checkOut: '2024-01-23',
            totalAmount: 850.00,
            pdfUrl: '/vouchers/RV2024-002.pdf',
            qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RV2024-002',
            sentAt: new Date(Date.now() - 86400000).toISOString(),
            usedAt: new Date(Date.now() - 3600000).toISOString(),
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        setVouchers(mockVouchers);
      }
    } catch (error) {
      console.error('Erro ao carregar vouchers:', error);
      setError('Erro ao carregar vouchers');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    // Simular templates
    const mockTemplates: VoucherTemplate[] = [
      {
        id: '1',
        name: 'Template Clássico',
        description: 'Design tradicional com todas as informações',
        layout: 'classic',
        primaryColor: '#1e40af',
        logo: '/logo-reservei.png',
        headerText: 'Voucher de Reserva',
        footerText: 'Obrigado por escolher a Reservei Viagens!',
        includeQrCode: true,
        includeMap: true,
        customFields: [],
        isDefault: true
      },
      {
        id: '2',
        name: 'Template Moderno',
        description: 'Design minimalista e elegante',
        layout: 'modern',
        primaryColor: '#7c3aed',
        logo: '/logo-reservei.png',
        headerText: 'Sua Reserva Confirmada',
        footerText: 'Tenha uma excelente estadia!',
        includeQrCode: true,
        includeMap: false,
        customFields: [],
        isDefault: false
      }
    ];
    setTemplates(mockTemplates);
  };

  const handleGenerateVoucher = async (reservationId: string) => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`/api/admin/vouchers/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          reservationId,
          templateId: selectedTemplate?.id || templates.find(t => t.isDefault)?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Voucher gerado com sucesso!');
        loadVouchers();
        
        // Abrir PDF gerado
        if (data.pdfUrl) {
          window.open(data.pdfUrl, '_blank');
        }
      } else {
        setError('Erro ao gerar voucher');
      }
    } catch (error) {
      setError('Erro ao gerar voucher');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendVoucher = async (voucherId: string, email: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`/api/admin/vouchers/${voucherId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setSuccess('Voucher enviado com sucesso!');
        loadVouchers();
      } else {
        setError('Erro ao enviar voucher');
      }
    } catch (error) {
      setError('Erro ao enviar voucher');
    }
  };

  const handleCancelVoucher = async (voucherId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este voucher?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`/api/admin/vouchers/${voucherId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Voucher cancelado com sucesso!');
        loadVouchers();
      } else {
        setError('Erro ao cancelar voucher');
      }
    } catch (error) {
      setError('Erro ao cancelar voucher');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'used':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || voucher.status === filterStatus;
    
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
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Vouchers</h1>
          <p className="text-gray-600">Gerencie e personalize vouchers de reserva</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setIsTemplateOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Vouchers</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vouchers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {vouchers.filter(v => v.status === 'active').length} ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enviados Hoje</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Por email
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilizados</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vouchers.filter(v => v.status === 'used').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Uso</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  Dos vouchers enviados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome, email ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="used">Utilizados</SelectItem>
                    <SelectItem value="expired">Expirados</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Lista de Vouchers */}
          <div className="space-y-4">
            {filteredVouchers.map((voucher) => (
              <Card key={voucher.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{voucher.code}</h3>
                        <p className="text-sm text-gray-600">{voucher.guestName}</p>
                        <p className="text-xs text-gray-500">{voucher.guestEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <p className="font-semibold">{voucher.hotelName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(voucher.checkIn).toLocaleDateString('pt-BR')} - {new Date(voucher.checkOut).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(voucher.totalAmount)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(voucher.status)}
                        <Badge
                          variant={
                            voucher.status === 'active' ? 'default' :
                            voucher.status === 'used' ? 'secondary' :
                            voucher.status === 'expired' ? 'outline' :
                            'destructive'
                          }
                        >
                          {voucher.status === 'active' && 'Ativo'}
                          {voucher.status === 'used' && 'Utilizado'}
                          {voucher.status === 'expired' && 'Expirado'}
                          {voucher.status === 'cancelled' && 'Cancelado'}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVoucher(voucher);
                            setIsPreviewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {voucher.pdfUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(voucher.pdfUrl!, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {voucher.status === 'active' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendVoucher(voucher.id, voucher.guestEmail)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.print()}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {voucher.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelVoucher(voucher.id)}
                          >
                            Cancelar
                          </Button>
                        )}
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
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <span>Cor principal:</span>
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: template.primaryColor }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <span>Layout: {template.layout}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      <span>QR Code: {template.includeQrCode ? 'Sim' : 'Não'}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Visualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Voucher</CardTitle>
              <CardDescription>
                Personalize as configurações padrão dos vouchers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Validade Padrão (dias)</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div>
                <Label>Envio Automático</Label>
                <Select defaultValue="yes">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Sim, enviar automaticamente</SelectItem>
                    <SelectItem value="no">Não, envio manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Template de Email</Label>
                <Textarea
                  placeholder="Olá {nome}, seu voucher está pronto..."
                  className="min-h-32"
                />
              </div>
              <div>
                <Label>Logo da Empresa</Label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </Button>
                </div>
              </div>
              <Button>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview do Voucher</DialogTitle>
            <DialogDescription>
              Visualização do voucher como será impresso
            </DialogDescription>
          </DialogHeader>
          
          {selectedVoucher && (
            <div className="bg-white p-8 rounded-lg shadow-lg">
              {/* Header */}
              <div className="text-center mb-8">
                <img src="/logo-reservei.png" alt="Logo" className="h-16 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Voucher de Reserva</h1>
                <p className="text-gray-600">Código: {selectedVoucher.code}</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-8">
                <img src={selectedVoucher.qrCode} alt="QR Code" className="w-32 h-32" />
              </div>

              {/* Informações */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Informações do Hóspede</h3>
                  <p className="text-gray-600">Nome: {selectedVoucher.guestName}</p>
                  <p className="text-gray-600">Email: {selectedVoucher.guestEmail}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Informações da Reserva</h3>
                  <p className="text-gray-600">Hotel: {selectedVoucher.hotelName}</p>
                  <p className="text-gray-600">Check-in: {new Date(selectedVoucher.checkIn).toLocaleDateString('pt-BR')}</p>
                  <p className="text-gray-600">Check-out: {new Date(selectedVoucher.checkOut).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Valor */}
              <div className="text-center p-4 bg-blue-50 rounded-lg mb-8">
                <p className="text-lg text-gray-700">Valor Total</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(selectedVoucher.totalAmount)}
                </p>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500">
                <p>Obrigado por escolher a Reservei Viagens!</p>
                <p>Em caso de dúvidas, entre em contato conosco.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 