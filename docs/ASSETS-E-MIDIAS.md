# 🖼️ Gerenciamento de Assets e Mídias - Reservei Viagens

## 📋 Índice

1. [Estrutura de Assets](#estrutura-de-assets)
2. [Especificações de Imagens](#especificações-de-imagens)
3. [Especificações de Vídeos](#especificações-de-vídeos)
4. [Como Adicionar Assets](#como-adicionar-assets)
5. [Como Remover Assets](#como-remover-assets)
6. [Otimização de Performance](#otimização-de-performance)
7. [Boas Práticas](#boas-práticas)

---

## 📁 Estrutura de Assets

### Organização de Arquivos

```
public/
├── images/                          # Imagens estáticas
│   ├── hotels/                      # Fotos de hotéis
│   │   ├── spazzio-diroma.jpg      # 1200x800px
│   │   ├── piazza-diroma.jpg       # 1200x800px
│   │   └── lacqua-diroma.jpg       # 1200x800px
│   │
│   ├── parks/                       # Fotos de parques
│   │   ├── hot-park.jpg            # 1200x800px
│   │   ├── diroma-acqua-park.jpg   # 1200x800px
│   │   └── water-park.jpg          # 1200x800px
│   │
│   ├── attractions/                 # Atrações turísticas
│   │   ├── jardim-japones.jpg      # 1200x800px
│   │   ├── lago-corumba.jpg        # 1200x800px
│   │   └── monumento-aguas.jpg     # 1200x800px
│   │
│   ├── promotions/                  # Banners promocionais
│   │   ├── promoferias.jpg         # 1200x600px
│   │   ├── melhor-idade.jpg        # 1200x600px
│   │   └── familia-completa.jpg    # 1200x600px
│   │
│   └── ui/                         # Elementos de interface
│       ├── logo-reservei.png       # 200x200px
│       ├── favicon.ico             # 32x32px
│       └── placeholder.jpg         # 400x300px
│
├── videos/                         # Vídeos promocionais
│   ├── hero-caldas-novas.mp4      # 1280x720px (16:9)
│   ├── hotel-showcase.mp4         # 1280x720px (16:9)
│   └── parks-preview.mp4          # 1280x720px (16:9)
│
└── icons/                          # Ícones e favicons
    ├── favicon.ico                 # 32x32px
    ├── apple-touch-icon.png        # 180x180px
    └── android-chrome-192x192.png  # 192x192px
```

---

## 🖼️ Especificações de Imagens

### 1. **Logo e Branding**

#### Logo Principal
- **Formato**: PNG (com transparência) ou SVG
- **Dimensões**: 200x200px (1:1)
- **Tamanho máximo**: 50KB
- **Uso**: Header, footer, favicons

```tsx
// Como usar:
<Image
  src="/images/ui/logo-reservei.png"
  alt="Reservei Viagens"
  width={40}
  height={40}
  className="rounded-full"
/>
```

#### Favicon
- **Formato**: ICO, PNG
- **Dimensões**: 32x32px, 16x16px
- **Localização**: `public/favicon.ico`

### 2. **Fotos de Hotéis**

#### Especificações Técnicas
- **Formato**: JPG (melhor compressão) ou WebP
- **Dimensões**: 1200x800px (3:2 ratio)
- **Qualidade**: 85% JPG ou WebP
- **Tamanho máximo**: 300KB por imagem
- **Naming**: `nome-hotel-slug.jpg`

#### Requisitos de Conteúdo
- ✅ Boa iluminação (natural preferível)
- ✅ Alta resolução original (mínimo 2400x1600px)
- ✅ Foco na arquitetura e piscinas termais
- ✅ Sem pessoas identificáveis (LGPD)
- ✅ Cores vibrantes e saturadas

```tsx
// Exemplo de uso:
<Image
  src="/images/hotels/spazzio-diroma.jpg"
  alt="Spazzio DiRoma Hotel - Piscinas Termais"
  width={1200}
  height={800}
  className="rounded-lg object-cover"
  priority // Para imagens acima da dobra
/>
```

### 3. **Fotos de Parques Aquáticos**

#### Especificações
- **Formato**: JPG ou WebP
- **Dimensões**: 1200x800px (3:2)
- **Qualidade**: 85%
- **Tamanho**: Máximo 350KB
- **Foco**: Toboáguas, piscinas, diversão

#### Exemplo de Implementação
```tsx
const parques = [
  {
    nome: "Hot Park",
    imagem: "/images/parks/hot-park.jpg",
    alt: "Hot Park - Toboáguas e Piscinas Termais"
  },
  {
    nome: "DiRoma Acqua Park", 
    imagem: "/images/parks/diroma-acqua-park.jpg",
    alt: "DiRoma Acqua Park - Diversão Aquática"
  }
]

// Renderização:
{parques.map((parque) => (
  <Image
    key={parque.nome}
    src={parque.imagem}
    alt={parque.alt}
    width={1200}
    height={800}
    className="rounded-lg"
  />
))}
```

### 4. **Banners Promocionais**

#### Especificações
- **Formato**: JPG ou PNG (se precisar transparência)
- **Dimensões**: 1200x600px (2:1 ratio)
- **Qualidade**: 90% (para texto legível)
- **Tamanho**: Máximo 400KB
- **Design**: Texto grande, cores contrastantes

```tsx
// Banner promocional:
<div className="relative">
  <Image
    src="/images/promotions/promoferias.jpg"
    alt="PROMOFÉRIAS - Hotel + Parque 20% OFF"
    width={1200}
    height={600}
    className="w-full h-auto rounded-lg"
  />
  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
    <h2 className="text-white text-2xl font-bold p-6">
      PROMOFÉRIAS CALDAS NOVAS!
    </h2>
  </div>
</div>
```

### 5. **Imagens Responsivas**

#### Sistema de Breakpoints
```tsx
// Imagem que adapta por tamanho de tela:
<Image
  src="/images/hotels/lacqua-diroma.jpg"
  alt="Lacqua DiRoma"
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="w-full h-auto"
/>
```

---

## 🎬 Especificações de Vídeos

### 1. **Vídeo Principal (Hero)**

#### Especificações Técnicas
- **Formato**: MP4 (H.264 codec)
- **Resolução**: 1280x720px (720p HD)
- **Aspect Ratio**: 16:9
- **Frame Rate**: 30fps
- **Duração**: 15-30 segundos máximo
- **Tamanho**: Máximo 5MB
- **Bitrate**: 2-3 Mbps

#### Configurações de Compressão
```bash
# Usando FFmpeg para otimizar:
ffmpeg -i input-video.mov \
  -vf scale=1280:720 \
  -c:v libx264 \
  -crf 23 \
  -preset medium \
  -c:a aac \
  -b:a 128k \
  output-optimized.mp4
```

#### Implementação no Código
```tsx
// Vídeo hero principal:
<div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
  <video
    autoPlay
    muted
    loop
    playsInline
    className="w-full h-full object-cover"
    poster="/images/video-poster.jpg" // Imagem de fallback
  >
    <source src="/videos/hero-caldas-novas.mp4" type="video/mp4" />
    <p>Seu navegador não suporta vídeos HTML5.</p>
  </video>
</div>
```

### 2. **Vídeo via iframe (Externo)**

#### Configuração Atual (app/page.tsx linha 105)
```tsx
<iframe
  src="https://www.reserveiviagens.com.br/wp-content/uploads/2025/05/reservei-viagens.mp4"
  title="Diversão no Parque Aquático em Caldas Novas"
  className="w-full h-full"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

#### Melhor Prática com Lazy Loading
```tsx
<div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
  <iframe
    src={`https://sua-url-video.com/embed/video-id${shouldAutoplay ? "?autoplay=1&mute=1" : ""}`}
    title="Vídeo promocional Caldas Novas"
    className="w-full h-full"
    loading="lazy" // Lazy loading
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>
```

### 3. **Vídeos de Background**

#### Especificações
- **Resolução**: 1920x1080px (Full HD)
- **Duração**: 10-15 segundos em loop
- **Sem áudio**: Sempre mudo
- **Tamanho**: Máximo 10MB
- **Otimização**: Compressão alta

```tsx
// Vídeo de background:
<div className="relative min-h-screen overflow-hidden">
  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover -z-10"
  >
    <source src="/videos/caldas-background.mp4" type="video/mp4" />
  </video>
  
  {/* Conteúdo por cima */}
  <div className="relative z-10 p-8">
    <h1>Conteúdo sobre o vídeo</h1>
  </div>
</div>
```

---

## ➕ Como Adicionar Assets

### 1. **Adicionar Nova Imagem**

#### Passo a Passo:
1. **Preparar a imagem** conforme especificações
2. **Nomear adequadamente**: `nome-descritivo-slug.jpg`
3. **Colocar na pasta correta** em `public/images/`
4. **Adicionar ao código**:

```tsx
// 1. Definir dados da imagem:
const novoHotel = {
  name: "Ilhas do Lago Resort",
  image: "/images/hotels/ilhas-do-lago.jpg",
  alt: "Ilhas do Lago Resort - Vista Panorâmica",
  price: "R$ 380",
  features: ["Vista do Lago", "SPA Premium", "Marina Privativa"]
}

// 2. Adicionar ao array de hotéis:
const hoteis = [
  // ... hotéis existentes
  novoHotel
]

// 3. Renderizar:
<Image
  src={novoHotel.image}
  alt={novoHotel.alt}
  width={1200}
  height={800}
  className="rounded-lg object-cover"
/>
```

### 2. **Adicionar Novo Vídeo**

#### Preparação:
```bash
# 1. Otimizar o vídeo:
ffmpeg -i video-original.mov \
  -vf scale=1280:720 \
  -c:v libx264 \
  -crf 23 \
  -preset medium \
  -c:a aac \
  -b:a 128k \
  public/videos/novo-video.mp4
```

#### Implementação:
```tsx
// 1. Adicionar ao componente:
<div className="w-full aspect-video rounded-lg overflow-hidden">
  <video
    controls
    className="w-full h-full"
    poster="/images/novo-video-poster.jpg"
  >
    <source src="/videos/novo-video.mp4" type="video/mp4" />
  </video>
</div>
```

### 3. **Adicionar Ícones**

#### Para categorias/funcionalidades:
```tsx
// 1. Importar ícone (se for do Lucide):
import { MapPin, Phone, Mail } from "lucide-react"

// 2. Ou usar emoji/imagem:
const novaCategoria = {
  icon: "🏖️", // Emoji
  // OU
  icon: <MapPin className="w-6 h-6" />, // Componente
  // OU  
  icon: "/images/icons/praia.svg", // Arquivo SVG
  label: "Praias",
  href: "/praias"
}
```

---

## ➖ Como Remover Assets

### 1. **Remover Imagem**

#### Checklist de remoção:
```bash
# 1. Procurar todas as referências no código:
grep -r "nome-da-imagem.jpg" ./

# 2. Encontrar usos no código:
# - app/page.tsx
# - components/*.tsx
# - Dados hardcoded em arrays

# 3. Remover referências do código
# 4. Deletar arquivo físico:
rm public/images/categoria/nome-da-imagem.jpg
```

#### Exemplo prático:
```tsx
// ANTES - remover esta referência:
const hoteisAntigos = [
  {
    name: "Hotel Antigo",
    image: "/images/hotels/hotel-antigo.jpg", // ← REMOVER
    alt: "Hotel que não existe mais"
  },
  // ... outros hotéis
]

// DEPOIS - array sem o hotel removido:
const hoteisAtuais = [
  // ... apenas hotéis ativos
]
```

### 2. **Remover Vídeo**

```tsx
// 1. Remover do código:
// ANTES:
<video>
  <source src="/videos/video-antigo.mp4" type="video/mp4" />
</video>

// DEPOIS: (componente removido ou substituído)

// 2. Deletar arquivo:
rm public/videos/video-antigo.mp4
```

### 3. **Limpeza de Assets Órfãos**

#### Script para encontrar arquivos não utilizados:
```bash
#!/bin/bash
# Criar script: scripts/find-unused-assets.sh

echo "Procurando imagens não utilizadas..."

for file in public/images/**/*.{jpg,jpeg,png,gif,webp}; do
  filename=$(basename "$file")
  
  # Procurar referências no código
  if ! grep -r "$filename" app/ components/ --include="*.tsx" --include="*.ts" > /dev/null; then
    echo "⚠️  Arquivo possivelmente não utilizado: $file"
  fi
done
```

---

## 🚀 Otimização de Performance

### 1. **Compressão de Imagens**

#### Ferramentas Recomendadas:
- **Online**: [TinyPNG](https://tinypng.com), [Squoosh](https://squoosh.app)
- **CLI**: ImageOptim, jpegoptim, pngquant
- **Automático**: Next.js Image optimization

#### Script de Otimização:
```bash
#!/bin/bash
# scripts/optimize-images.sh

# Otimizar JPGs
find public/images -name "*.jpg" -exec jpegoptim --max=85 --strip-all {} \;

# Otimizar PNGs  
find public/images -name "*.png" -exec pngquant --quality=65-85 --ext .png --force {} \;

echo "✅ Otimização concluída!"
```

### 2. **Lazy Loading Configurado**

```tsx
// Imagens abaixo da dobra - lazy loading automático:
<Image
  src="/images/hotels/hotel-distante.jpg"
  alt="Hotel"
  width={1200}
  height={800}
  // loading="lazy" é padrão para Image do Next.js
/>

// Imagens acima da dobra - carregamento prioritário:
<Image
  src="/images/hero-image.jpg"
  alt="Imagem principal"
  width={1200}
  height={800}
  priority // Remove lazy loading
/>
```

### 3. **WebP e Formatos Modernos**

```tsx
// Next.js converte automaticamente para WebP quando possível
// Mas você pode forçar formatos específicos:

<Image
  src="/images/hotel.jpg" // Arquivo original JPG
  alt="Hotel"
  width={1200}
  height={800}
  // Next.js servirá como WebP se o browser suportar
/>
```

---

## ✅ Boas Práticas

### 1. **Naming Convention**

```bash
# ✅ BOM:
spazzio-diroma-hotel.jpg
hot-park-toboga-principal.jpg
promocao-fim-de-semana.jpg

# ❌ RUIM:
IMG_001.jpg
foto sem nome.jpg
SPAZZIO DIROMA.JPG
```

### 2. **Alt Text Otimizado**

```tsx
// ✅ BOM - descritivo e específico:
<Image
  src="/images/hotels/spazzio-diroma.jpg"
  alt="Spazzio DiRoma Hotel - Piscinas termais com deck de madeira e bar aquático"
  width={1200}
  height={800}
/>

// ❌ RUIM - genérico demais:
<Image
  src="/images/hotels/spazzio-diroma.jpg" 
  alt="Hotel"
  width={1200}
  height={800}
/>
```

### 3. **Versionamento de Assets**

```tsx
// Para forçar atualização de cache quando trocar imagem:
<Image
  src="/images/hotels/spazzio-diroma.jpg?v=2025-01"
  alt="Spazzio DiRoma - Versão atualizada"
  width={1200}
  height={800}
/>
```

### 4. **Fallbacks e Loading States**

```tsx
import { useState } from "react"

function ImageWithFallback({ src, alt, ...props }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  
  if (error) {
    return (
      <div className="bg-gray-200 flex items-center justify-center">
        <span>Imagem não disponível</span>
      </div>
    )
  }
  
  return (
    <>
      {loading && (
        <div className="animate-pulse bg-gray-300 rounded-lg" />
      )}
      <Image
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
        {...props}
      />
    </>
  )
}
```

---

## 📊 Checklist de Assets

### ✅ Antes de Adicionar Asset

- [ ] **Tamanho correto** conforme especificações
- [ ] **Compressão otimizada** (< 300KB para imagens)
- [ ] **Nome descritivo** e padronizado
- [ ] **Alt text** específico e útil
- [ ] **Pasta correta** na estrutura de arquivos
- [ ] **Teste em dispositivos móveis**

### ✅ Antes de Remover Asset

- [ ] **Buscar todas as referências** no código
- [ ] **Verificar componentes** que podem usar dinamicamente
- [ ] **Confirmar que não é usado** em outras páginas
- [ ] **Backup** do arquivo antes de deletar
- [ ] **Testar aplicação** após remoção

---

## 🔗 Recursos e Ferramentas

### Otimização de Imagens
- [TinyPNG](https://tinypng.com) - Compressão online
- [Squoosh](https://squoosh.app) - Google's image optimizer
- [ImageOptim](https://imageoptim.com) - Mac app
- [JPEG Optimizer](http://jpeg-optimizer.com) - Online JPG compression

### Otimização de Vídeos
- [HandBrake](https://handbrake.fr) - Free video converter
- [FFmpeg](https://ffmpeg.org) - Command line tool
- [CloudConvert](https://cloudconvert.com) - Online converter

### Conversão de Formatos
- [CloudConvert](https://cloudconvert.com)
- [Online-Convert](https://www.online-convert.com)
- [Convertio](https://convertio.co)

---

**Última Atualização**: 2025-01-20  
**Próxima Documentação**: [Configuração N8N](./N8N-SETUP.md) 