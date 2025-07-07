'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, User, Calendar, DollarSign, Download } from 'lucide-react';

interface Reserva {
  id: string;
  userName: string;
  userEmail: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  babies: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
}

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      // Simular carregamento de reservas
      const mockReservas: Reserva[] = [
        {
          id: '1',
          userName: 'João Silva',
          userEmail: 'joao@email.com',
          hotelName: 'Spazzio DiRoma',
          checkIn: '2024-02-15',
          checkOut: '2024-02-18',
          adults: 2,
          children: 1,
          babies: 0,
          totalPrice: 1350.00,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'Cartão de Crédito',
          createdAt: '2024-01-20T10:30:00Z'
        },
        {
          id: '2',
          userName: 'Maria Santos',
          userEmail: 'maria@email.com',
          hotelName: 'Lagoa Eco Towers',
          checkIn: '2024-02-20',
          checkOut: '2024-02-22',
          adults: 1,
          children: 0,
          babies: 0,
          totalPrice: 760.00,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'PIX',
          createdAt: '2024-01-21T14:15:00Z'
        },
        {
          id: '3',
          userName: 'Pedro Costa',
          userEmail: 'pedro@email.com',
          hotelName: 'Piazza DiRoma',
          checkIn: '2024-02-25',
          checkOut: '2024-02-28',
          adults: 2,
          children: 2,
          babies: 1,
          totalPrice: 1800.00,
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'Boleto',
          createdAt: '2024-01-18T09:45:00Z'
        }
      ];

      setReservas(mockReservas);
    } catch (error) {
      setError('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservaId: string, newStatus: string) => {
    try {
      setReservas(prev => prev.map(r => 
        r.id === reservaId ? { ...r, status: newStatus as any } : r
      ));
      setSuccess('Status da reserva atualizado com sucesso!');
    } catch (error) {
      setError('Erro ao atualizar status');
    }
  };

  const handlePaymentStatusChange = async (reservaId: string, newStatus: string) => {
    try {
      setReservas(prev => prev.map(r => 
        r.id === reservaId ? { ...r, paymentStatus: newStatus as any } : r
      ));
      setSuccess('Status do pagamento atualizado com sucesso!');
    } catch (error) {
      setError('Erro ao atualizar status do pagamento');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'default',
      cancelled: 'destructive'
    } as const;

    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmada',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      paid: 'default',
      failed: 'destructive',
      refunded: 'outline'
    } as const;

    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      failed: 'Falhou',
      refunded: 'Reembolsado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredReservas = reservas.filter(reserva => {
    const statusMatch = filterStatus === 'all' || reserva.status === filterStatus;
    const paymentMatch = filterPayment === 'all' || reserva.paymentStatus === filterPayment;
    return statusMatch && paymentMatch;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Cliente', 'Email', 'Hotel', 'Check-in', 'Check-out', 'Hóspedes', 'Valor', 'Status', 'Pagamento'];
    const csvContent = [
      headers.join(','),
      ...filteredReservas.map(r => [
        r.id,
        r.userName,
        r.userEmail,
        r.hotelName,
        r.checkIn,
        r.checkOut,
        `${r.adults} adultos, ${r.children} crianças, ${r.babies} bebês`,
        r.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        r.status,
        r.paymentStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Reservas</h1>
          <p className="text-gray-600">Gerencie todas as reservas do sistema</p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
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

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status da Reserva</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status do Pagamento</Label>
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reservas */}
      <div className="space-y-4">
        {filteredReservas.map((reserva) => (
          <Card key={reserva.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Reserva #{reserva.id}
                  </CardTitle>
                  <CardDescription>
                    Criada em {new Date(reserva.createdAt).toLocaleString('pt-BR')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(reserva.status)}
                  {getPaymentStatusBadge(reserva.paymentStatus)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{reserva.userName}</span>
                  </div>
                  <p className="text-sm text-gray-600">{reserva.userEmail}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">{reserva.hotelName}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(reserva.checkIn).toLocaleDateString('pt-BR')} - {new Date(reserva.checkOut).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Adultos:</span>
                  <span className="ml-2 font-medium">{reserva.adults}</span>
                </div>
                <div>
                  <span className="text-gray-600">Crianças:</span>
                  <span className="ml-2 font-medium">{reserva.children}</span>
                </div>
                <div>
                  <span className="text-gray-600">Bebês:</span>
                  <span className="ml-2 font-medium">{reserva.babies}</span>
                </div>
                <div>
                  <span className="text-gray-600">Pagamento:</span>
                  <span className="ml-2 font-medium">{reserva.paymentMethod}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-bold text-green-600">
                    R$ {reserva.totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Select value={reserva.status} onValueChange={(value) => handleStatusChange(reserva.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={reserva.paymentStatus} onValueChange={(value) => handlePaymentStatusChange(reserva.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="refunded">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReservas.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma reserva encontrada com os filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 