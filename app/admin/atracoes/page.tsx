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
import { Loader2, Plus, Edit, Trash2, Mountain, MapPin, Clock, Star } from 'lucide-react';

interface Atracao {
  id: string;
  name: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  rating: number;
  category: string;
  highlights: string[];
  images: string[];
  active: boolean;
}

export default function AdminAtracoesPage() {
  const [atracoes, setAtracoes] = useState<Atracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAtracao, setEditingAtracao] = useState<Atracao | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    duration: '',
    price: '',
    rating: '',
    category: '',
    highlights: '',
    active: true
  });

  useEffect(() => {
    loadAtracoes();
  }, []);

  const loadAtracoes = async () => {
    try {
      // Simular carregamento de atrações
      const mockAtracoes: Atracao[] = [
        {
          id: '1',
          name: 'Hot Park',
          description: 'O maior parque aquático da América Latina com mais de 50 atrações',
          location: 'Caldas Novas, GO',
          duration: 'Dia inteiro',
          price: 120.00,
          rating: 4.8,
          category: 'Parque Aquático',
          highlights: ['Tobogãs', 'Piscinas Termais', 'Shows', 'Restaurantes'],
          images: ['/images/hot-park.jpeg'],
          active: true
        },
        {
          id: '2',
          name: 'DiRoma Acqua Park',
          description: 'Parque aquático exclusivo do Hotel DiRoma com águas termais',
          location: 'Caldas Novas, GO',
          duration: '4 horas',
          price: 80.00,
          rating: 4.5,
          category: 'Parque Aquático',
          highlights: ['Águas Termais', 'Tobogãs', 'Piscinas'],
          images: ['/images/diroma-acqua-park.jpeg'],
          active: true
        }
      ];

      setAtracoes(mockAtracoes);
    } catch (error) {
      setError('Erro ao carregar atrações');
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
      const atracaoData = {
        ...formData,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating),
        highlights: formData.highlights.split(',').map(h => h.trim()),
        images: editingAtracao?.images || [],
        id: editingAtracao?.id || Date.now().toString()
      };

      if (editingAtracao) {
        setAtracoes(prev => prev.map(a => a.id === editingAtracao.id ? atracaoData : a));
        setSuccess('Atração atualizada com sucesso!');
      } else {
        setAtracoes(prev => [...prev, atracaoData]);
        setSuccess('Atração adicionada com sucesso!');
      }

      setIsDialogOpen(false);
      setEditingAtracao(null);
      resetForm();
    } catch (error) {
      setError('Erro ao salvar atração');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (atracao: Atracao) => {
    setEditingAtracao(atracao);
    setFormData({
      name: atracao.name,
      description: atracao.description,
      location: atracao.location,
      duration: atracao.duration,
      price: atracao.price.toString(),
      rating: atracao.rating.toString(),
      category: atracao.category,
      highlights: atracao.highlights.join(', '),
      active: atracao.active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta atração?')) {
      setAtracoes(prev => prev.filter(a => a.id !== id));
      setSuccess('Atração excluída com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      duration: '',
      price: '',
      rating: '',
      category: '',
      highlights: '',
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Atrações</h1>
          <p className="text-gray-600">Gerencie as atrações turísticas disponíveis</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingAtracao(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Atração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAtracao ? 'Editar Atração' : 'Adicionar Nova Atração'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações da atração
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Atração</Label>
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
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="Ex: 4 horas, Dia inteiro"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="rating">Avaliação (0-5)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="highlights">Destaques (separados por vírgula)</Label>
                <Input
                  id="highlights"
                  name="highlights"
                  value={formData.highlights}
                  onChange={handleInputChange}
                  placeholder="Tobogãs, Piscinas, Shows"
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
                    editingAtracao ? 'Atualizar' : 'Adicionar'
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
        {atracoes.map((atracao) => (
          <Card key={atracao.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mountain className="h-5 w-5" />
                    {atracao.name}
                  </CardTitle>
                  <CardDescription>{atracao.category}</CardDescription>
                </div>
                <Badge variant={atracao.active ? 'default' : 'secondary'}>
                  {atracao.active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{atracao.description}</p>
              
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{atracao.rating}</span>
                <span className="text-sm text-gray-500">/ 5</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  {atracao.location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {atracao.duration}
                </div>
              </div>

              <div className="text-lg font-bold text-green-600">
                R$ {atracao.price.toLocaleString()}
              </div>

              <div className="flex flex-wrap gap-1">
                {atracao.highlights.map((highlight, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(atracao)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(atracao.id)}
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