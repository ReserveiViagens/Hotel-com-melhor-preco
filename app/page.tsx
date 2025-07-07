"use client"

import { useState, useEffect } from "react"
import { Search, Star, Shield, CheckCircle, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import LGPDPopup from "@/components/lgpd-popup"
import ReviewsSection from "@/components/reviews-section"
import ChatAgent from "@/components/chat-agent"

export default function ReserveiViagensLanding() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLGPDPopup, setShowLGPDPopup] = useState(false)
  const [showVideoCallToAction, setShowVideoCallToAction] = useState(false)
  const [showPlayAnimation, setShowPlayAnimation] = useState(false)

  useEffect(() => {
    // Simula carregamento da página
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)

    // Verifica se é a primeira visita para autoplay
    const hasVisited = localStorage.getItem("reservei-viagens-visited")

    // Check LGPD consent
    const lgpdConsent = localStorage.getItem("reservei-lgpd-consent")
    if (!lgpdConsent) {
      setShowLGPDPopup(true)
    }

    // Animação do play após 2 segundos
    const playAnimationTimer = setTimeout(() => {
      setShowPlayAnimation(true)
      // Remove a animação após 2 segundos
      setTimeout(() => {
        setShowPlayAnimation(false)
      }, 2000)
    }, 2000)

    // Call to action do vídeo após 40 segundos
    const videoCallToActionTimer = setTimeout(() => {
      setShowVideoCallToAction(true)

      // Remove o call-to-action após 10 segundos de aparecer
      setTimeout(() => {
        setShowVideoCallToAction(false)
      }, 10000) // 10 segundos
    }, 40000)

    return () => {
      clearTimeout(timer)
      clearTimeout(playAnimationTimer)
      clearTimeout(videoCallToActionTimer)
    }
  }, [])

  const handleLGPDAccept = () => {
    console.log("LGPD consent accepted")
    // Here you can initialize analytics, tracking, etc.
  }

  const handleLGPDDecline = () => {
    console.log("LGPD consent declined")
    // Here you can disable non-essential tracking
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
              alt="Reservei Viagens"
              width={80}
              height={80}
              className="animate-bounce"
            />
          </div>
        </div>
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Reservei Viagens</h2>
          <p className="text-blue-100">Carregando sua experiência...</p>
        </div>
        <div className="mt-8 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md lg:max-w-4xl xl:max-w-6xl mx-auto bg-gray-50 min-h-screen relative">
      <div className="animate-in fade-in duration-500">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 lg:p-8 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-4 lg:mb-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
              alt="Reservei Viagens"
              width={40}
              height={40}
              className="rounded-full bg-white/20 p-1 lg:w-12 lg:h-12"
            />
            <h1 className="text-xl lg:text-3xl font-bold tracking-tight">Reservei Viagens</h1>
          </div>

          <div className="relative mb-6 lg:mb-8 max-w-md lg:max-w-lg mx-auto lg:mx-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar Hotéis, Parques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/95 border-0 rounded-xl shadow-sm"
            />
          </div>

          {/* Video Section with Call to Action */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl mb-6 lg:mb-8 max-w-4xl mx-auto">
            <iframe
              src="https://www.reserveiviagens.com.br/wp-content/uploads/2025/05/reservei-viagens.mp4"
              title="Diversão no Parque Aquático em Caldas Novas - Vídeo promocional 16:9 1280x720px"
              className="w-full h-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Play Animation */}
            {showPlayAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-ping">
                  <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action Overlay - Appears after 40 seconds */}
            {showVideoCallToAction && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-4 animate-in fade-in duration-500">
                <div className="text-center text-white">
                  <p className="text-sm font-medium mb-2">🎥 Veja como é incrível!</p>
                  <Link href="/promocoes">
                    <Button className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 animate-pulse">
                      Quero Conhecer! 🏊‍♂️
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="grid grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-6 max-w-2xl mx-auto">
            {[
              { icon: "🏨", label: "Hotéis", href: "/hoteis" },
              { icon: "🎟️", label: "Ingressos", href: "/ingressos" },
              { icon: "🏞️", label: "Atrações", href: "/atracoes" },
              { icon: "🏷️", label: "Promoções", href: "/promocoes" },
            ].map((category, index) => (
              <Link key={index} href={category.href}>
                <button className="flex flex-col items-center p-3 lg:p-6 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-105 w-full">
                  <div className="text-2xl lg:text-4xl mb-2">{category.icon}</div>
                  <span className="text-xs lg:text-sm font-medium">{category.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 lg:p-8 space-y-8 lg:space-y-12">
          {/* Hero Promotion */}
          <Card className="bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900 overflow-hidden relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
            <CardContent className="p-6 lg:p-12 text-center relative z-10">
              <Badge className="bg-red-500 text-white mb-4 animate-pulse text-sm lg:text-base">
                🔥 PROMOFÉRIAS CALDAS NOVAS!
              </Badge>
              <h2 className="text-xl lg:text-3xl font-bold mb-2">Hotel + Parque Aquático</h2>
              <p className="text-sm lg:text-base text-gray-700 mb-1">Diárias a partir de</p>
              <div className="text-3xl lg:text-5xl font-black mb-2 text-blue-700">R$ 149,99</div>
              <p className="text-sm lg:text-base opacity-90 mb-4">por pessoa</p>
              <p className="text-sm lg:text-base leading-relaxed mb-6 opacity-95 max-w-2xl mx-auto">
                Sinta a magia de Caldas Novas! Planeje sua viagem dos sonhos hoje com diárias imperdíveis em pacotes com
                hotéis confortáveis e os melhores parques aquáticos.
              </p>
              <Link href="/promocoes">
                <Button className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 lg:px-12 py-3 lg:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm lg:text-base">
                  Quero Esta Super Oferta!
                </Button>
              </Link>
              <p className="text-sm lg:text-base font-semibold text-blue-700 mt-4">
                Reservei Viagens: Parques, Hotéis & Atrações te esperam!
              </p>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 lg:gap-8 max-w-4xl mx-auto">
            {[
              { icon: CheckCircle, title: "Garantia de", subtitle: "Melhor Preço" },
              { icon: Shield, title: "Pagamento", subtitle: "100% Seguro" },
              { icon: Award, title: "+5000 Clientes", subtitle: "Satisfeitos" },
            ].map((badge, index) => (
              <Card key={index} className="text-center p-4 lg:p-8">
                <CardContent className="p-0">
                  <badge.icon className="w-8 h-8 lg:w-12 lg:h-12 text-blue-600 mx-auto mb-2 lg:mb-4" />
                  <p className="text-xs lg:text-sm font-medium text-gray-600">
                    {badge.title}
                    <br />
                    {badge.subtitle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-4xl mx-auto">
            <Link href="/hoteis">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 lg:p-10 text-center">
                  <div className="text-3xl lg:text-5xl mb-3 lg:mb-6">🏨</div>
                  <h3 className="font-bold text-lg lg:text-2xl mb-2 lg:mb-4">Hotéis</h3>
                  <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">Conforto e qualidade garantidos</p>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 lg:text-base lg:py-3">
                    Ver Hotéis
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/promocoes">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 lg:p-10 text-center">
                  <div className="text-3xl lg:text-5xl mb-3 lg:mb-6">🏷️</div>
                  <h3 className="font-bold text-lg lg:text-2xl mb-2 lg:mb-4">Promoções</h3>
                  <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">Ofertas imperdíveis</p>
                  <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 lg:text-base lg:py-3">
                    Ver Ofertas
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 lg:mt-20 max-w-6xl mx-auto">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-6 lg:mb-12 text-center">
              O que nossos clientes dizem
            </h2>
            <ReviewsSection />
          </div>

          {/* Footer */}
          <footer className="mt-12 lg:mt-20 pt-8 lg:pt-12 border-t border-gray-200 text-center text-gray-600 space-y-6 lg:space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
                alt="Reservei Viagens"
                width={32}
                height={32}
                className="rounded-full lg:w-12 lg:h-12"
              />
              <p className="text-lg lg:text-2xl font-bold text-blue-600">Reservei Viagens</p>
            </div>

            <p className="italic text-blue-600 font-medium text-base lg:text-lg">"Parques, Hotéis & Atrações"</p>

            <div className="space-y-3 lg:space-y-4 text-sm lg:text-base">
              <div>
                <p className="font-semibold text-gray-800">Sede Caldas Novas:</p>
                <p>Rua RP5, Residencial Primavera 2 - Caldas Novas, Goiás</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Filial Cuiabá:</p>
                <p>Av. Manoel José de Arruda, Porto - Cuiabá, Mato Grosso</p>
              </div>
            </div>

            <div className="space-y-2 text-sm lg:text-base">
              <p>
                <strong>E-mail:</strong>{" "}
                <a href="mailto:reservas@reserveiviagens.com.br" className="text-blue-600 hover:underline">
                  reservas@reserveiviagens.com.br
                </a>
              </p>
            </div>

            {/* Social Media */}
            <div className="flex justify-center gap-6 lg:gap-12 my-6 lg:my-8">
              <a
                href="https://www.facebook.com/comercialreservei"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-de-logotipo-de-midia-social_23-2151296987-hS3ON3d4MIjczKSk4yyVxmsszhPhdA.avif"
                    alt="Facebook"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-medium">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/reserveiviagens"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-pink-600 hover:text-pink-800 transition-colors"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logotipo-da-aplicacao-instagram_23-2151544088-QGKd21dzz8587aJH9jwFVuzReiHv47.avif"
                    alt="Instagram"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-medium">Instagram</span>
              </a>
              <a
                href="https://www.reserveiviagens.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gradient-world-wide-web-internet_78370-4896-SCszINpbMPiQDxTwumaDOWSsneOD6a.avif"
                    alt="Website"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-medium">Website</span>
              </a>
            </div>

            <p className="text-xs lg:text-sm mt-6 pb-20">© 2024-2025 Reservei Viagens. Todos os direitos reservados.</p>
          </footer>
        </div>

        {/* Chat Agent */}
        <ChatAgent />
      </div>

      {/* LGPD Popup */}
      {showLGPDPopup && <LGPDPopup onAccept={handleLGPDAccept} onDecline={handleLGPDDecline} />}

      {/* Scroll to Top Button - Aligned with Chat */}
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-4 right-4 w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-40"
        size="sm"
      >
        ↑
      </Button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md lg:max-w-4xl xl:max-w-6xl bg-white/95 backdrop-blur-sm border-t shadow-lg">
        <div className="flex justify-around py-2 lg:py-4">
          {[
            { icon: "🏠", label: "Início", href: "/" },
            { icon: "🏨", label: "Hotéis", href: "/hoteis" },
            { icon: "🏷️", label: "Promoções", href: "/promocoes" },
            { icon: "📞", label: "Contato", href: "/contato" },
          ].map((item, index) => (
            <div key={index}>
              {item.href && (
                <Link href={item.href}>
                  <button className="flex flex-col items-center py-2 px-4 lg:px-8 rounded-lg transition-all duration-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                    <span className="text-xl lg:text-2xl mb-1">{item.icon}</span>
                    <span className="text-xs lg:text-sm font-medium">{item.label}</span>
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}
