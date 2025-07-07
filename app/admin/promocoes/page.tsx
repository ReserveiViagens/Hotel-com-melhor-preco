'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2, Gift, Calendar, Percent, Tag } from 'lucide-react';

interface Promocao {
  id: string;
  title: string;
  description: string;
  discount: number;
  startDate: string;
  endDate: string;
  code: string;
  maxUses: number;
  currentUses: number;
  active: boolean;
}

export default function AdminPromocoesPage() {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromocao, setEditingPromocao] = useState<Promocao | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    startDate: '',
    endDate: '',
    code: '',
    maxUses: '',
    active: true
  });

  useEffect(() => {
    loadPromocoes();
  }, []);

  const loadPromocoes = async () => {
    try {
      // Simular carregamento de promoções
      const mockPromocoes: Promocao[] = [
        {
          id: '1',
          title: 'Fim de Semana Dourado',
          description: 'Desconto especial para reservas de fim de semana',
          discount: 20,
          startDate: '2024-02-01',
          endDate: '2024-02-29',
          code: 'FIMDESEMANA20',
          maxUses: 100,
          currentUses: 45,
          active: true
        },
        {
          id: '2',
          title: 'Pacote Família Completa',
          description: 'Desconto para famílias com crianças',
          discount: 15,
          startDate: '2024-02-15',
          endDate: '2024-03-15',
          code: 'FAMILIA15',
          maxUses: 50,
          currentUses: 12,
          active: true
        }
      ];

      setPromocoes(mockPromocoes);
    } catch (error) {
      setError('Erro ao carregar promoções');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promocaoData = {
        ...formData,
        discount: parseFloat(formData.discount),
        maxUses: parseInt(formData.maxUses),
        currentUses: editingPromocao?.currentUses || 0,
        id: editingPromocao?.id || Date.now().toString()
      };

      if (editingPromocao) {
        setPromocoes(prev => prev.map(p => p.id === editingPromocao.id ? promocaoData : p));
        setSuccess('Promoção atualizada com sucesso!');
      } else {
        setPromocoes(prev => [...prev, promocaoData]);
        setSuccess('Promoção adicionada com sucesso!');
      }

      setIsDialogOpen(false);
      setEditingPromocao(null);
      resetForm();
    } catch (error) {
      setError('Erro ao salvar promoção');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promocao: Promocao) => {
    setEditingPromocao(promocao);
    setFormData({
      title: promocao.title,
      description: promocao.description,
      discount: promocao.discount.toString(),
      startDate: promocao.startDate,
      endDate: promocao.endDate,
      code: promocao.code,
      maxUses: promocao.maxUses.toString(),
      active: promocao.active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta promoção?')) {
      setPromocoes(prev => prev.filter(p => p.id !== id));
      setSuccess('Promoção excluída com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount: '',
      startDate: '',
      endDate: '',
      code: '',
      maxUses: '',
      active: true
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Promoções</h1>
          <p className="text-gray-600">Gerencie as promoções e descontos especiais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingPromocao(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Promoção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPromocao ? 'Editar Promoção' : 'Adicionar Nova Promoção'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações da promoção
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Promoção</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código da Promoção</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Ex: DESCONTO20"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Fim</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Uso Máximo</Label>
                <Input
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingPromocao ? 'Atualizar' : 'Adicionar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promocoes.map((promocao) => (
          <Card key={promocao.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    {promocao.title}
                  </CardTitle>
                  <CardDescription>Código: {promocao.code}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={promocao.active ? 'default' : 'secondary'}>
                    {promocao.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                  {isExpired(promocao.endDate) && (
                    <Badge variant="destructive">Expirada</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{promocao.description}</p>
              
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">
                  {promocao.discount}% de desconto
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(promocao.startDate).toLocaleDateString('pt-BR')} - {new Date(promocao.endDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4" />
                  <span>
                    {promocao.currentUses} / {promocao.maxUses} usos
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(promocao.currentUses / promocao.maxUses) * 100}%` 
                  }}
                ></div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(promocao)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(promocao.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 