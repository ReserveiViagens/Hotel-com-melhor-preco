"use client"

import { useState } from "react"
import {
  Search,
  Star,
  ArrowLeft,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Waves,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import ChatAgent from "@/components/chat-agent"

const hotels = [
  {
    id: 1,
    name: "Ilhas do Lago Resort",
    images: [
      "/images/ilhas-do-lago-resort.jpg",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
    ],
    rating: 5,
    price: 189.99,
    originalPrice: 249.99,
    location: "Caldas Novas, GO",
    capacity: "Até 6 pessoas",
    duration: "dias / noites",
    amenities: ["Piscina Termal", "Wi-Fi", "Estacionamento", "Área de Lazer"],
    description: "Resort completo com águas termais naturais e vista para o lago.",
    discount: "24% OFF",
  },
  {
    id: 2,
    name: "Spazzio Diroma Hotel",
    images: [
      "/images/spazzio-diroma-hotel.jpg",
      "/images/diroma-acqua-park.jpeg",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
    ],
    rating: 4,
    price: 149.99,
    originalPrice: 199.99,
    location: "Caldas Novas, GO",
    capacity: "Até 4 pessoas",
    duration: "dias / noites",
    amenities: ["Parque Aquático", "Wi-Fi", "Estacionamento", "Restaurante"],
    description: "Hotel moderno com acesso ao parque aquático Diroma.",
    discount: "25% OFF",
  },
  {
    id: 3,
    name: "Piazza Diroma Hotel",
    images: [
      "/images/piazza-diroma-hotel.jpg",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
    ],
    rating: 4,
    price: 169.99,
    originalPrice: 219.99,
    location: "Caldas Novas, GO",
    capacity: "Até 5 pessoas",
    duration: "dias / noites",
    amenities: ["Piscinas Termais", "Wi-Fi", "Spa", "Academia"],
    description: "Elegância e conforto com piscinas termais exclusivas.",
    discount: "23% OFF",
  },
  {
    id: 4,
    name: "Lacqua Diroma Hotel",
    images: [
      "/images/lacqua-diroma-hotel.png",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
    ],
    rating: 5,
    price: 199.99,
    originalPrice: 279.99,
    location: "Caldas Novas, GO",
    capacity: "Até 4 pessoas",
    duration: "dias / noites",
    amenities: ["Águas Termais", "Wi-Fi", "Estacionamento", "Recreação Infantil"],
    description: "Experiência premium com águas termais e atividades para toda família.",
    discount: "29% OFF",
  },
  {
    id: 5,
    name: "Diroma Fiori Hotel",
    images: [
      "/images/diroma-fiori-hotel.jpeg",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
    ],
    rating: 4,
    price: 159.99,
    originalPrice: 209.99,
    location: "Caldas Novas, GO",
    capacity: "Até 4 pessoas",
    duration: "dias / noites",
    amenities: ["Piscina Termal", "Wi-Fi", "Jardim", "Playground"],
    description: "Ambiente aconchegante com jardins e piscinas termais.",
    discount: "24% OFF",
  },
  {
    id: 6,
    name: "Lagoa Eco Towers Hotel",
    images: [
      "/images/lagoa-eco-towers-hotel.jpeg",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
      "/placeholder.svg?width=400&height=200",
    ],
    rating: 4,
    price: 179.99,
    originalPrice: 239.99,
    location: "Caldas Novas, GO",
    capacity: "Até 7 pessoas",
    duration: "dias / noites",
    amenities: ["Vista Panorâmica", "Wi-Fi", "Estacionamento", "Piscina"],
    description: "Torres modernas com vista panorâmica da cidade.",
    discount: "25% OFF",
  },
]

export default function HoteisPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredHotels, setFilteredHotels] = useState(hotels)
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: number]: number }>({})

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredHotels(hotels)
    } else {
      const filtered = hotels.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(query.toLowerCase()) ||
          hotel.location.toLowerCase().includes(query.toLowerCase()) ||
          hotel.amenities.some((amenity) => amenity.toLowerCase().includes(query.toLowerCase())),
      )
      setFilteredHotels(filtered)
    }
  }

  const handleImageChange = (hotelId: number, direction: "next" | "prev", gallerySize: number) => {
    setCurrentImageIndexes((prev) => {
      const currentIndex = prev[hotelId] || 0
      let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1
      if (newIndex < 0) {
        newIndex = gallerySize - 1
      } else if (newIndex >= gallerySize) {
        newIndex = 0
      }
      return { ...prev, [hotelId]: newIndex }
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

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wi-fi":
        return <Wifi className="w-4 h-4" />
      case "estacionamento":
        return <Car className="w-4 h-4" />
      case "café da manhã":
        return <Coffee className="w-4 h-4" />
      case "piscina termal":
      case "águas termais":
      case "piscinas termais":
        return <Waves className="w-4 h-4" />
      case "área de lazer":
        return <Waves className="w-4 h-4" />
      case "playground":
        return <Waves className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const handleVerDetalhes = (hotel: any) => {
    const chatButton = document.querySelector("[data-chat-trigger]") as HTMLElement
    if (chatButton) {
      chatButton.click()
    }
    setTimeout(() => {
      const chatInput = document.querySelector('input[placeholder*="mensagem"]') as HTMLInputElement
      if (chatInput) {
        const message = `Olá Serena! Gostaria de mais detalhes sobre o ${hotel.name}. Vi que custa ${formatPrice(hotel.price)} por pessoa/noite e tem ${hotel.amenities.join(", ")}. Pode me ajudar com mais informações?`
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
      <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
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
            <h1 className="text-xl font-bold">Hotéis em Caldas Novas</h1>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar hotéis..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/95 border-0 rounded-xl shadow-sm"
          />
        </div>
      </header>

      <div className="p-6 space-y-6 pb-24">
        {filteredHotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum hotel encontrado</p>
            <Button onClick={() => handleSearch("")} variant="outline">
              Ver todos os hotéis
            </Button>
          </div>
        ) : (
          filteredHotels.map((hotel) => {
            const currentIndex = currentImageIndexes[hotel.id] || 0
            return (
              <Card key={hotel.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative group">
                  <Image
                    src={hotel.images[currentIndex] || "/placeholder.svg"}
                    alt={hotel.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between px-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white bg-black/50 hover:bg-black/70 rounded-full h-8 w-8"
                      onClick={() => handleImageChange(hotel.id, "prev", hotel.images.length)}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white bg-black/50 hover:bg-black/70 rounded-full h-8 w-8"
                      onClick={() => handleImageChange(hotel.id, "next", hotel.images.length)}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {hotel.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex ? "bg-white scale-125" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white">{hotel.discount}</Badge>
                  <div className="absolute top-3 right-3 flex">{renderStars(hotel.rating)}</div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{hotel.location}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{hotel.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{hotel.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{hotel.capacity}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 line-through text-sm">{formatPrice(hotel.originalPrice)}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-blue-600">{formatPrice(hotel.price)}</span>
                        <span className="text-xs text-gray-500">/ dia</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a
                        href="https://wa.me/5564993197555?text=Olá! Gostaria de mais informações sobre o hotel e fazer uma reserva."
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-full text-sm">
                          Reservar Agora
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-transparent px-2 py-1 h-7"
                        onClick={() => handleVerDetalhes(hotel)}
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
            { icon: "🏨", label: "Hotéis", href: "/hoteis", active: true },
            { icon: "🏷️", label: "Promoções", href: "/promocoes" },
            { icon: "📞", label: "Contato", href: "/contato" },
          ].map((item, index) => (
            <Link key={index} href={item.href}>
              <button
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  item.active ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
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
