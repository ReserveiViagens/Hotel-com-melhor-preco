'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Calendar, 
  Percent, 
  DollarSign,
  Users,
  Target,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  applicableModules: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminCuponsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    value: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 100,
    startDate: '',
    endDate: '',
    active: true,
    applicableModules: [] as string[]
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch('/api/admin/promocoes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPromotions(data.promotions || []);
      } else {
        // Dados mockados para demonstração
        const mockPromotions: Promotion[] = [
          {
            id: '1',
            code: 'VERAO2024',
            name: 'Promoção de Verão',
            description: 'Desconto especial para o verão',
            type: 'percentage',
            value: 15,
            minOrderValue: 100,
            maxDiscount: 200,
            usageLimit: 500,
            usedCount: 127,
            startDate: '2024-12-01',
            endDate: '2024-02-28',
            active: true,
            applicableModules: ['hoteis', 'ingressos'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            code: 'PRIMEIRACOMPRA',
            name: 'Primeira Compra',
            description: 'Desconto para novos clientes',
            type: 'fixed',
            value: 50,
            minOrderValue: 200,
            maxDiscount: 50,
            usageLimit: 1000,
            usedCount: 89,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            active: true,
            applicableModules: ['hoteis', 'atracoes'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ];
        setPromotions(mockPromotions);
      }
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
      setError('Erro ao carregar promoções');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const url = editingPromotion 
        ? `/api/admin/promocoes/${editingPromotion.id}`
        : '/api/admin/promocoes';
      
      const method = editingPromotion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingPromotion ? 'Promoção atualizada com sucesso!' : 'Promoção criada com sucesso!');
        setShowForm(false);
        setEditingPromotion(null);
        resetForm();
        loadPromotions();
      } else {
        setError('Erro ao salvar promoção');
      }
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
      setError('Erro ao salvar promoção');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta promoção?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`/api/admin/promocoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Promoção excluída com sucesso!');
        loadPromotions();
      } else {
        setError('Erro ao excluir promoção');
      }
    } catch (error) {
      console.error('Erro ao excluir promoção:', error);
      setError('Erro ao excluir promoção');
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      minOrderValue: promotion.minOrderValue || 0,
      maxDiscount: promotion.maxDiscount || 0,
      usageLimit: promotion.usageLimit,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      active: promotion.active,
      applicableModules: promotion.applicableModules
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimit: 100,
      startDate: '',
      endDate: '',
      active: true,
      applicableModules: []
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccess('Código copiado para a área de transferência!');
  };

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && promotion.active) ||
                         (filterStatus === 'inactive' && !promotion.active);
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
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
          <h1 className="text-3xl font-bold text-gray-900">Cupons e Promoções</h1>
          <p className="text-gray-600">Gerencie cupons de desconto e promoções</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Promoção
        </Button>
      </div>

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

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por código ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Promoções */}
      <div className="grid gap-4">
        {filteredPromotions.map((promotion) => (
          <Card key={promotion.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {promotion.name}
                    <Badge variant={promotion.active ? "default" : "secondary"}>
                      {promotion.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{promotion.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(promotion.code)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(promotion)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(promotion.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Código</Label>
                  <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                    {promotion.code}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Desconto</Label>
                  <p className="text-lg font-semibold">
                    {promotion.type === 'percentage' && `${promotion.value}%`}
                    {promotion.type === 'fixed' && formatCurrency(promotion.value)}
                    {promotion.type === 'free_shipping' && 'Frete Grátis'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uso</Label>
                  <p className="text-lg">
                    {promotion.usedCount} / {promotion.usageLimit}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${getUsagePercentage(promotion.usedCount, promotion.usageLimit)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm font-medium">Período</Label>
                  <p className="text-sm text-gray-600">
                    {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valor Mínimo</Label>
                  <p className="text-sm text-gray-600">
                    {promotion.minOrderValue ? formatCurrency(promotion.minOrderValue) : 'Sem mínimo'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Código</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentual (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        <SelectItem value="free_shipping">Frete Grátis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="usageLimit">Limite de Uso</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minOrderValue">Valor Mínimo (R$)</Label>
                    <Input
                      id="minOrderValue"
                      type="number"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({...formData, minOrderValue: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDiscount">Desconto Máximo (R$)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({...formData, maxDiscount: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Data de Fim</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <Label htmlFor="active">Ativo</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingPromotion ? 'Atualizar' : 'Criar'} Promoção
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPromotion(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 