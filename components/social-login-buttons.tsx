"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface SocialLoginButtonsProps {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  redirectUri?: string
}

export default function SocialLoginButtons({ onSuccess, onError, redirectUri = '/' }: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setLoading('google')
    try {
      // Redirecionar para o fluxo OAuth do Google
      const authUrl = `/api/auth/social/google?redirect_uri=${encodeURIComponent(redirectUri)}`
      window.location.href = authUrl
    } catch (error) {
      setLoading(null)
      onError?.('Erro ao iniciar login com Google')
    }
  }

  const handleFacebookLogin = async () => {
    setLoading('facebook')
    try {
      // Redirecionar para o fluxo OAuth do Facebook
      const authUrl = `/api/auth/social/facebook?redirect_uri=${encodeURIComponent(redirectUri)}`
      window.location.href = authUrl
    } catch (error) {
      setLoading(null)
      onError?.('Erro ao iniciar login com Facebook')
    }
  }

  const handleAppleLogin = async () => {
    setLoading('apple')
    try {
      // Redirecionar para o fluxo OAuth do Apple
      const authUrl = `/api/auth/social/apple?redirect_uri=${encodeURIComponent(redirectUri)}`
      window.location.href = authUrl
    } catch (error) {
      setLoading(null)
      onError?.('Erro ao iniciar login com Apple')
    }
  }

  const handleWhatsAppLogin = async () => {
    setLoading('whatsapp')
    try {
      // Solicitar número de telefone
      const phone = prompt('Digite seu número de telefone (com código do país):')
      if (!phone) {
        setLoading(null)
        return
      }

      // Iniciar processo de verificação
      const response = await fetch(`/api/auth/social/whatsapp?phone=${encodeURIComponent(phone)}&redirect_uri=${encodeURIComponent(redirectUri)}`)
      const result = await response.json()

      if (result.success) {
        // Solicitar código de verificação
        const code = prompt('Digite o código de 6 dígitos enviado via WhatsApp:')
        if (!code) {
          setLoading(null)
          return
        }

        // Verificar código
        const verifyResponse = await fetch('/api/auth/social/whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: result.sessionId,
            code,
            phone
          }),
        })

        const verifyResult = await verifyResponse.json()

        if (verifyResult.success) {
          onSuccess?.(verifyResult.user)
        } else {
          onError?.(verifyResult.error || 'Erro na verificação do código')
        }
      } else {
        onError?.(result.error || 'Erro ao enviar código via WhatsApp')
      }
    } catch (error) {
      onError?.('Erro ao iniciar login com WhatsApp')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Ou continue com</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2"
        >
          {loading === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Google
        </Button>

        <Button
          variant="outline"
          onClick={handleFacebookLogin}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2"
        >
          {loading === 'facebook' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          Facebook
        </Button>

        <Button
          variant="outline"
          onClick={handleAppleLogin}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2"
        >
          {loading === 'apple' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          )}
          Apple
        </Button>

        <Button
          variant="outline"
          onClick={handleWhatsAppLogin}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2"
        >
          {loading === 'whatsapp' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          )}
          WhatsApp
        </Button>
      </div>
    </div>
  )
} 