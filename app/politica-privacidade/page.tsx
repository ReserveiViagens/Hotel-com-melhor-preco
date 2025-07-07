"use client"

import { ArrowLeft, Shield, Eye, Lock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import ChatAgent from "@/components/chat-agent"

export default function PoliticaPrivacidadePage() {
  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-600 to-gray-800 text-white p-6 rounded-b-3xl shadow-lg">
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
            <h1 className="text-xl font-bold">Política de Privacidade</h1>
          </div>
        </div>
        <p className="text-gray-100 text-sm">Sua privacidade é nossa prioridade</p>
      </header>

      <div className="p-6 space-y-6 pb-24">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Shield className="w-5 h-5 text-blue-600" />
              Compromisso com sua Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              A <strong>Reservei Viagens</strong> está comprometida em proteger e respeitar sua privacidade. Esta
              política explica como coletamos, usamos e protegemos suas informações pessoais.
            </p>
            <p className="text-xs text-gray-500">
              <strong>Última atualização:</strong> Janeiro de 2024
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Eye className="w-5 h-5 text-green-600" />
              Informações que Coletamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Dados Pessoais:</h4>
              <ul className="space-y-1 ml-4">
                <li>• Nome completo</li>
                <li>• E-mail</li>
                <li>• Telefone/WhatsApp</li>
                <li>• Preferências de viagem</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Dados de Navegação:</h4>
              <ul className="space-y-1 ml-4">
                <li>• Páginas visitadas</li>
                <li>• Tempo de permanência</li>
                <li>• Dispositivo utilizado</li>
                <li>• Localização aproximada</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="w-5 h-5 text-purple-600" />
              Como Usamos suas Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Finalidades:</h4>
              <ul className="space-y-2 ml-4">
                <li>
                  • <strong>Atendimento:</strong> Responder suas dúvidas e solicitações
                </li>
                <li>
                  • <strong>Reservas:</strong> Processar e confirmar suas reservas
                </li>
                <li>
                  • <strong>Comunicação:</strong> Enviar informações sobre ofertas e promoções
                </li>
                <li>
                  • <strong>Melhorias:</strong> Aprimorar nossos serviços e experiência
                </li>
                <li>
                  • <strong>Segurança:</strong> Prevenir fraudes e garantir segurança
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Lock className="w-5 h-5 text-red-600" />
              Proteção dos seus Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Medidas de Segurança:</h4>
              <ul className="space-y-2 ml-4">
                <li>
                  • <strong>Criptografia:</strong> Dados protegidos com tecnologia SSL
                </li>
                <li>
                  • <strong>Acesso Restrito:</strong> Apenas funcionários autorizados
                </li>
                <li>
                  • <strong>Backup Seguro:</strong> Cópias de segurança regulares
                </li>
                <li>
                  • <strong>Monitoramento:</strong> Vigilância constante contra ameaças
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 font-medium text-xs">
                🔒 Seus dados nunca são vendidos ou compartilhados com terceiros sem sua autorização.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Shield className="w-5 h-5 text-orange-600" />
              Seus Direitos (LGPD)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong>Acesso:</strong> Saber quais dados temos sobre você
              </li>
              <li>
                • <strong>Correção:</strong> Corrigir dados incorretos ou desatualizados
              </li>
              <li>
                • <strong>Exclusão:</strong> Solicitar a remoção dos seus dados
              </li>
              <li>
                • <strong>Portabilidade:</strong> Receber seus dados em formato legível
              </li>
              <li>
                • <strong>Oposição:</strong> Se opor ao tratamento dos seus dados
              </li>
              <li>
                • <strong>Revogação:</strong> Retirar seu consentimento a qualquer momento
              </li>
            </ul>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-800 font-medium text-xs">
                📧 Para exercer seus direitos, entre em contato: reservas@reserveiviagens.com.br
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="w-5 h-5 text-yellow-600" />
              Cookies e Tecnologias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>Utilizamos cookies para:</p>
            <ul className="space-y-1 ml-4">
              <li>• Melhorar sua experiência de navegação</li>
              <li>• Lembrar suas preferências</li>
              <li>• Analisar o tráfego do site</li>
              <li>• Personalizar conteúdo e ofertas</li>
            </ul>
            <p className="text-xs">Você pode gerenciar cookies nas configurações do seu navegador.</p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Shield className="w-5 h-5 text-blue-600" />
              Dúvidas sobre Privacidade?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              Se você tiver dúvidas sobre esta política ou sobre como tratamos seus dados, entre em contato conosco:
            </p>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
              <p>
                <strong>E-mail:</strong> reservas@reserveiviagens.com.br
              </p>
              <p>
                <strong>Telefone:</strong> (65) 2127-0415
              </p>
              <p>
                <strong>WhatsApp:</strong> (64) 99319-7555
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="https://wa.me/5564993197555?text=Olá! Tenho dúvidas sobre a política de privacidade."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-green-500 hover:bg-green-600 text-white text-xs">Falar no WhatsApp</Button>
              </a>
              <Link href="/contato">
                <Button variant="outline" className="text-xs bg-transparent">
                  Página de Contato
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Esta política pode ser atualizada periodicamente. Recomendamos que você a revise regularmente. Mudanças
              significativas serão comunicadas através dos nossos canais oficiais.
            </p>
            <p className="text-xs text-gray-400 mt-2">© 2024 Reservei Viagens - Todos os direitos reservados</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Agent */}
      <ChatAgent />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-sm border-t shadow-lg">
        <div className="flex justify-around py-2">
          {[
            { icon: "🏠", label: "Início", href: "/" },
            { icon: "🏨", label: "Hotéis", href: "/hoteis" },
            { icon: "🏷️", label: "Promoções", href: "/promocoes" },
            { icon: "📞", label: "Contato", href: "/contato" },
          ].map((item, index) => (
            <Link key={index} href={item.href}>
              <button className="flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
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
