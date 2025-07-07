# ADR-001: Arquitetura do Sistema Reservei Viagens

**Status**: Aprovado  
**Data**: 2025-01-20  
**Autor**: Equipe de Desenvolvimento  

## Contexto

O sistema Reservei Viagens é uma landing page mobile-first para uma agência de turismo especializada em Caldas Novas, com foco em:
- Captação de leads através de chat inteligente
- Integração com sistemas externos (N8N, Google Calendar, WhatsApp)
- Interface otimizada para dispositivos móveis
- Performance e SEO otimizados

## Decisões Arquiteturais

### 1. Framework Principal: Next.js 15

**Decisão**: Utilizar Next.js 15 com App Router

**Justificativa**:
- **SEO**: Server-Side Rendering nativo
- **Performance**: Image optimization, code splitting automático
- **Developer Experience**: TypeScript nativo, hot reload
- **Ecosystem**: Compatibilidade com Vercel, facilidade de deploy
- **API Routes**: Backend integrado para comunicação com N8N

**Alternativas Consideradas**: React SPA, Nuxt.js, Gatsby

### 2. Sistema de Componentes: shadcn/ui + Tailwind CSS

**Decisão**: shadcn/ui como base de componentes com Tailwind CSS

**Justificativa**:
- **Customização**: Componentes copiáveis e modificáveis
- **Design System**: Consistência visual garantida
- **Performance**: Apenas CSS necessário no bundle final
- **Accessibility**: Componentes com WAI-ARIA nativo
- **Manutenibilidade**: Classes utilitárias padronizadas

**Alternativas Consideradas**: Material-UI, Chakra UI, Ant Design

### 3. Gerenciamento de Estado: React Hooks Locais

**Decisão**: useState e useEffect locais, sem state manager global

**Justificativa**:
- **Simplicidade**: Projeto focado, sem estado complexo compartilhado
- **Performance**: Evita re-renders desnecessários
- **Bundle Size**: Reduz tamanho final da aplicação
- **Manutenibilidade**: Menos dependências para gerenciar

**Alternativas Consideradas**: Redux, Zustand, Jotai

### 4. Chat System: Integração N8N com Fallback Local

**Decisão**: Sistema híbrido com N8N + IA local de fallback

**Justificativa**:
- **Flexibilidade**: Funciona com ou sem N8N configurado
- **UX**: Chat sempre disponível, sem dependência externa
- **Escalabilidade**: N8N permite automações complexas
- **Desenvolvimento**: Modo mock facilita desenvolvimento local

**Alternativas Consideradas**: ChatBot puro, integração direta com OpenAI

### 5. Estrutura de Arquivos: Feature-Based

**Decisão**: Organização por funcionalidade, não por tipo de arquivo

```
app/                    # Next.js App Router
├── (routes)/          # Páginas da aplicação
├── api/               # API Routes
├── globals.css        # Estilos globais
└── layout.tsx         # Layout principal

components/            # Componentes reutilizáveis
├── ui/               # shadcn/ui components
├── chat-agent.tsx    # Chat principal
└── [feature].tsx     # Componentes específicos

lib/                  # Utilitários e configurações
├── utils.ts          # Funções auxiliares
└── types.ts          # Definições TypeScript

docs/                 # Documentação
├── ADR/              # Architecture Decision Records
├── guides/           # Guias de uso
└── api/              # Documentação de APIs
```

### 6. Otimização de Assets

**Decisão**: Next.js Image Component + Vercel Blob Storage

**Justificativa**:
- **Performance**: Lazy loading, responsive images automático
- **SEO**: Otimização automática de formatos (WebP, AVIF)
- **CDN**: Distribuição global via Vercel
- **Developer Experience**: Fácil integração e deploy

## Consequências

### Positivas
- ✅ **Performance**: Aplicação rápida e otimizada
- ✅ **SEO**: Excelente indexação pelos motores de busca
- ✅ **Manutenibilidade**: Código organizado e documentado
- ✅ **Escalabilidade**: Arquitetura permite crescimento futuro
- ✅ **Developer Experience**: Ambiente de desenvolvimento produtivo

### Negativas
- ⚠️ **Learning Curve**: Next.js 15 App Router é relativamente novo
- ⚠️ **Vendor Lock-in**: Algumas otimizações específicas do Vercel
- ⚠️ **Complexidade**: Pode ser over-engineering para projetos simples

### Mitigações
- 📚 **Documentação Completa**: Guias detalhados para toda equipe
- 🔄 **Fallbacks**: Sistemas alternativos para dependências externas
- 📊 **Monitoramento**: Métricas de performance e uso
- 🧪 **Testes**: Cobertura de funcionalidades críticas

## Próximas Revisões

- **ADR-002**: Sistema de Analytics e Monitoramento
- **ADR-003**: Estratégia de Cache e Performance
- **ADR-004**: Integração com CRM e Sistemas de Pagamento

---

**Revisado por**: Equipe Técnica  
**Aprovado por**: Product Owner  
**Próxima Revisão**: 2025-04-20 