# 📝 Templates e Exemplos de Código - Reservei Viagens

## 📋 Índice

1. [Templates de Componentes](#templates-de-componentes)
2. [Exemplos de Personalização](#exemplos-de-personalização)
3. [Configurações Prontas](#configurações-prontas)
4. [Workflows N8N](#workflows-n8n)
5. [Scripts Úteis](#scripts-úteis)

---

## 🧩 Templates de Componentes

### 1. Template de Card de Hotel

```tsx
// components/hotel-card.tsx
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Wifi, Car, Coffee } from "lucide-react"

interface HotelCardProps {
  id: string
  name: string
  image: string
  price: string
  originalPrice?: string
  discount?: string
  rating: number
  features: string[]
  description: string
  onReserve?: (hotelId: string) => void
}

export function HotelCard({
  id,
  name,
  image,
  price,
  originalPrice,
  discount,
  rating,
  features,
  description,
  onReserve
}: HotelCardProps) {
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
      />
    ))
  }

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      "Wi-Fi": <Wifi className="w-4 h-4" />,
      "Estacionamento": <Car className="w-4 h-4" />,
      "Café da Manhã": <Coffee className="w-4 h-4" />,
    }
    return icons[feature] || null
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="relative">
        <Image
          src={image}
          alt={`${name} - Hotel em Caldas Novas`}
          width={1200}
          height={800}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        
        {discount && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white animate-pulse">
            {discount} OFF
          </Badge>
        )}
        
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
          {renderStars(rating)}
          <span className="text-xs font-medium ml-1">{rating}.0</span>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800">{name}</h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {features.slice(0, 3).map((feature) => (
            <div key={feature} className="flex items-center gap-1 text-xs text-gray-500">
              {getFeatureIcon(feature)}
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {originalPrice}
              </span>
            )}
            <span className="text-xl font-bold text-blue-600">{price}</span>
            <span className="text-xs text-gray-500">por pessoa</span>
          </div>
          
          <Button 
            onClick={() => onReserve?.(id)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 2. Template de Seção de Promoções

```tsx
// components/promotions-section.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Calendar } from "lucide-react"

interface Promotion {
  id: string
  title: string
  description: string
  originalPrice: string
  promotionalPrice: string
  discount: string
  validUntil: string
  maxPeople: number
  image: string
  highlights: string[]
}

interface PromotionsSectionProps {
  promotions: Promotion[]
  onSelectPromotion?: (promotionId: string) => void
}

export function PromotionsSection({ promotions, onSelectPromotion }: PromotionsSectionProps) {
  return (
    <section className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🔥 Promoções Imperdíveis
        </h2>
        <p className="text-gray-600">
          Ofertas especiais para sua viagem dos sonhos em Caldas Novas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <Card key={promo.id} className="overflow-hidden relative">
            {/* Badge de Desconto */}
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-red-500 text-white text-lg px-3 py-1 animate-pulse">
                {promo.discount} OFF
              </Badge>
            </div>

            {/* Imagem de Background */}
            <div 
              className="h-48 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${promo.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              
              {/* Título sobre a imagem */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Até {promo.maxPeople} pessoas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Válido até {promo.validUntil}</span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">{promo.description}</p>
              
              {/* Highlights */}
              <div className="mb-4">
                <ul className="space-y-1">
                  {promo.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preços */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-400 line-through block">
                    De: {promo.originalPrice}
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    Por: {promo.promotionalPrice}
                  </span>
                  <span className="text-xs text-gray-500 block">por pessoa</span>
                </div>
              </div>

              {/* Botão de Ação */}
              <Button 
                onClick={() => onSelectPromotion?.(promo.id)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
                size="lg"
              >
                Quero Esta Oferta! 🔥
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
```

### 3. Template de Chat Message

```tsx
// components/chat-message.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, Bot } from "lucide-react"

interface ChatMessageProps {
  id: string
  text: string
  sender: "user" | "agent" | "bot"
  timestamp: Date
  type?: "text" | "quick_reply" | "whatsapp_transfer" | "booking_form"
  metadata?: any
  onQuickReply?: (reply: string) => void
  onWhatsAppTransfer?: () => void
}

export function ChatMessage({
  text,
  sender,
  timestamp,
  type,
  metadata,
  onQuickReply,
  onWhatsAppTransfer
}: ChatMessageProps) {
  const isUser = sender === "user"
  const isBot = sender === "bot"
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-4`}>
      {/* Avatar */}
      {!isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className={`text-xs font-bold ${
            isBot ? "bg-purple-500 text-white" : "bg-blue-500 text-white"
          }`}>
            {isBot ? <Bot className="w-4 h-4" /> : "S"}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : ""}`}>
        {/* Nome e horário */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-xs font-medium text-gray-600">
            {isUser ? "Você" : isBot ? "Serena (IA)" : "Serena"}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {formatTime(timestamp)}
          </div>
          {isBot && (
            <Badge variant="outline" className="text-xs">IA</Badge>
          )}
        </div>

        {/* Mensagem */}
        <div className={`
          rounded-lg px-4 py-3 max-w-full
          ${isUser 
            ? "bg-blue-600 text-white" 
            : "bg-gray-100 text-gray-800 border"
          }
        `}>
          <p className="text-sm whitespace-pre-wrap">{text}</p>
        </div>

        {/* Quick Replies */}
        {type === "quick_reply" && metadata?.quickReplies && (
          <div className="flex flex-wrap gap-2 mt-2">
            {metadata.quickReplies.map((reply: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onQuickReply?.(reply)}
                className="text-xs"
              >
                {reply}
              </Button>
            ))}
          </div>
        )}

        {/* WhatsApp Transfer */}
        {type === "whatsapp_transfer" && (
          <Button
            onClick={onWhatsAppTransfer}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            📱 Continuar no WhatsApp
          </Button>
        )}
      </div>
    </div>
  )
}
```

---

## 🎨 Exemplos de Personalização

### 1. Paleta de Cores Personalizada

```css
/* app/globals.css - Tema Águas Termais */
:root {
  /* Cores Base */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  /* Paleta Caldas Novas */
  --primary: 195 100% 45%;        /* Azul termal */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 142 76% 36%;       /* Verde natureza */
  --secondary-foreground: 0 0% 100%;
  
  --accent: 25 95% 53%;           /* Laranja pôr do sol */
  --accent-foreground: 0 0% 100%;
  
  /* Cores de apoio */
  --thermal-blue: 195 100% 85%;   /* Azul claro termal */
  --nature-green: 142 76% 85%;    /* Verde claro */
  --sunset-orange: 25 95% 85%;    /* Laranja claro */
  
  /* Estados */
  --success: 142 76% 36%;         /* Verde sucesso */
  --warning: 45 93% 58%;          /* Amarelo aviso */
  --error: 0 84% 60%;             /* Vermelho erro */
}

/* Classes utilitárias customizadas */
.bg-thermal { background-color: hsl(var(--thermal-blue)); }
.bg-nature { background-color: hsl(var(--nature-green)); }
.bg-sunset { background-color: hsl(var(--sunset-orange)); }

.text-thermal { color: hsl(var(--primary)); }
.text-nature { color: hsl(var(--secondary)); }
.text-sunset { color: hsl(var(--accent)); }
```

### 2. Configuração de Fontes Personalizadas

```typescript
// app/layout.tsx
import { Inter, Poppins, Roboto } from "next/font/google"

// Fonte principal
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

// Fonte para títulos
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap"
})

// Fonte para dados/números
const roboto = Roboto({
  weight: ['300', '400', '500'],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap"
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}>
      <body className="font-inter">
        {children}
      </body>
    </html>
  )
}
```

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-poppins)', 'sans-serif'],
        mono: ['var(--font-roboto)', 'monospace'],
      }
    }
  }
}
```

### 3. Componente de Seção Hero Personalizada

```tsx
// components/hero-section.tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface HeroSectionProps {
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaAction: () => void
  backgroundImage: string
  videoUrl?: string
  promotionalBadge?: string
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaAction,
  backgroundImage,
  videoUrl,
  promotionalBadge
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {videoUrl ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={backgroundImage}
          alt="Caldas Novas - Águas Termais"
          fill
          className="object-cover -z-10"
          priority
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 -z-5" />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl">
        {promotionalBadge && (
          <Badge className="mb-4 bg-red-500 text-white text-lg px-4 py-2 animate-pulse">
            🔥 {promotionalBadge}
          </Badge>
        )}
        
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 leading-tight">
          {title}
        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium mb-6 text-yellow-300">
          {subtitle}
        </h2>
        
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        
        <Button
          onClick={ctaAction}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          {ctaText}
        </Button>
      </div>
    </section>
  )
}
```

---

## ⚙️ Configurações Prontas

### 1. Configuração VS Code Completa

```json
// .vscode/settings.json
{
  // TypeScript
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true,
  
  // Editor
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  
  // Tailwind CSS
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "editor.quickSuggestions": {
    "strings": true
  },
  
  // Emmet
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  
  // File Nesting
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "*.tsx": "${capture}.module.css",
    "*.ts": "${capture}.test.ts, ${capture}.spec.ts"
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "streetsidesoftware.code-spell-checker",
    "usernamehw.errorlens"
  ]
}
```

### 2. Configuração ESLint e Prettier

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": false,
  "tabWidth": 2,
  "printWidth": 100
}
```

### 3. Configuração Tailwind Avançada

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Cores da marca Reservei Viagens
        reservei: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Cor principal
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        caldas: {
          50: "#fef7ee",
          100: "#fdecd3",
          200: "#fbd5a5",
          300: "#f8b66d",
          400: "#f59332",
          500: "#f97316", // Laranja termal
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-poppins)", "sans-serif"],
        mono: ["var(--font-roboto)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

---

## 🔄 Workflows N8N

### 1. Workflow Básico de Chat

```json
{
  "name": "Reservei Chat Basic",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "path": "reservei-chat",
        "responseMode": "respondToWebhook"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [260, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.messageType}}",
              "operation": "equal",
              "value2": "booking_data"
            }
          ]
        }
      },
      "name": "Is Booking?",
      "type": "n8n-nodes-base.if",
      "position": [480, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": {
          "reply": "Obrigada! Em breve um consultor entrará em contato.",
          "isHuman": false,
          "type": "text"
        }
      },
      "name": "Response Normal",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [700, 200]
    },
    {
      "parameters": {
        "respondWith": "json", 
        "responseBody": {
          "reply": "✅ Agendamento criado! Nossa equipe entrará em contato.",
          "isHuman": false,
          "type": "calendar_confirmation"
        }
      },
      "name": "Response Booking",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [700, 400]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Is Booking?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Is Booking?": {
      "main": [
        [
          {
            "node": "Response Booking",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Response Normal",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### 2. Workflow com Google Calendar

```json
{
  "name": "Reservei Calendar Integration",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "path": "reservei-calendar",
        "responseMode": "respondToWebhook"
      },
      "name": "Webhook Calendar",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "calendar": "primary",
        "summary": "Reserva {{$json.userInfo.name}} - {{$json.bookingData.totalDays}} dias",
        "description": "Nova reserva via Chat Serena\n\nCliente: {{$json.userInfo.name}}\nEmail: {{$json.userInfo.email}}\nTelefone: {{$json.userInfo.phone}}\n\nCheck-in: {{$json.bookingData.checkIn}}\nCheck-out: {{$json.bookingData.checkOut}}\nAdultos: {{$json.bookingData.adults}}\nCrianças: {{$json.bookingData.children}}\nBebês: {{$json.bookingData.babies}}",
        "start": "{{$json.bookingData.checkIn}}T14:00:00",
        "end": "{{$json.bookingData.checkOut}}T12:00:00"
      },
      "name": "Create Event",
      "type": "n8n-nodes-base.googleCalendar",
      "position": [460, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": {
          "reply": "✅ Evento criado no Google Calendar! ID: {{$node['Create Event'].json.id}}",
          "isHuman": false,
          "type": "calendar_confirmation",
          "metadata": {
            "eventId": "={{$node['Create Event'].json.id}}",
            "eventUrl": "={{$node['Create Event'].json.htmlLink}}"
          }
        }
      },
      "name": "Response Success",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [680, 300]
    }
  ],
  "connections": {
    "Webhook Calendar": {
      "main": [
        [
          {
            "node": "Create Event",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Event": {
      "main": [
        [
          {
            "node": "Response Success",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 📜 Scripts Úteis

### 1. Script de Build e Deploy

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Iniciando deploy da Reservei Viagens..."

# Verificar se está na branch main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Por favor, faça deploy apenas da branch main"
  exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Executar linter
echo "🔍 Verificando código..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linter encontrou problemas. Corrija antes de continuar."
  exit 1
fi

# Build de produção
echo "🏗️ Gerando build de produção..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build falhou!"
  exit 1
fi

# Deploy para Vercel
echo "☁️ Fazendo deploy para Vercel..."
vercel --prod

echo "✅ Deploy concluído com sucesso!"
```

### 2. Script de Otimização de Imagens

```bash
#!/bin/bash
# scripts/optimize-images.sh

echo "🖼️ Otimizando imagens da Reservei Viagens..."

# Verificar se imageoptim está instalado
if ! command -v jpegoptim &> /dev/null; then
    echo "❌ jpegoptim não encontrado. Instale com: apt-get install jpegoptim"
    exit 1
fi

if ! command -v pngquant &> /dev/null; then
    echo "❌ pngquant não encontrado. Instale com: apt-get install pngquant"
    exit 1
fi

# Backup das imagens originais
echo "💾 Criando backup..."
mkdir -p backups/images
cp -r public/images/ backups/images/

# Otimizar JPGs
echo "🔧 Otimizando arquivos JPG..."
find public/images -name "*.jpg" -exec jpegoptim --max=85 --strip-all {} \;
find public/images -name "*.jpeg" -exec jpegoptim --max=85 --strip-all {} \;

# Otimizar PNGs
echo "🔧 Otimizando arquivos PNG..."
find public/images -name "*.png" -exec pngquant --quality=65-85 --ext .png --force {} \;

echo "✅ Otimização concluída!"
echo "📊 Estatísticas:"
echo "Original: $(du -sh backups/images/ | cut -f1)"
echo "Otimizado: $(du -sh public/images/ | cut -f1)"
```

### 3. Script de Desenvolvimento Local

```bash
#!/bin/bash
# scripts/dev-setup.sh

echo "🛠️ Configurando ambiente de desenvolvimento..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js versão $REQUIRED_VERSION+ necessária. Atual: $NODE_VERSION"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar .env.local
if [ ! -f ".env.local" ]; then
    echo "⚙️ Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "📝 Configure as variáveis em .env.local"
fi

# Executar projeto
echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev
```

### 4. Script de Teste Completo

```bash
#!/bin/bash
# scripts/test-all.sh

echo "🧪 Executando testes completos..."

# Lint
echo "1️⃣ Verificando linting..."
npm run lint
LINT_EXIT=$?

# Build
echo "2️⃣ Testando build..."
npm run build
BUILD_EXIT=$?

# Teste de chat (curl)
echo "3️⃣ Testando API do chat..."
if [ -f ".env.local" ]; then
    source .env.local
fi

curl -X POST http://localhost:3000/api/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_123",
    "message": "Olá, teste automático",
    "messageType": "text",
    "userInfo": {
      "name": "Teste Automatico",
      "email": "teste@exemplo.com"
    }
  }' \
  --silent --output /dev/null --write-out "%{http_code}"

API_EXIT=$?

# Relatório
echo ""
echo "📊 RELATÓRIO DE TESTES:"
echo "========================"
echo "Lint: $([ $LINT_EXIT -eq 0 ] && echo "✅ Passou" || echo "❌ Falhou")"
echo "Build: $([ $BUILD_EXIT -eq 0 ] && echo "✅ Passou" || echo "❌ Falhou")"
echo "API: $([ $API_EXIT -eq 0 ] && echo "✅ Passou" || echo "❌ Falhou")"

if [ $LINT_EXIT -eq 0 ] && [ $BUILD_EXIT -eq 0 ] && [ $API_EXIT -eq 0 ]; then
    echo ""
    echo "🎉 Todos os testes passaram!"
    exit 0
else
    echo ""
    echo "💥 Alguns testes falharam!"
    exit 1
fi
```

---

## 📋 Checklist de Implementação

### ✅ Para usar estes templates:

1. **Copie o código** do template desejado
2. **Adapte as props/interfaces** para suas necessidades
3. **Configure as cores** no seu `globals.css`
4. **Teste a responsividade** em diferentes telas
5. **Ajuste animações** conforme sua preferência
6. **Valide acessibilidade** com alt texts adequados

### ✅ Para workflows N8N:

1. **Importe o JSON** no seu N8N
2. **Configure credenciais** necessárias
3. **Teste o webhook** manualmente
4. **Ajuste respostas** para sua marca
5. **Monitore execuções** regulemente

### ✅ Para scripts:

1. **Torne executável**: `chmod +x scripts/nome-script.sh`
2. **Teste em ambiente local** antes de usar em produção
3. **Adapte paths** para sua estrutura de arquivos
4. **Configure variáveis** de ambiente necessárias

---

**Última Atualização**: 2025-01-20  
**Compatibilidade**: Next.js 15, N8N 1.0+, Node.js 18+ 