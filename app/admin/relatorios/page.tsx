'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Download } from 'lucide-react';

interface RelatorioData {
  periodo: string;
  totalReservas: number;
  totalReceita: number;
  reservasConfirmadas: number;
  reservasPendentes: number;
  reservasCanceladas: number;
  taxaConversao: number;
  mediaTicket: number;
  topHoteis: Array<{
    nome: string;
    reservas: number;
    receita: number;
  }>;
  vendasPorMes: Array<{
    mes: string;
    vendas: number;
    receita: number;
  }>;
}

export default function AdminRelatoriosPage() {
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodo, setPeriodo] = useState('30');

  useEffect(() => {
    loadRelatorio();
  }, [periodo]);

  const loadRelatorio = async () => {
    try {
      // Simular carregamento de relatório
      const mockData: RelatorioData = {
        periodo: `${periodo} dias`,
        totalReservas: 156,
        totalReceita: 125000.00,
        reservasConfirmadas: 142,
        reservasPendentes: 8,
        reservasCanceladas: 6,
        taxaConversao: 3.2,
        mediaTicket: 801.28,
        topHoteis: [
          { nome: 'Spazzio DiRoma', reservas: 45, receita: 40500.00 },
          { nome: 'Lagoa Eco Towers', reservas: 38, receita: 30400.00 },
          { nome: 'Piazza DiRoma', reservas: 32, receita: 28800.00 },
          { nome: 'Kawana Park', reservas: 25, receita: 20000.00 },
          { nome: 'Lagoa Termas Parque', reservas: 16, receita: 5300.00 }
        ],
        vendasPorMes: [
          { mes: 'Jan', vendas: 45, receita: 36000.00 },
          { mes: 'Fev', vendas: 52, receita: 41600.00 },
          { mes: 'Mar', vendas: 38, receita: 30400.00 },
          { mes: 'Abr', vendas: 41, receita: 32800.00 },
          { mes: 'Mai', vendas: 48, receita: 38400.00 },
          { mes: 'Jun', vendas: 55, receita: 44000.00 }
        ]
      };

      setData(mockData);
    } catch (error) {
      setError('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportRelatorio = () => {
    if (!data) return;

    const csvContent = [
      'Relatório de Vendas - Reservei Viagens',
      `Período: ${data.periodo}`,
      '',
      'Métricas Gerais',
      `Total de Reservas,${data.totalReservas}`,
      `Total de Receita,R$ ${data.totalReceita.toLocaleString()}`,
      `Taxa de Conversão,${data.taxaConversao}%`,
      `Ticket Médio,R$ ${data.mediaTicket.toLocaleString()}`,
      '',
      'Status das Reservas',
      `Confirmadas,${data.reservasConfirmadas}`,
      `Pendentes,${data.reservasPendentes}`,
      `Canceladas,${data.reservasCanceladas}`,
      '',
      'Top Hotéis',
      'Hotel,Reservas,Receita',
      ...data.topHoteis.map(h => `${h.nome},${h.reservas},R$ ${h.receita.toLocaleString()}`),
      '',
      'Vendas por Mês',
      'Mês,Vendas,Receita',
      ...data.vendasPorMes.map(v => `${v.mes},${v.vendas},R$ ${v.receita.toLocaleString()}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Erro ao carregar dados do relatório</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de vendas e performance</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Label>Período:</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="365">1 ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportRelatorio}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalReservas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {data.periodo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data.totalReceita.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.taxaConversao}%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data.mediaTicket.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status das Reservas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Reservas Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {data.reservasConfirmadas}
            </div>
            <p className="text-sm text-gray-600">
              {((data.reservasConfirmadas / data.totalReservas) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              Reservas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {data.reservasPendentes}
            </div>
            <p className="text-sm text-gray-600">
              {((data.reservasPendentes / data.totalReservas) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Reservas Canceladas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {data.reservasCanceladas}
            </div>
            <p className="text-sm text-gray-600">
              {((data.reservasCanceladas / data.totalReservas) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Hotéis */}
      <Card>
        <CardHeader>
          <CardTitle>Top Hotéis por Performance</CardTitle>
          <CardDescription>
            Hotéis com mais reservas e receita no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topHoteis.map((hotel, index) => (
              <div key={hotel.nome} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{hotel.nome}</p>
                    <p className="text-sm text-gray-500">{hotel.reservas} reservas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ {hotel.receita.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    R$ {(hotel.receita / hotel.reservas).toLocaleString()} por reserva
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendas por Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Mês</CardTitle>
          <CardDescription>
            Evolução das vendas nos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {data.vendasPorMes.map((mes) => (
              <div key={mes.mes} className="text-center p-4 border rounded-lg">
                <p className="font-medium">{mes.mes}</p>
                <p className="text-2xl font-bold text-green-600">
                  {mes.vendas}
                </p>
                <p className="text-sm text-gray-600">
                  R$ {mes.receita.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 