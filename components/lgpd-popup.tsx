"use client"

import { useState, useEffect } from "react"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface LGPDPopupProps {
  onAccept: () => void
  onDecline: () => void
}

export default function LGPDPopup({ onAccept, onDecline }: LGPDPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10000) // 10 segundos de atraso

    return () => clearTimeout(timer)
  }, [])

  const handleAccept = () => {
    localStorage.setItem("reservei-lgpd-consent", "accepted")
    onAccept()
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("reservei-lgpd-consent", "declined")
    onDecline()
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[100] p-4">
      <Card
        className="w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ height: "150px" }}
      >
        <CardContent className="p-4 h-full flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-800 mb-2">Política de Privacidade</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa
                política de privacidade.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-3">
            <Button
              onClick={handleAccept}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 text-sm"
            >
              Aceitar e Continuar
            </Button>
            <button onClick={handleDecline} className="text-xs text-gray-500 hover:text-gray-700 underline text-center">
              Recusar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
