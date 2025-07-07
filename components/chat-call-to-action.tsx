"use client"

import { useState, useEffect } from "react"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface ChatCallToActionProps {
  onOpenChat: () => void
}

export default function ChatCallToAction({ onOpenChat }: ChatCallToActionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 30000) // 30 segundos de atraso

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-24 left-4 z-40 animate-in slide-in-from-bottom duration-500">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl border-0 max-w-xs">
        <CardContent className="p-4 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="absolute top-1 right-1 text-white hover:bg-white/20 p-1 h-6 w-6"
          >
            <X className="w-3 h-3" />
          </Button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
              <Image
                src="/images/serena-profile.png"
                alt="Serena - Consultora de Turismo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Fale com a Serena!
              </h4>
              <p className="text-xs opacity-90 mb-3">
                Sua Consultora de Turismo Imobiliário está online para ajudar você!
              </p>
              <Button
                onClick={() => {
                  onOpenChat()
                  setIsVisible(false)
                }}
                size="sm"
                className="bg-white text-purple-600 hover:bg-gray-100 text-xs font-semibold"
              >
                💬 Iniciar Conversa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
