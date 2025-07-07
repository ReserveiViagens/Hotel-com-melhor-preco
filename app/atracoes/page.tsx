"use client"

import { useState } from "react"
import { Search, Star, ArrowLeft, MapPin, Clock, Mountain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import ChatAgent from "@/components/chat-agent"

const attractions = [
  {
    id: 1,
    name: "Lagoa Termas Parque",
    image: "/images/lagoa-termas-parque.jpeg",
    rating: 5,
    price: 45.0,
    originalPrice: 60.0,
    location: "Caldas Novas, GO",
    duration: "Dia inteiro",
    category: "Parque Aquático",
    description: "Complexo aquático com piscinas termais naturais, toboáguas e área de lazer completa.",
    discount: "25% OFF",
    features: ["Piscinas Termais", "Toboáguas", "Área Kids", "Restaurante"],
    highlights: ["Águas naturais a 37°C", "Maior toboágua da região", "Área infantil segura"],
  },
  {
    id: 2,
    name: "Diroma Acqua Park",
    image: "/images/diroma-acqua-park.jpeg",
    rating: 5,
    price: 55.0,
    originalPrice: 75.0,
    location: "Caldas Novas, GO",
    duration: "Dia inteiro",
    category: "Complexo Aquático",
    description: "O maior e mais completo parque aquático de Caldas Novas com diversas atrações.",
    discount: "27% OFF",
    features: ["Complexo Aquático", "Águas Termais", "Esportes Aquáticos", "Spa"],
    highlights: ["15 piscinas diferentes", "Spa com tratamentos", "Esportes aquáticos"],
  },
  {
    id: 3,
    name: "Hot Park",
    image: "/images/hot-park.jpeg",
    rating: 5,
    price: 65.0,
    originalPrice: 85.0,
    location: "Rio Quente, GO",
    duration: "Dia inteiro",
    category: "Parque Temático",
    description: "O mais famoso parque aquático do Centro-Oeste com praia artificial e shows.",
    discount: "24% OFF",
    features: ["Águas Termais", "Praia Artificial", "Toboáguas Gigantes", "Shows"],
    highlights: ["Praia de águas termais", "Shows ao vivo", "Toboáguas radicais"],
  },
  {
    id: 4,
    name: "Water Park",
    image: "/images/water-park.jpeg",
    rating: 4,
    price: 40.0,
    originalPrice: 55.0,
    location: "Caldas Novas, GO",
    duration: "Dia inteiro",
    category: "Parque Familiar",
    description: "Parque aquático ideal para famílias com crianças, ambiente seguro e divertido.",
    discount: "27% OFF",
    features: ["Piscinas", "Brinquedos Aquáticos", "Área Infantil", "Lanchonete"],
    highlights: ["Ambiente familiar", "Segurança para crianças", "Preços acessíveis"],
  },
  {
    id: 5,
    name: "Kawana Park",
    image: "/images/kawana-park.jpeg",
    rating: 4,
    price: 35.0,
    originalPrice: 50.0,
    location: "Caldas Novas, GO",
    duration: "Dia inteiro",
    category: "Parque Natural",
    description: "Parque com foco na natureza, águas termais em ambiente preservado.",
    discount: "30% OFF",
    features: ["Águas Termais", "Ambiente Natural", "Piscinas Infantis", "Área Verde"],
    highlights: ["Contato com a natureza", "Águas termais puras", "Ambiente relaxante"],
  },
]

export default function AtracoesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAttractions, setFilteredAttractions] = useState(attractions)
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const categories = [
    "Todos",
    "Parque Aquático",
    "Complexo Aquático",
    "Parque Temático",
    "Parque Familiar",
    "Parque Natural",
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterAttractions(query, selectedCategory)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    filterAttractions(searchQuery, category)
  }

  const filterAttractions = (query: string, category: string) => {
    let filtered = attractions

    if (category !== "Todos") {
      filtered = filtered.filter((attraction) => attraction.category === category)
    }

    if (query.trim() !== "") {
      filtered = filtered.filter(
        (attraction) =>
          attraction.name.toLowerCase().includes(query.toLowerCase()) ||
          attraction.location.toLowerCase().includes(query.toLowerCase()) ||
          attraction.features.some((feature) => feature.toLowerCase().includes(query.toLowerCase())),
      )
    }

    setFilteredAttractions(filtered)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const handleVerDetalhes = (attraction: any) => {
    // Simula clique no chat agent para abrir
    const chatButton = document.querySelector("[data-chat-trigger]") as HTMLElement
    if (chatButton) {
      chatButton.click()
    }

    // Aguarda um pouco para o chat abrir e então envia mensagem
    setTimeout(() => {
      const chatInput = document.querySelector('input[placeholder*="mensagem"]') as HTMLInputElement
      if (chatInput) {
        const message = `Olá Serena! Gostaria de mais informações sobre ${attraction.name}. Vi que custa ${formatPrice(attraction.price)} por pessoa e é categoria ${attraction.category}. Os destaques são: ${attraction.highlights.join(", ")}. Pode me ajudar com mais detalhes?`
        chatInput.value = message

        // Simula envio da mensagem
        const sendButton = chatInput.parentElement?.querySelector('button[type="submit"]') as HTMLElement
        if (sendButton) {
          sendButton.click()
        }
      }
    }, 500)
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Image
              src="/logo-reservei.png"
              alt="Reservei Viagens"
              width={32}
              height={32}
              className="rounded-full bg-white/20 p-1"
            />
            <h1 className="text-xl font-bold">Atrações Turísticas</h1>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar atrações..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/95 border-0 rounded-xl shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleCategoryFilter(category)}
              className={`whitespace-nowrap text-xs ${
                selectedCategory === category ? "bg-white text-purple-600" : "text-white hover:bg-white/20"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </header>

      {/* Attractions List */}
      <div className="p-6 space-y-6 pb-24">
        {filteredAttractions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma atração encontrada</p>
            <Button
              onClick={() => {
                handleSearch("")
                handleCategoryFilter("Todos")
              }}
              variant="outline"
            >
              Ver todas as atrações
            </Button>
          </div>
        ) : (
          filteredAttractions.map((attraction) => (
            <Card key={attraction.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <Image
                  src={attraction.image || "/placeholder.svg"}
                  alt={attraction.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-red-500 text-white">{attraction.discount}</Badge>
                <Badge className="absolute top-3 right-3 bg-purple-500 text-white text-xs">{attraction.category}</Badge>
                <div className="absolute bottom-3 left-3 flex">{renderStars(attraction.rating)}</div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{attraction.name}</h3>
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{attraction.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{attraction.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{attraction.duration}</span>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">✨ Destaques:</h4>
                  <div className="space-y-1">
                    {attraction.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {attraction.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs"
                    >
                      <Mountain className="w-3 h-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        {formatPrice(attraction.originalPrice)}
                      </span>
                      <span className="text-2xl font-bold text-purple-600">{formatPrice(attraction.price)}</span>
                    </div>
                    <p className="text-xs text-gray-500">por pessoa</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a
                      href="https://wa.me/5564993197555?text=Olá! Gostaria de visitar esta atração turística."
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-full text-sm">
                        Visitar Agora
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent px-2 py-1 h-7"
                      onClick={() => handleVerDetalhes(attraction)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Chat Agent */}
      <ChatAgent />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-sm border-t shadow-lg">
        <div className="flex justify-around py-2">
          {[
            { icon: "🏠", label: "Início", href: "/" },
            { icon: "🏨", label: "Hotéis", href: "/hoteis" },
            { icon: "🏞️", label: "Atrações", href: "/atracoes", active: true },
            { icon: "📞", label: "Contato", href: "/contato" },
          ].map((item, index) => (
            <Link key={index} href={item.href}>
              <button
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  item.active
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
