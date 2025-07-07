"use client"

import { useState } from "react"
import { Search, Star, ArrowLeft, MapPin, Calendar, Users, Percent, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import ChatAgent from "@/components/chat-agent"

const promotions = [
  {
    id: 1,
    name: "Promoférias Parque Aquático",
    images: [
      "/images/promoferias-parque-aquatico.jpeg",
      "/images/lagoa-termas-parque.jpeg",
      "/images/diroma-acqua-park.jpeg",
      "/images/hot-park.jpeg",
      "/images/water-park.jpeg",
    ],
    rating: 5,
    price: 149.99,
    originalPrice: 249.99,
    location: "Caldas Novas, GO",
    duration: "3 dias / 2 noites",
    capacity: "Até 4 pessoas",
    description:
      "Pacote completo com hotel + parque aquático + estacionamento gratuito. Diversão garantida para toda família!",
    discount: "40% OFF",
    features: ["Hotel 4 estrelas", "Parque Aquático", "Wi-Fi Gratuito", "Piscinas Termais"],
    validUntil: "31/03/2024",
  },
  {
    id: 2,
    name: "Melhor Idade Caldas Novas",
    images: [
      "/images/melhor-idade-caldas-novas.jpeg",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
    ],
    rating: 5,
    price: 129.99,
    originalPrice: 199.99,
    location: "Caldas Novas, GO",
    duration: "4 dias / 3 noites",
    capacity: "Até 5 pessoas",
    description: "Pacote especial para a melhor idade com atividades relaxantes e águas termais terapêuticas.",
    discount: "35% OFF",
    features: ["Hotel Confortável", "Águas Termais", "Atividades Especiais", "Parque Aquático"],
    validUntil: "30/04/2024",
  },
  {
    id: 3,
    name: "Fim de Semana Dourado",
    images: [
      "/images/fim-de-semana-dourado.jpeg",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
    ],
    rating: 4,
    price: 199.99,
    originalPrice: 299.99,
    location: "Rio Quente, GO",
    duration: "2 dias / 1 noite",
    capacity: "Até 5 pessoas",
    description: "Escapada romântica com estacionamento gratuito e acesso ao parque aquático.",
    discount: "33% OFF",
    features: ["Hotel Luxo", "Estacionamento Gratuito", "Wi-Fi Gratuito", "Parque Aquático"],
    validUntil: "15/04/2024",
  },
  {
    id: 4,
    name: "Pacote Família Completa",
    images: [
      "/images/pacote-familia-completa.jpeg",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
    ],
    rating: 5,
    price: 179.99,
    originalPrice: 279.99,
    location: "Caldas Novas, GO",
    duration: "3 dias / 2 noites",
    capacity: "Até 6 pessoas",
    description: "Ideal para famílias grandes! Hotel espaçoso + múltiplos parques aquáticos.",
    discount: "36% OFF",
    features: ["Apartamento Família", "Parque Aquático", "Wi-Fi Gratuito", "Atividades Kids"],
    validUntil: "31/05/2024",
  },
]

export default function PromocoesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPromotions, setFilteredPromotions] = useState(promotions)
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: number]: number }>({})

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredPromotions(promotions)
    } else {
      const filtered = promotions.filter(
        (promo) =>
          promo.name.toLowerCase().includes(query.toLowerCase()) ||
          promo.location.toLowerCase().includes(query.toLowerCase()) ||
          promo.features.some((feature) => feature.toLowerCase().includes(query.toLowerCase())),
      )
      setFilteredPromotions(filtered)
    }
  }

  const handleImageChange = (promoId: number, direction: "next" | "prev", gallerySize: number) => {
    setCurrentImageIndexes((prev) => {
      const currentIndex = prev[promoId] || 0
      let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1
      if (newIndex < 0) {
        newIndex = gallerySize - 1
      } else if (newIndex >= gallerySize) {
        newIndex = 0
      }
      return { ...prev, [promoId]: newIndex }
    })
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

  const handleVerDetalhes = (promo: any) => {
    const chatButton = document.querySelector("[data-chat-trigger]") as HTMLElement
    if (chatButton) {
      chatButton.click()
    }
    setTimeout(() => {
      const chatInput = document.querySelector('input[placeholder*="mensagem"]') as HTMLInputElement
      if (chatInput) {
        const message = `Olá Serena! Estou interessado na promoção ${promo.name}! Vi que está com ${promo.discount} por ${formatPrice(promo.price)} por dia. Inclui ${promo.features.join(", ")}. Como posso aproveitar essa oferta? Válida até ${promo.validUntil}.`
        chatInput.value = message
        const sendButton = chatInput.parentElement?.querySelector('button[type="submit"]') as HTMLElement
        if (sendButton) {
          sendButton.click()
        }
      }
    }, 500)
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-br from-orange-600 to-red-600 text-white p-6 rounded-b-3xl shadow-lg">
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
            <h1 className="text-xl font-bold">Promoções Especiais</h1>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar promoções..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/95 border-0 rounded-xl shadow-sm"
          />
        </div>
      </header>

      <div className="p-6 space-y-6 pb-24">
        {filteredPromotions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma promoção encontrada</p>
            <Button onClick={() => handleSearch("")} variant="outline">
              Ver todas as promoções
            </Button>
          </div>
        ) : (
          filteredPromotions.map((promo) => {
            const currentIndex = currentImageIndexes[promo.id] || 0
            return (
              <Card
                key={promo.id}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-200"
              >
                <div className="relative group">
                  <Image
                    src={promo.images[currentIndex] || "/placeholder.svg"}
                    alt={promo.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between px-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white bg-black/50 hover:bg-black/70 rounded-full h-8 w-8"
                      onClick={() => handleImageChange(promo.id, "prev", promo.images.length)}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white bg-black/50 hover:bg-black/70 rounded-full h-8 w-8"
                      onClick={() => handleImageChange(promo.id, "next", promo.images.length)}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {promo.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex ? "bg-white scale-125" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white text-lg px-3 py-1">
                    🔥 {promo.discount}
                  </Badge>
                  <div className="absolute top-3 right-3 flex">{renderStars(promo.rating)}</div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Válido até {promo.validUntil}
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-1 text-orange-800">{promo.name}</h3>
                  <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{promo.location}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{promo.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{promo.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{promo.capacity}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {promo.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs"
                      >
                        <Percent className="w-3 h-3" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 line-through text-sm">De {formatPrice(promo.originalPrice)}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-600">A partir de</span>
                        <span className="text-3xl font-bold text-red-600">{formatPrice(promo.price)}</span>
                      </div>
                      <p className="text-xs text-gray-500">por dia</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a
                        href="https://wa.me/5564993197555?text=Olá! Gostaria de aproveitar esta promoção especial!"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-full text-sm animate-pulse">
                          🔥 Quero Esta Oferta!
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-transparent px-2 py-1 h-7"
                        onClick={() => handleVerDetalhes(promo)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <ChatAgent />

      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-sm border-t shadow-lg">
        <div className="flex justify-around py-2">
          {[
            { icon: "🏠", label: "Início", href: "/" },
            { icon: "🏨", label: "Hotéis", href: "/hoteis" },
            { icon: "🏷️", label: "Promoções", href: "/promocoes", active: true },
            { icon: "📞", label: "Contato", href: "/contato" },
          ].map((item, index) => (
            <Link key={index} href={item.href}>
              <button
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  item.active
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
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
