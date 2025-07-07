"use client"
import { X, Phone, MessageCircle, Clock, Users, Building, TrendingUp, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ConsultoriaPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConsultoriaPopup({ isOpen, onClose }: ConsultoriaPopupProps) {
  if (!isOpen) return null

  const whatsappNumbers = [
    {
      number: "5564993197555",
      display: "(64) 99319-7555",
      name: "Consultor Principal",
      specialty: "Investimentos Imobiliários",
    },
    {
      number: "5564993068752",
      display: "(64) 99306-8752",
      name: "Especialista em Resorts",
      specialty: "Hotéis e Resorts",
    },
    {
      number: "5565992351207",
      display: "(65) 99235-1207",
      name: "Consultor Cuiabá",
      specialty: "Mercado Regional",
    },
    {
      number: "5565992048814",
      display: "(65) 99204-8814",
      name: "Analista de Mercado",
      specialty: "Análise de Investimentos",
    },
  ]

  const handleWhatsAppClick = (number: string, consultorName: string) => {
    const message = `Olá! Vim através do site da Reservei Viagens e gostaria de falar com ${consultorName} sobre Consultoria de Turismo Imobiliário.

🏢 Tenho interesse em:
• Oportunidades de investimento em Caldas Novas
• Análise de mercado imobiliário
• Consultoria especializada em turismo
• Investimentos em hotéis e resorts

Gostaria de agendar uma consulta para discutir minhas metas de investimento.`

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Consultoria de Turismo Imobiliário</CardTitle>
              <p className="text-sm text-blue-100">Especialistas em investimentos</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Serviços Oferecidos */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Nossos Serviços
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Análise de mercado imobiliário em Caldas Novas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Consultoria para investimentos em hotéis e resorts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Oportunidades de negócios no setor turístico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Assessoria completa para investidores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Planejamento estratégico de investimentos</span>
              </div>
            </div>
          </div>

          {/* Horário de Atendimento */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-gray-800">Atendimento Rápido</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Segunda a Sexta:</span>
                <span className="font-medium">8h às 18h</span>
              </div>
              <div className="flex justify-between">
                <span>Sábados:</span>
                <span className="font-medium">8h às 14h</span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp:</span>
                <span className="text-green-600 font-medium">24h por dia</span>
              </div>
              <div className="flex justify-between">
                <span>Resposta média:</span>
                <span className="text-blue-600 font-medium">5 minutos</span>
              </div>
            </div>
          </div>

          {/* Telefone */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Telefone</h3>
                <p className="text-sm text-gray-600">Horário comercial</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">(65) 2127-0415</span>
              <a href="tel:+556521270415">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Phone className="w-3 h-3 mr-1" />
                  Ligar
                </Button>
              </a>
            </div>
          </div>

          {/* Especialistas Disponíveis */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Nossos Especialistas
            </h3>
            <div className="space-y-3">
              {whatsappNumbers.map((consultor, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-sm text-gray-800">{consultor.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Online
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{consultor.specialty}</p>
                      <p className="text-xs text-blue-600 font-medium">{consultor.display}</p>
                    </div>
                    <Button
                      onClick={() => handleWhatsAppClick(consultor.number, consultor.name)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Falar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Localização */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              Nossos Escritórios
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">Sede Caldas Novas</p>
                <p className="text-gray-600">Rua RP5, Residencial Primavera 2</p>
                <p className="text-gray-600">Caldas Novas, Goiás</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">Filial Cuiabá</p>
                <p className="text-gray-600">Av. Manoel José de Arruda, Porto</p>
                <p className="text-gray-600">Cuiabá, Mato Grosso</p>
              </div>
            </div>
          </div>

          {/* Botão Principal */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg text-center">
            <h4 className="text-white font-semibold mb-2">Pronto para Investir?</h4>
            <p className="text-blue-100 text-sm mb-4">
              Fale agora com nosso consultor principal e descubra as melhores oportunidades!
            </p>
            <Button
              onClick={() => handleWhatsAppClick("5564993197555", "Consultor Principal")}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold w-full"
            >
              <Phone className="w-4 h-4 mr-2" />
              Falar com Consultor Principal
            </Button>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Consultoria Gratuita</h4>
            <p className="text-yellow-700 text-sm">
              Nossa primeira consulta é sempre gratuita! Analisamos seu perfil de investidor e apresentamos as melhores
              oportunidades do mercado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
