"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Mail, MapPin, Clock, MessageCircle, Send, Home, Calendar, FileText, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import ChatAgent from "@/components/chat-agent"
import ConsultoriaPopup from "@/components/consultoria-popup"

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [showConsultoriaPopup, setShowConsultoriaPopup] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const whatsappMessage = `Olá! Meu nome é ${formData.name}.
    
📧 Email: ${formData.email}
📱 Telefone: ${formData.phone}

💬 Mensagem: ${formData.message}

Gostaria de mais informações sobre os serviços da Reservei Viagens.`

    const whatsappUrl = `https://wa.me/5564993197555?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleSolicitarCotacao = () => {
    // Simula clique no chat agent para abrir
    const chatButton = document.querySelector("[data-chat-trigger]") as HTMLElement
    if (chatButton) {
      chatButton.click()
    }

    // Aguarda um pouco para o chat abrir e então envia mensagem
    setTimeout(() => {
      const chatInput = document.querySelector('input[placeholder*="mensagem"]') as HTMLInputElement
      if (chatInput) {
        const message = "Quero fazer uma reserva"
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
            <h1 className="text-xl font-bold">Entre em Contato</h1>
          </div>
        </div>
        <p className="text-blue-100 text-sm">Estamos aqui para ajudar você a planejar a viagem dos seus sonhos!</p>
      </header>

      <div className="p-6 space-y-6 pb-24">
        {/* Professional Services Section */}
        <div className="space-y-4">
          {/* Consultoria de Turismo Imobiliária - Destaque especial */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden border-4 border-yellow-400 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Consultoria de Turismo Imobiliário</h2>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  Bem-vindo! Você chegou até nossa consultoria especializada. Oferecemos assessoria completa em
                  investimentos, oportunidades de negócios, análise de mercado e somos especialistas em férias em Caldas
                  Novas.
                </p>
                <div className="bg-yellow-400 text-blue-800 p-4 rounded-lg mb-6">
                  <p className="font-bold text-sm">🎯 CONSULTORIA GRATUITA</p>
                  <p className="text-xs">Nossa primeira consulta é sempre gratuita!</p>
                </div>

                <Button
                  onClick={() => setShowConsultoriaPopup(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-base px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  🏢 Falar com Consultor Especialista
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Catálogo de Hotéis */}
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Catálogo de Hotéis</h3>
                  <p className="text-sm text-orange-100 mb-4">Explore nossa seleção completa de hotéis e resorts</p>
                  <Link href="/hoteis">
                    <Button className="bg-white text-orange-600 hover:bg-orange-50 font-semibold">Ver Catálogo</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Realizar Cotação */}
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Realizar Cotação</h3>
                  <p className="text-sm text-green-100 mb-4">Entre em contato conosco para cotações personalizadas</p>
                  <a
                    href="https://wa.me/5564993197555?text=Olá! Gostaria de realizar uma cotação para minha viagem."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-white text-green-600 hover:bg-green-50 font-semibold flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Calculator className="w-10 h-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cotação Rápida */}
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Cotação Rápida</h3>
                  <p className="text-sm text-purple-100 mb-4">Receba orçamentos rápidos e personalizados</p>
                  <Button
                    onClick={handleSolicitarCotacao}
                    className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                  >
                    Solicitar Cotação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Send className="w-5 h-5" />
              Envie sua Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone/WhatsApp *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Conte-nos sobre sua viagem dos sonhos..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3">
                <MessageCircle className="w-5 h-5 mr-2" />
                Enviar via WhatsApp
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid gap-4">
          {/* Email */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">E-mail</h3>
                  <p className="text-sm text-gray-600">Resposta em até 24h</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">reservas@reserveiviagens.com.br</span>
                <a href="mailto:reservas@reserveiviagens.com.br">
                  <Button size="sm" variant="outline">
                    Enviar
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Horário de Atendimento</h3>
                  <p className="text-sm text-gray-600">Estamos sempre disponíveis</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Segunda a Sexta:</span>
                  <span>8h às 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábados:</span>
                  <span>8h às 14h</span>
                </div>
                <div className="flex justify-between">
                  <span>WhatsApp:</span>
                  <span className="text-green-600 font-medium">24h por dia</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Nossos Endereços</h3>
                  <p className="text-sm text-gray-600">Visite-nos pessoalmente</p>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-800">Sede Caldas Novas:</p>
                  <p className="text-gray-600">Rua RP5, Residencial Primavera 2</p>
                  <p className="text-gray-600">Caldas Novas, Goiás</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Filial Cuiabá:</p>
                  <p className="text-gray-600">Av. Manoel José de Arruda, Porto</p>
                  <p className="text-gray-600">Cuiabá, Mato Grosso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Media */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-4 text-center">Siga-nos nas Redes Sociais</h3>
            <div className="flex justify-center gap-6">
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
          </CardContent>
        </Card>
      </div>

      {/* Consultoria Popup */}
      <ConsultoriaPopup isOpen={showConsultoriaPopup} onClose={() => setShowConsultoriaPopup(false)} />

      {/* Chat Agent */}
      <ChatAgent />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-sm border-t shadow-lg">
        <div className="flex justify-around py-2">
          {[
            { icon: "🏠", label: "Início", href: "/" },
            { icon: "🏨", label: "Hotéis", href: "/hoteis" },
            { icon: "🏷️", label: "Promoções", href: "/promocoes" },
            { icon: "📞", label: "Contato", href: "/contato", active: true },
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
