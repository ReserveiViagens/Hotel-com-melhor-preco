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
import { Loader2, Plus, Edit, Trash2, Hotel, Star, MapPin, Phone, Mail } from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  price: number;
  rating: number;
  amenities: string[];
  images: string[];
  active: boolean;
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    price: '',
    rating: '',
    amenities: '',
    active: true
  });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch('/api/admin/hoteis', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar hotéis');
      }

      const data = await response.json();
      // Converter strings JSON de volta para arrays
      const hotelsWithArrays = data.map((hotel: any) => ({
        ...hotel,
        amenities: hotel.amenities ? JSON.parse(hotel.amenities) : [],
        images: hotel.images ? JSON.parse(hotel.images) : []
      }));
      setHotels(hotelsWithArrays);
    } catch (error) {
      setError('Erro ao carregar hotéis');
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
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const hotelData = {
        ...formData,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating),
        amenities: JSON.stringify(formData.amenities.split(',').map(a => a.trim())),
        images: JSON.stringify([]) // Por enquanto, array vazio
      };

      const url = editingHotel ? `/api/admin/hoteis/${editingHotel.id}` : '/api/admin/hoteis';
      const method = editingHotel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotelData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar hotel');
      }

      const savedHotel = await response.json();
      
      if (editingHotel) {
        setHotels(prev => prev.map(h => h.id === editingHotel.id ? {
          ...savedHotel,
          amenities: JSON.parse(savedHotel.amenities),
          images: JSON.parse(savedHotel.images)
        } : h));
        setSuccess('Hotel atualizado com sucesso!');
      } else {
        setHotels(prev => [...prev, {
          ...savedHotel,
          amenities: JSON.parse(savedHotel.amenities),
          images: JSON.parse(savedHotel.images)
        }]);
        setSuccess('Hotel adicionado com sucesso!');
      }

      setIsDialogOpen(false);
      setEditingHotel(null);
      resetForm();
    } catch (error) {
      setError('Erro ao salvar hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      phone: hotel.phone,
      email: hotel.email,
      price: hotel.price.toString(),
      rating: hotel.rating.toString(),
      amenities: hotel.amenities.join(', '),
      active: hotel.active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este hotel?')) {
      setHotels(prev => prev.filter(h => h.id !== id));
      setSuccess('Hotel excluído com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      price: '',
      rating: '',
      amenities: '',
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Hotéis</h1>
          <p className="text-gray-600">Gerencie os hotéis cadastrados no sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingHotel(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingHotel ? 'Editar Hotel' : 'Adicionar Novo Hotel'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do hotel
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Hotel</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço por Noite (R$)</Label>
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
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="amenities">Comodidades (separadas por vírgula)</Label>
                  <Input
                    id="amenities"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleInputChange}
                    placeholder="Piscina, Wi-Fi, Restaurante"
                  />
                </div>
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
                    editingHotel ? 'Atualizar' : 'Adicionar'
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
        {hotels.map((hotel) => (
          <Card key={hotel.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="h-5 w-5" />
                    {hotel.name}
                  </CardTitle>
                  <CardDescription>{hotel.address}</CardDescription>
                </div>
                <Badge variant={hotel.active ? 'default' : 'secondary'}>
                  {hotel.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{hotel.description}</p>
              
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{hotel.rating}</span>
                <span className="text-sm text-gray-500">/ 5</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  {hotel.address}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {hotel.phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {hotel.email}
                </div>
              </div>

              <div className="text-lg font-bold text-green-600">
                R$ {hotel.price.toLocaleString()}/noite
              </div>

              <div className="flex flex-wrap gap-1">
                {hotel.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(hotel)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(hotel.id)}
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