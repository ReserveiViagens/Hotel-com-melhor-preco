# 🎨 Guia de Personalização do Frontend - Reservei Viagens

## 📋 Índice

1. [Estrutura de Arquivos](#estrutura-de-arquivos)
2. [Sistema de Cores](#sistema-de-cores)
3. [Tipografia](#tipografia)
4. [Componentes Principais](#componentes-principais)
5. [Layout e Responsividade](#layout-e-responsividade)
6. [Customização de Componentes](#customização-de-componentes)
7. [Animações e Efeitos](#animações-e-efeitos)
8. [Temas (Dark/Light)](#temas-darklight)

---

## 📁 Estrutura de Arquivos

### Arquivos de Estilo Principais

```
├── app/
│   ├── globals.css          # Estilos globais + variáveis CSS
│   └── layout.tsx           # Layout principal
│
├── components/
│   ├── ui/                  # Componentes base (shadcn/ui)
│   │   ├── button.tsx       # Botões customizáveis
│   │   ├── card.tsx         # Cards e containers
│   │   ├── input.tsx        # Campos de entrada
│   │   └── ...              # Outros componentes
│   │
│   ├── chat-agent.tsx       # Chat principal
│   ├── lgpd-popup.tsx       # Pop-up LGPD
│   └── reviews-section.tsx  # Seção de avaliações
│
├── tailwind.config.ts       # Configuração do Tailwind
└── components.json          # Configuração do shadcn/ui
```

---

## 🎨 Sistema de Cores

### Cores Principais (CSS Variables)

As cores são definidas em `app/globals.css` usando CSS Variables:

```css
:root {
  /* Cores Base */
  --background: 0 0% 100%;           /* Branco */
  --foreground: 222.2 84% 4.9%;      /* Preto/Texto */
  
  /* Cores do Brand */
  --primary: 221.2 83.2% 53.3%;      /* Azul Principal */
  --primary-foreground: 210 40% 98%; /* Texto sobre azul */
  
  /* Cores Secundárias */
  --secondary: 210 40% 96%;          /* Cinza claro */
  --accent: 210 40% 96%;             /* Cor de destaque */
  
  /* Cores de Estado */
  --destructive: 0 84.2% 60.2%;      /* Vermelho (erro) */
  --muted: 210 40% 96%;              /* Cinza suave */
  
  /* UI Elements */
  --border: 214.3 31.8% 91.4%;       /* Bordas */
  --input: 214.3 31.8% 91.4%;        /* Campos de input */
  --ring: 221.2 83.2% 53.3%;         /* Focus ring */
}
```

### Como Alterar Cores

#### 1. Cores do Brand Principal

```css
/* Em app/globals.css */
:root {
  /* ANTES (azul) */
  --primary: 221.2 83.2% 53.3%;
  
  /* DEPOIS (verde) - exemplo */
  --primary: 142 76% 36%;
  
  /* DEPOIS (laranja) - exemplo */
  --primary: 25 95% 53%;
  
  /* DEPOIS (roxo) - exemplo */
  --primary: 262 83% 58%;
}
```

#### 2. Cores Personalizadas no Tailwind

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Cores específicas da Reservei Viagens
        'reservei': {
          50: '#eff6ff',
          100: '#dbeafe', 
          500: '#3b82f6',  // Azul principal
          600: '#2563eb',
          900: '#1e3a8a',
        },
        'caldas': {
          50: '#fef7ee',
          500: '#f97316',  // Laranja das águas termais
          600: '#ea580c',
        }
      }
    }
  }
}
```

#### 3. Usando as Cores Personalizadas

```tsx
// Em qualquer componente
<div className="bg-reservei-500 text-white">
  <h1 className="text-caldas-500">Título</h1>
</div>
```

---

## ✍️ Tipografia

### Fontes Configuradas

```typescript
// app/layout.tsx
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

// Para adicionar nova fonte:
import { Roboto, Poppins } from "next/font/google"

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"] 
})
```

### Hierarchy de Texto

```css
/* Classes do Tailwind para tipografia */
.text-xs     /* 12px */
.text-sm     /* 14px */
.text-base   /* 16px */
.text-lg     /* 18px */
.text-xl     /* 20px */
.text-2xl    /* 24px */
.text-3xl    /* 30px */
.text-4xl    /* 36px */

/* Pesos */
.font-light    /* 300 */
.font-normal   /* 400 */
.font-medium   /* 500 */
.font-semibold /* 600 */
.font-bold     /* 700 */
```

### Customizar Tipografia

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        'reservei': ['Inter', 'sans-serif'],
        'heading': ['Poppins', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',    // 10px
        '5xl': '3rem',        // 48px
        '6xl': '3.75rem',     // 60px
      }
    }
  }
}
```

---

## 🧩 Componentes Principais

### 1. Header (Cabeçalho)

**Localização**: `app/page.tsx` (linhas 80-130)

```tsx
// Personalizar cores do header
<header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
  {/* Para mudar para verde: */}
  {/* from-green-600 to-green-800 */}
  
  {/* Para gradiente personalizado: */}
  {/* from-reservei-500 to-reservei-700 */}
</header>
```

### 2. Cartões de Categoria

```tsx
// Categorias de navegação (linhas 110-125)
{[
  { icon: "🏨", label: "Hotéis", href: "/hoteis" },
  { icon: "🎟️", label: "Ingressos", href: "/ingressos" },
  // Adicionar nova categoria:
  { icon: "🚗", label: "Transfer", href: "/transfer" },
].map((category, index) => (
  <Link key={index} href={category.href}>
    <button className="flex flex-col items-center p-3 rounded-2xl bg-white/20">
      {/* Personalizar cores: bg-reservei-500/20 */}
    </button>
  </Link>
))}
```

### 3. Cartão de Promoção Principal

```tsx
// Card promocional (linhas 140-170)
<Card className="bg-gradient-to-br from-yellow-400 to-orange-400">
  {/* Mudar cores promocionais: */}
  {/* from-red-400 to-pink-400 */}
  {/* from-reservei-400 to-caldas-400 */}
  
  <Badge className="bg-red-500 text-white animate-pulse">
    🔥 PROMOFÉRIAS CALDAS NOVAS!
  </Badge>
</Card>
```

### 4. Seção de Confiança

```tsx
// Trust badges (linhas 175-190)
const trustBadges = [
  { icon: CheckCircle, title: "Garantia de", subtitle: "Melhor Preço" },
  { icon: Shield, title: "Pagamento", subtitle: "100% Seguro" },
  { icon: Award, title: "+5000 Clientes", subtitle: "Satisfeitos" },
  // Adicionar novo badge:
  { icon: Star, title: "Avaliação", subtitle: "5.0 Estrelas" },
]
```

---

## 📱 Layout e Responsividade

### Breakpoints do Tailwind

```css
/* Mobile First - padrão sem prefixo */
.text-sm      /* Aplica em todas as telas */

/* Tablets e acima */
.sm:text-base /* >= 640px */

/* Desktop pequeno */
.md:text-lg   /* >= 768px */

/* Desktop médio */
.lg:text-xl   /* >= 1024px */

/* Desktop grande */
.xl:text-2xl  /* >= 1280px */

/* Desktop extra grande */
.2xl:text-3xl /* >= 1536px */
```

### Container Principal

```tsx
// Layout mobile-first (max-width: 448px)
<div className="max-w-md mx-auto bg-gray-50 min-h-screen">
  {/* Para layout desktop também: */}
  {/* max-w-md lg:max-w-4xl */}
  
  {/* Para full-width em desktop: */}
  {/* max-w-md lg:max-w-full */}
</div>
```

### Grid System

```tsx
// Grid responsivo
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* 2 colunas mobile, 3 tablet, 4 desktop */}
</div>

// Grid para categorias
<div className="grid grid-cols-4 gap-3">
  {/* 4 colunas fixas em mobile */}
</div>
```

---

## 🔧 Customização de Componentes

### 1. Customizar Botões

**Arquivo**: `components/ui/button.tsx`

```tsx
// Adicionar nova variante de botão
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        // Adicionar variante personalizada:
        reservei: "bg-reservei-500 text-white hover:bg-reservei-600",
        caldas: "bg-caldas-500 text-white hover:bg-caldas-600",
      }
    }
  }
)

// Usar no componente:
<Button variant="reservei">Reservar Agora</Button>
```

### 2. Customizar Cards

```tsx
// Card com gradiente personalizado
<Card className="bg-gradient-to-br from-reservei-50 to-caldas-50 border-reservei-200">
  <CardContent className="p-6">
    {/* Conteúdo */}
  </CardContent>
</Card>
```

### 3. Customizar Inputs

```tsx
// Input com estilo da marca
<Input 
  className="border-reservei-300 focus:border-reservei-500 focus:ring-reservei-500"
  placeholder="Digite sua mensagem..."
/>
```

---

## 🎭 Animações e Efeitos

### Animações CSS Personalizadas

```css
/* Em app/globals.css */

/* Animação de slide para chat */
@keyframes slideInFromBottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Animação de bounce personalizada */
@keyframes bounceCustom {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -15px, 0);
  }
  70% {
    transform: translate3d(0, -7px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

.chat-slide-in {
  animation: slideInFromBottom 0.3s ease-out;
}

.bounce-custom {
  animation: bounceCustom 1s ease-in-out;
}
```

### Animações com Tailwind

```tsx
// Efeitos de hover e transição
<button className="
  transform transition-all duration-200 
  hover:scale-105 hover:shadow-xl
  active:scale-95
">
  Botão Animado
</button>

// Animações de entrada
<div className="animate-fade-in animate-slide-up">
  Conteúdo que aparece
</div>

// Pulse para elementos importantes
<Badge className="animate-pulse bg-red-500">
  OFERTA LIMITADA!
</Badge>
```

---

## 🌓 Temas (Dark/Light)

### Configurar Tema Escuro

```css
/* app/globals.css */
.dark {
  --background: 222.2 84% 4.9%;     /* Fundo escuro */
  --foreground: 210 40% 98%;        /* Texto claro */
  --primary: 217.2 91.2% 59.8%;     /* Azul mais claro */
  --card: 222.2 84% 4.9%;           /* Cards escuros */
}
```

### Toggle de Tema

```tsx
// Componente de toggle (criar em components/theme-toggle.tsx)
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md border"
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  )
}
```

### Adicionar ao Layout

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## 🎯 Personalizações Específicas da Marca

### 1. Logo e Branding

```tsx
// Substituir logo principal
<Image
  src="/logo-reservei-personalizado.png"  // Sua logo personalizada
  alt="Sua Marca"
  width={40}
  height={40}
  className="rounded-full"
/>
```

### 2. Cores da Marca Caldas Novas

```css
/* Paleta inspirada nas águas termais */
:root {
  --caldas-blue: 205 89% 45%;    /* Azul das águas */
  --caldas-green: 142 76% 36%;   /* Verde da natureza */
  --caldas-orange: 25 95% 53%;   /* Laranja do pôr do sol */
  --caldas-thermal: 195 100% 85%; /* Azul termal claro */
}
```

### 3. Ícones Personalizados

```tsx
// Usar ícones específicos do turismo
import { 
  Waves,           // Águas termais
  Mountain,        // Paisagens
  Palmtree,        // Natureza
  Camera,          // Turismo
  MapPin,          // Localização
  Calendar,        // Agendamento
} from "lucide-react"

// Categorias com ícones personalizados
{[
  { icon: <Waves className="w-6 h-6" />, label: "Águas Termais" },
  { icon: <Mountain className="w-6 h-6" />, label: "Ecoturismo" },
  { icon: <Camera className="w-6 h-6" />, label: "Passeios" },
]}
```

---

## 📝 Lista de Verificação de Personalização

### ✅ Checklist de Branding

- [ ] **Logo**: Substituir logo padrão pela marca
- [ ] **Cores**: Definir paleta de cores da marca
- [ ] **Tipografia**: Escolher fontes adequadas ao brand
- [ ] **Ícones**: Usar ícones consistentes com o segmento
- [ ] **Imagens**: Adicionar fotos de qualidade dos destinos
- [ ] **Textos**: Personalizar todos os textos para a marca
- [ ] **Contatos**: Atualizar todos os contatos e redes sociais
- [ ] **SEO**: Ajustar meta tags e descriptions

### ✅ Checklist de UX

- [ ] **Responsividade**: Testar em todos os dispositivos
- [ ] **Performance**: Verificar velocidade de carregamento
- [ ] **Acessibilidade**: Contraste de cores adequado
- [ ] **Navegação**: Fluxo intuitivo e claro
- [ ] **Call-to-Actions**: Botões destacados e claros
- [ ] **Formulários**: Fáceis de preencher
- [ ] **Feedback**: Mensagens claras para o usuário

---

## 🔗 Recursos Úteis

### Ferramentas de Design

- **Cores**: [Coolors.co](https://coolors.co) - Gerador de paletas
- **Gradientes**: [WebGradients.com](https://webgradients.com)
- **Ícones**: [Lucide.dev](https://lucide.dev) - Biblioteca atual
- **Fontes**: [Google Fonts](https://fonts.google.com)
- **Inspiração**: [Dribbble](https://dribbble.com/tags/travel)

### Documentação Técnica

- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Última Atualização**: 2025-01-20  
**Próxima Documentação**: [Gerenciamento de Assets](./ASSETS-E-MIDIAS.md) 