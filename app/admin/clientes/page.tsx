'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2, 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  ShoppingBag,
  Star,
  Activity,
  Download,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  History,
  TrendingUp
} from 'lucide-react';

interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  totalReservations: number;
  totalSpent: number;
  lastReservation: string | null;
  rating: number;
}

interface ReservationHistory {
  id: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteHistory, setClienteHistory] = useState<ReservationHistory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch('/api/admin/clientes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      } else {
        // Dados mockados para demonstração
        const mockClientes: Cliente[] = [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao.silva@email.com',
            phone: '(11) 98765-4321',
            cpf: '123.456.789-00',
            birthDate: '1985-03-15',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            active: true,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-20T15:30:00Z',
            totalReservations: 5,
            totalSpent: 4500.00,
            lastReservation: '2024-01-15',
            rating: 4.5
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria.santos@email.com',
            phone: '(21) 99876-5432',
            cpf: '987.654.321-00',
            birthDate: '1990-07-22',
            address: 'Av. Principal, 456',
            city: 'Rio de Janeiro',
            state: 'RJ',
            zipCode: '20000-000',
            active: true,
            createdAt: '2023-12-15T08:00:00Z',
            updatedAt: '2024-01-18T12:00:00Z',
            totalReservations: 3,
            totalSpent: 2800.00,
            lastReservation: '2024-01-10',
            rating: 5.0
          },
          {
            id: '3',
            name: 'Pedro Costa',
            email: 'pedro.costa@email.com',
            phone: '(31) 97654-3210',
            cpf: '456.789.123-00',
            birthDate: '1978-11-08',
            address: 'Rua do Comércio, 789',
            city: 'Belo Horizonte',
            state: 'MG',
            zipCode: '30000-000',
            active: false,
            createdAt: '2023-11-20T14:00:00Z',
            updatedAt: '2023-12-30T10:00:00Z',
            totalReservations: 1,
            totalSpent: 750.00,
            lastReservation: '2023-12-20',
            rating: 3.0
          }
        ];
        setClientes(mockClientes);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadClienteHistory = async (clienteId: string) => {
    // Simular carregamento de histórico
    const mockHistory: ReservationHistory[] = [
      {
        id: '1',
        hotelName: 'Spazzio DiRoma',
        checkIn: '2024-01-15',
        checkOut: '2024-01-18',
        totalPrice: 1200.00,
        status: 'completed',
        createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        hotelName: 'Lagoa Eco Towers',
        checkIn: '2023-12-20',
        checkOut: '2023-12-23',
        totalPrice: 850.00,
        status: 'completed',
        createdAt: '2023-12-15T14:00:00Z'
      }
    ];
    setClienteHistory(mockHistory);
  };

  const handleViewDetails = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    loadClienteHistory(cliente.id);
    setIsHistoryOpen(true);
  };

  const handleToggleStatus = async (clienteId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`/api/admin/clientes/${clienteId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentStatus })
      });

      if (response.ok) {
        setClientes(prev => prev.map(c => 
          c.id === clienteId ? { ...c, active: !currentStatus } : c
        ));
        setSuccess(`Cliente ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      }
    } catch (error) {
      setError('Erro ao alterar status do cliente');
    }
  };

  const handleSendEmail = (cliente: Cliente) => {
    // Implementar envio de email
    alert(`Enviar email para ${cliente.email}`);
  };

  const handleExportData = () => {
    const csvContent = [
      'Nome,Email,Telefone,CPF,Cidade,Estado,Total Gasto,Reservas,Status',
      ...filteredClientes.map(c => 
        `${c.name},${c.email},${c.phone},${c.cpf},${c.city},${c.state},R$ ${c.totalSpent.toLocaleString()},${c.totalReservations},${c.active ? 'Ativo' : 'Inativo'}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.cpf.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && cliente.active) ||
                         (filterStatus === 'inactive' && !cliente.active);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      cancelled: 'destructive',
      pending: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'completed' && 'Concluída'}
        {status === 'cancelled' && 'Cancelada'}
        {status === 'pending' && 'Pendente'}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
          <p className="text-gray-600">Gerencie todos os clientes cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
            <p className="text-xs text-muted-foreground">
              {clientes.filter(c => c.active).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {clientes.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              De todos os clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(clientes.reduce((sum, c) => sum + c.totalSpent, 0) / clientes.length).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por cliente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(clientes.reduce((sum, c) => sum + c.rating, 0) / clientes.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              De 5 estrelas
            </p>
          </CardContent>
        </Card>
      </div>

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

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${cliente.name}`} />
                    <AvatarFallback>{getInitials(cliente.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{cliente.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {cliente.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cliente.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {cliente.city}, {cliente.state}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">R$ {cliente.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total gasto</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{cliente.totalReservations}</p>
                    <p className="text-xs text-gray-500">Reservas</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <p className="font-bold">{cliente.rating}</p>
                    </div>
                    <p className="text-xs text-gray-500">Avaliação</p>
                  </div>
                  <Badge variant={cliente.active ? 'default' : 'secondary'}>
                    {cliente.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(cliente)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendEmail(cliente)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(cliente.id, cliente.active)}
                  >
                    {cliente.active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Detalhes do Cliente */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas e histórico de reservas
            </DialogDescription>
          </DialogHeader>
          
          {selectedCliente && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="communication">Comunicação</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <p className="font-medium">{selectedCliente.name}</p>
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <p className="font-medium">{selectedCliente.cpf}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedCliente.email}</p>
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <p className="font-medium">{selectedCliente.phone}</p>
                  </div>
                  <div>
                    <Label>Data de Nascimento</Label>
                    <p className="font-medium">
                      {new Date(selectedCliente.birthDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <Label>Cliente desde</Label>
                    <p className="font-medium">
                      {new Date(selectedCliente.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label>Endereço</Label>
                    <p className="font-medium">
                      {selectedCliente.address}, {selectedCliente.city} - {selectedCliente.state}, CEP: {selectedCliente.zipCode}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-2">
                  {clienteHistory.map((reservation) => (
                    <Card key={reservation.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{reservation.hotelName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(reservation.checkIn).toLocaleDateString('pt-BR')} - {new Date(reservation.checkOut).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">R$ {reservation.totalPrice.toLocaleString()}</p>
                            {getStatusBadge(reservation.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="communication" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Enviar Email</Label>
                    <div className="flex gap-2 mt-2">
                      <Input placeholder="Assunto do email..." />
                      <Button>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Histórico de Comunicação</Label>
                    <p className="text-sm text-gray-500 mt-2">
                      Nenhuma comunicação registrada ainda.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 