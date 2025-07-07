"use client"

import { useState } from "react"
import { Search, Star, ArrowLeft, MapPin, Clock, Users, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import ChatAgent from "@/components/chat-agent"

const tickets = [
  {
    id: 1,
    name: "Lagoa Termas Parque",
    image: "/images/lagoa-termas-parque.jpeg",
    rating: 5,
    price: 45.0,
    originalPrice: 60.0,
    location: "Caldas Novas, GO",
    duration: "Dia inteiro",
    capacity: "Até 4 pessoas",
    description: "Parque aquático com piscinas termais naturais e toboáguas emocionantes.",
    discount: "25% OFF",
    features: ["Piscinas Termais", "Toboáguas", "Área Kids", "Restaurante"],
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
    capacity: "Até 6 pessoas",
    description: "O maior complexo aquático de Caldas Novas com diversas atrações.",
    discount: "27% OFF",
    features: ["Complexo Aquático", "Águas Termais", "Esportes Aquáticos", "Spa"],
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
    capacity: "Até 8 pessoas",
    description: "Parque aquático mais famoso do Centro-Oeste com águas termais.",
    discount: "24% OFF",
    features: ["Águas Termais", "Praia Artificial", "Toboáguas Gigantes", "Shows"],
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
    capacity: "Até 4 pessoas",
    description: "Diversão garantida para toda família com piscinas e brinquedos aquáticos.",
    discount: "27% OFF",
    features: ["Piscinas", "Brinquedos Aquáticos", "Área Infantil", "Lanchonete"],
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
    capacity: "Até 4 pessoas",
    description: "Parque aquático familiar com águas termais e ambiente aconchegante.",
    discount: "30% OFF",
    features: ["Águas Termais", "Ambiente Familiar", "Piscinas Infantis", "Área Verde"],
  },
]

export default function IngressosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTickets, setFilteredTickets] = useState(tickets)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredTickets(tickets)
    } else {
      const filtered = tickets.filter(
        (ticket) =>
          ticket.name.toLowerCase().includes(query.toLowerCase()) ||
          ticket.location.toLowerCase().includes(query.toLowerCase()) ||
          ticket.features.some((feature) => feature.toLowerCase().includes(query.toLowerCase())),
      )
      setFilteredTickets(filtered)
    }
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

  const handleVerDetalhes = (ticket: any) => {
    // Simula clique no chat agent para abrir
    const chatButton = document.querySelector("[data-chat-trigger]") as HTMLElement
    if (chatButton) {
      chatButton.click()
    }

    // Aguarda um pouco para o chat abrir e então envia mensagem
    setTimeout(() => {
      const chatInput = document.querySelector('input[placeholder*="mensagem"]') as HTMLInputElement
      if (chatInput) {
        const message = `Olá Serena! Quero saber mais detalhes sobre o ingresso para ${ticket.name}. Vi que custa ${formatPrice(ticket.price)} por pessoa e inclui ${ticket.features.join(", ")}. Pode me dar mais informações sobre horários e como comprar?`
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
      <header className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-b-3xl shadow-lg">
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
            <h1 className="text-xl font-bold">Ingressos para Parques</h1>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar parques..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/95 border-0 rounded-xl shadow-sm"
          />
        </div>
      </header>

      {/* Tickets List */}
      <div className="p-6 space-y-6 pb-24">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum ingresso encontrado</p>
            <Button onClick={() => handleSearch("")} variant="outline">
              Ver todos os ingressos
            </Button>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <Image
                  src={ticket.image || "/placeholder.svg"}
                  alt={ticket.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-red-500 text-white">{ticket.discount}</Badge>
                <div className="absolute top-3 right-3 flex">{renderStars(ticket.rating)}</div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{ticket.name}</h3>
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{ticket.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{ticket.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{ticket.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{ticket.capacity}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {ticket.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs"
                    >
                      <Ticket className="w-3 h-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">{formatPrice(ticket.originalPrice)}</span>
                      <span className="text-2xl font-bold text-green-600">{formatPrice(ticket.price)}</span>
                    </div>
                    <p className="text-xs text-gray-500">por pessoa</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a
                      href="https://wa.me/5564993197555?text=Olá! Gostaria de comprar ingressos para o parque."
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-full text-sm">
                        Comprar Ingresso
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent px-2 py-1 h-7"
                      onClick={() => handleVerDetalhes(ticket)}
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
            { icon: "🎟️", label: "Ingressos", href: "/ingressos", active: true },
            { icon: "📞", label: "Contato", href: "/contato" },
          ].map((item, index) => (
            <Link key={index} href={item.href}>
              <button
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  item.active ? "text-green-600 bg-green-50" : "text-gray-500 hover:text-green-600 hover:bg-green-50"
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
