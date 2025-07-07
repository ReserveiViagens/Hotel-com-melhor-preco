"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, Ticket } from "lucide-react"

interface Ingresso {
  id: string
  name: string
  description: string
  price: string
  originalPrice?: string
  discount?: string
  category: string
  validity: string
  image: string
}

interface AdminIngressosProps {
  onUpdate: () => void
}

export default function AdminIngressos({ onUpdate }: AdminIngressosProps) {
  const [ingressos, setIngressos] = useState<Ingresso[]>([
    {
      id: "1",
      name: "Hot Park - Dia Inteiro",
      description: "Acesso completo ao Hot Park com todas as atrações aquáticas",
      price: "R$ 85",
      originalPrice: "R$ 110",
      discount: "23% OFF",
      category: "Parque Aquático",
      validity: "Válido por 6 meses",
      image: "/images/hot-park.jpeg"
    }
  ])

  const [editingIngresso, setEditingIngresso] = useState<Ingresso | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddIngresso = () => {
    const newIngresso: Ingresso = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: "R$ 0",
      originalPrice: "",
      discount: "",
      category: "Parque Aquático",
      validity: "Válido por 6 meses",
      image: "/images/placeholder.jpg"
    }
    setEditingIngresso(newIngresso)
    setIsDialogOpen(true)
  }

  const handleEditIngresso = (ingresso: Ingresso) => {
    setEditingIngresso({ ...ingresso })
    setIsDialogOpen(true)
  }

  const handleDeleteIngresso = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este ingresso?")) {
      setIngressos(ingressos.filter(i => i.id !== id))
      onUpdate()
    }
  }

  const handleSaveIngresso = () => {
    if (!editingIngresso) return

    if (editingIngresso.name.trim() === "") {
      alert("Nome do ingresso é obrigatório")
      return
    }

    if (ingressos.find(i => i.id === editingIngresso.id)) {
      setIngressos(ingressos.map(i => i.id === editingIngresso.id ? editingIngresso : i))
    } else {
      setIngressos([...ingressos, editingIngresso])
    }

    setIsDialogOpen(false)
    setEditingIngresso(null)
    onUpdate()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Ingressos</h2>
          <p className="text-gray-600">Adicione, edite ou remova ingressos do sistema</p>
        </div>
        <Button onClick={handleAddIngresso} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Ingresso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingressos.map((ingresso) => (
          <Card key={ingresso.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={ingresso.image}
                alt={ingresso.name}
                className="w-full h-48 object-cover"
              />
              
              {ingresso.discount && (
                <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                  {ingresso.discount}
                </Badge>
              )}

              <div className="absolute top-3 left-3 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEditIngresso(ingresso)}
                  className="w-8 h-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteIngresso(ingresso.id)}
                  className="w-8 h-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-2">{ingresso.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{ingresso.description}</p>
              
              <Badge variant="outline" className="mb-3">
                {ingresso.category}
              </Badge>
              
              <div className="flex items-center justify-between">
                <div>
                  {ingresso.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {ingresso.originalPrice}
                    </span>
                  )}
                  <div className="text-xl font-bold text-green-600">{ingresso.price}</div>
                  <span className="text-xs text-gray-500">{ingresso.validity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIngresso?.id && ingressos.find(i => i.id === editingIngresso.id) 
                ? "Editar Ingresso" 
                : "Adicionar Novo Ingresso"
              }
            </DialogTitle>
          </DialogHeader>

          {editingIngresso && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Ingresso *</Label>
                <Input
                  id="name"
                  value={editingIngresso.name}
                  onChange={(e) => setEditingIngresso({...editingIngresso, name: e.target.value})}
                  placeholder="Ex: Hot Park - Dia Inteiro"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editingIngresso.description}
                  onChange={(e) => setEditingIngresso({...editingIngresso, description: e.target.value})}
                  placeholder="Descrição do ingresso..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    value={editingIngresso.price}
                    onChange={(e) => setEditingIngresso({...editingIngresso, price: e.target.value})}
                    placeholder="R$ 85"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Preço Original</Label>
                  <Input
                    id="originalPrice"
                    value={editingIngresso.originalPrice || ""}
                    onChange={(e) => setEditingIngresso({...editingIngresso, originalPrice: e.target.value})}
                    placeholder="R$ 110"
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Desconto</Label>
                  <Input
                    id="discount"
                    value={editingIngresso.discount || ""}
                    onChange={(e) => setEditingIngresso({...editingIngresso, discount: e.target.value})}
                    placeholder="23% OFF"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    value={editingIngresso.category}
                    onChange={(e) => setEditingIngresso({...editingIngresso, category: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Parque Aquático">Parque Aquático</option>
                    <option value="Parque Temático">Parque Temático</option>
                    <option value="Atração Turística">Atração Turística</option>
                    <option value="Show/Evento">Show/Evento</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="validity">Validade</Label>
                  <Input
                    id="validity"
                    value={editingIngresso.validity}
                    onChange={(e) => setEditingIngresso({...editingIngresso, validity: e.target.value})}
                    placeholder="Válido por 6 meses"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">URL da Imagem</Label>
                <Input
                  id="image"
                  value={editingIngresso.image}
                  onChange={(e) => setEditingIngresso({...editingIngresso, image: e.target.value})}
                  placeholder="/images/hot-park.jpeg"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveIngresso} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Ingresso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 