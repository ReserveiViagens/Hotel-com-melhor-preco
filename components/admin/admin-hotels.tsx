"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Save, 
  X,
  Star,
  MapPin,
  Users,
  Wifi,
  Car,
  Coffee,
  Waves,
  Utensils
} from "lucide-react"
import Image from "next/image"

interface Hotel {
  id: string
  name: string
  description: string
  price: string
  originalPrice?: string
  discount?: string
  rating: number
  capacity: string
  features: string[]
  image: string
  images: string[]
  location: string
  phone: string
  email: string
}

interface AdminHotelsProps {
  onUpdate: () => void
}

export default function AdminHotels({ onUpdate }: AdminHotelsProps) {
  const [hotels, setHotels] = useState<Hotel[]>([
    {
      id: "1",
      name: "Spazzio DiRoma Hotel",
      description: "Hotel com piscinas termais e infraestrutura completa para toda a família.",
      price: "R$ 250",
      originalPrice: "R$ 320",
      discount: "20% OFF",
      rating: 5,
      capacity: "Até 4 pessoas",
      features: ["Piscinas Termais", "Acqua Park", "Restaurante", "Wi-Fi Gratuito", "Estacionamento"],
      image: "/images/spazzio-diroma-hotel.jpg",
      images: [
        "/images/spazzio-diroma-hotel.jpg",
        "/images/hotels/spazzio-diroma-2.jpg"
      ],
      location: "Caldas Novas, GO",
      phone: "(64) 3453-1234",
      email: "reservas@spazziodiroma.com.br"
    },
    {
      id: "2", 
      name: "Piazza DiRoma Hotel",
      description: "Arquitetura italiana com spa premium e piscinas exclusivas.",
      price: "R$ 260",
      originalPrice: "R$ 325",
      discount: "20% OFF",
      rating: 5,
      capacity: "Até 4 pessoas",
      features: ["Arquitetura Italiana", "Spa Premium", "Piscinas Exclusivas", "Room Service"],
      image: "/images/piazza-diroma-hotel.jpg",
      images: ["/images/piazza-diroma-hotel.jpg"],
      location: "Caldas Novas, GO",
      phone: "(64) 3453-5678",
      email: "reservas@piazzadiroma.com.br"
    }
  ])

  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const availableFeatures = [
    { id: "wifi", label: "Wi-Fi Gratuito", icon: Wifi },
    { id: "parking", label: "Estacionamento", icon: Car },
    { id: "breakfast", label: "Café da Manhã", icon: Coffee },
    { id: "pool", label: "Piscinas Termais", icon: Waves },
    { id: "restaurant", label: "Restaurante", icon: Utensils },
    { id: "spa", label: "SPA", icon: Star },
    { id: "acquapark", label: "Acqua Park", icon: Waves },
    { id: "roomservice", label: "Room Service", icon: Utensils }
  ]

  const handleAddHotel = () => {
    const newHotel: Hotel = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: "R$ 0",
      originalPrice: "",
      discount: "",
      rating: 5,
      capacity: "Até 2 pessoas",
      features: [],
      image: "/images/placeholder.jpg",
      images: [],
      location: "Caldas Novas, GO",
      phone: "",
      email: ""
    }
    setEditingHotel(newHotel)
    setIsDialogOpen(true)
  }

  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel({ ...hotel })
    setIsDialogOpen(true)
  }

  const handleDeleteHotel = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este hotel?")) {
      setHotels(hotels.filter(h => h.id !== id))
      onUpdate()
    }
  }

  const handleSaveHotel = () => {
    if (!editingHotel) return

    if (editingHotel.name.trim() === "") {
      alert("Nome do hotel é obrigatório")
      return
    }

    if (hotels.find(h => h.id === editingHotel.id)) {
      // Editando hotel existente
      setHotels(hotels.map(h => h.id === editingHotel.id ? editingHotel : h))
    } else {
      // Adicionando novo hotel
      setHotels([...hotels, editingHotel])
    }

    setIsDialogOpen(false)
    setEditingHotel(null)
    onUpdate()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && editingHotel) {
      // Simular upload - em produção, fazer upload real
      const imageUrl = URL.createObjectURL(file)
      setEditingHotel({
        ...editingHotel,
        image: imageUrl,
        images: [...editingHotel.images, imageUrl]
      })
    }
  }

  const toggleFeature = (feature: string) => {
    if (!editingHotel) return
    
    const features = editingHotel.features.includes(feature)
      ? editingHotel.features.filter(f => f !== feature)
      : [...editingHotel.features, feature]
    
    setEditingHotel({ ...editingHotel, features })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Hotéis</h2>
          <p className="text-gray-600">Adicione, edite ou remova hotéis do sistema</p>
        </div>
        <Button onClick={handleAddHotel} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Hotel
        </Button>
      </div>

      {/* Lista de Hotéis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <Image
                src={hotel.image}
                alt={hotel.name}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
              
              {hotel.discount && (
                <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                  {hotel.discount}
                </Badge>
              )}
              
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                {renderStars(hotel.rating)}
              </div>

              {/* Botões de Ação */}
              <div className="absolute top-3 left-3 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEditHotel(hotel)}
                  className="w-8 h-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteHotel(hotel.id)}
                  className="w-8 h-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-2">{hotel.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hotel.description}</p>
              
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{hotel.location}</span>
              </div>

              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{hotel.capacity}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {hotel.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {hotel.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{hotel.features.length - 3} mais
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  {hotel.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {hotel.originalPrice}
                    </span>
                  )}
                  <div className="text-xl font-bold text-blue-600">{hotel.price}</div>
                  <span className="text-xs text-gray-500">por pessoa</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHotel?.id && hotels.find(h => h.id === editingHotel.id) 
                ? "Editar Hotel" 
                : "Adicionar Novo Hotel"
              }
            </DialogTitle>
          </DialogHeader>

          {editingHotel && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna 1: Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Hotel *</Label>
                  <Input
                    id="name"
                    value={editingHotel.name}
                    onChange={(e) => setEditingHotel({...editingHotel, name: e.target.value})}
                    placeholder="Ex: Spazzio DiRoma Hotel"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={editingHotel.description}
                    onChange={(e) => setEditingHotel({...editingHotel, description: e.target.value})}
                    placeholder="Descrição do hotel..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="price">Preço *</Label>
                    <Input
                      id="price"
                      value={editingHotel.price}
                      onChange={(e) => setEditingHotel({...editingHotel, price: e.target.value})}
                      placeholder="R$ 250"
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Preço Original</Label>
                    <Input
                      id="originalPrice"
                      value={editingHotel.originalPrice || ""}
                      onChange={(e) => setEditingHotel({...editingHotel, originalPrice: e.target.value})}
                      placeholder="R$ 320"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="discount">Desconto</Label>
                    <Input
                      id="discount"
                      value={editingHotel.discount || ""}
                      onChange={(e) => setEditingHotel({...editingHotel, discount: e.target.value})}
                      placeholder="20% OFF"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacidade</Label>
                    <Input
                      id="capacity"
                      value={editingHotel.capacity}
                      onChange={(e) => setEditingHotel({...editingHotel, capacity: e.target.value})}
                      placeholder="Até 4 pessoas"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={editingHotel.location}
                    onChange={(e) => setEditingHotel({...editingHotel, location: e.target.value})}
                    placeholder="Caldas Novas, GO"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={editingHotel.phone}
                      onChange={(e) => setEditingHotel({...editingHotel, phone: e.target.value})}
                      placeholder="(64) 3453-1234"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editingHotel.email}
                      onChange={(e) => setEditingHotel({...editingHotel, email: e.target.value})}
                      placeholder="reservas@hotel.com.br"
                    />
                  </div>
                </div>

                <div>
                  <Label>Avaliação</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditingHotel({...editingHotel, rating: star})}
                        className="p-1"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= editingHotel.rating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coluna 2: Imagem e Características */}
              <div className="space-y-4">
                <div>
                  <Label>Imagem Principal</Label>
                  <div className="mt-2">
                    {editingHotel.image && (
                      <div className="relative mb-3">
                        <Image
                          src={editingHotel.image}
                          alt="Preview"
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Carregar Nova Imagem
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Características do Hotel</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableFeatures.map((feature) => {
                      const Icon = feature.icon
                      const isSelected = editingHotel.features.includes(feature.label)
                      
                      return (
                        <button
                          key={feature.id}
                          type="button"
                          onClick={() => toggleFeature(feature.label)}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                            isSelected 
                              ? "bg-blue-50 border-blue-500 text-blue-700" 
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{feature.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveHotel} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Hotel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 