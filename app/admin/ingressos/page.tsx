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
import { Loader2, Plus, Edit, Trash2, Ticket, Calendar, Clock, MapPin } from 'lucide-react';

interface Ingresso {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  time: string;
  price: number;
  availableTickets: number;
  totalTickets: number;
  category: string;
  active: boolean;
}

export default function AdminIngressosPage() {
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngresso, setEditingIngresso] = useState<Ingresso | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    time: '',
    price: '',
    availableTickets: '',
    totalTickets: '',
    category: '',
    active: true
  });

  useEffect(() => {
    loadIngressos();
  }, []);

  const loadIngressos = async () => {
    try {
      // Simular carregamento de ingressos
      const mockIngressos: Ingresso[] = [
        {
          id: '1',
          name: 'Hot Park - Dia Inteiro',
          description: 'Acesso completo ao parque aquático com todas as atrações',
          location: 'Caldas Novas, GO',
          date: '2024-02-15',
          time: '09:00',
          price: 120.00,
          availableTickets: 150,
          totalTickets: 200,
          category: 'Parque Aquático',
          active: true
        },
        {
          id: '2',
          name: 'DiRoma Acqua Park',
          description: 'Passeio no parque aquático do Hotel DiRoma',
          location: 'Caldas Novas, GO',
          date: '2024-02-20',
          time: '10:00',
          price: 80.00,
          availableTickets: 80,
          totalTickets: 100,
          category: 'Parque Aquático',
          active: true
        }
      ];

      setIngressos(mockIngressos);
    } catch (error) {
      setError('Erro ao carregar ingressos');
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
      const ingressoData = {
        ...formData,
        price: parseFloat(formData.price),
        availableTickets: parseInt(formData.availableTickets),
        totalTickets: parseInt(formData.totalTickets),
        id: editingIngresso?.id || Date.now().toString()
      };

      if (editingIngresso) {
        setIngressos(prev => prev.map(i => i.id === editingIngresso.id ? ingressoData : i));
        setSuccess('Ingresso atualizado com sucesso!');
      } else {
        setIngressos(prev => [...prev, ingressoData]);
        setSuccess('Ingresso adicionado com sucesso!');
      }

      setIsDialogOpen(false);
      setEditingIngresso(null);
      resetForm();
    } catch (error) {
      setError('Erro ao salvar ingresso');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ingresso: Ingresso) => {
    setEditingIngresso(ingresso);
    setFormData({
      name: ingresso.name,
      description: ingresso.description,
      location: ingresso.location,
      date: ingresso.date,
      time: ingresso.time,
      price: ingresso.price.toString(),
      availableTickets: ingresso.availableTickets.toString(),
      totalTickets: ingresso.totalTickets.toString(),
      category: ingresso.category,
      active: ingresso.active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ingresso?')) {
      setIngressos(prev => prev.filter(i => i.id !== id));
      setSuccess('Ingresso excluído com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      date: '',
      time: '',
      price: '',
      availableTickets: '',
      totalTickets: '',
      category: '',
      active: true
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Ingressos</h1>
          <p className="text-gray-600">Gerencie os ingressos para atrações e eventos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingIngresso(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Ingresso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingIngresso ? 'Editar Ingresso' : 'Adicionar Novo Ingresso'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do ingresso
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Evento</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalTickets">Total de Ingressos</Label>
                  <Input
                    id="totalTickets"
                    name="totalTickets"
                    type="number"
                    value={formData.totalTickets}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableTickets">Ingressos Disponíveis</Label>
                <Input
                  id="availableTickets"
                  name="availableTickets"
                  type="number"
                  value={formData.availableTickets}
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
                    editingIngresso ? 'Atualizar' : 'Adicionar'
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
        {ingressos.map((ingresso) => (
          <Card key={ingresso.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    {ingresso.name}
                  </CardTitle>
                  <CardDescription>{ingresso.category}</CardDescription>
                </div>
                <Badge variant={ingresso.active ? 'default' : 'secondary'}>
                  {ingresso.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{ingresso.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  {ingresso.location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(ingresso.date).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {ingresso.time}
                </div>
              </div>

              <div className="text-lg font-bold text-green-600">
                R$ {ingresso.price.toLocaleString()}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Disponíveis:</span>
                  <span className="font-medium">{ingresso.availableTickets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">{ingresso.totalTickets}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${((ingresso.totalTickets - ingresso.availableTickets) / ingresso.totalTickets) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(ingresso)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(ingresso.id)}
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