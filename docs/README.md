# 📚 Documentação Reservei Viagens - Sistema Completo

## 🎯 Visão Geral

Esta é a documentação completa do sistema **Reservei Viagens**, uma landing page mobile-first para agência de turismo especializada em Caldas Novas, com chat inteligente integrado e sistema de automação.

### 🚀 Características Principais

- **Frontend Moderno**: Next.js 15 + TypeScript + Tailwind CSS
- **Chat Inteligente**: IA local + integração N8N opcional
- **Mobile First**: Otimizado para dispositivos móveis
- **Automação**: Integração com Google Calendar, WhatsApp, Email
- **Performance**: Otimização completa de imagens e vídeos
- **SEO**: Server-Side Rendering para melhor indexação

---

## 📁 Estrutura da Documentação

### 🏗️ **Arquitetura e Configuração**

#### 📋 [ADR-001: Arquitetura do Sistema](./ADR-001-Arquitetura-Sistema.md)
**Architecture Decision Record** completo documentando todas as decisões técnicas:
- Escolha do Next.js 15 como framework
- Sistema de componentes shadcn/ui + Tailwind
- Arquitetura de chat híbrida (local + N8N)
- Estrutura de arquivos e organização
- Estratégias de otimização e performance

#### 🛠️ [Instalação e Configuração](./INSTALACAO-E-CONFIGURACAO.md)
Guia completo de setup do projeto:
- **Pré-requisitos**: Node.js, Git, editores recomendados
- **Instalação passo a passo**: Clone, dependências, ambiente
- **Configuração de desenvolvimento**: VS Code, Git hooks
- **Deploy em produção**: Vercel, variáveis de ambiente
- **Troubleshooting**: Soluções para problemas comuns

### 🎨 **Frontend e Personalização**

#### 🎨 [Personalização do Frontend](./PERSONALIZACAO-FRONTEND.md)
Manual completo de customização visual:
- **Sistema de cores**: Paletas, CSS variables, customização
- **Tipografia**: Fontes, hierarquia, configuração
- **Componentes**: Cards, botões, formulários
- **Layout responsivo**: Breakpoints, grids, containers
- **Animações**: CSS animations, Tailwind transitions
- **Temas**: Dark/Light mode, configuração avançada

#### 🖼️ [Gerenciamento de Assets e Mídias](./ASSETS-E-MIDIAS.md)
Guia definitivo para imagens e vídeos:
- **Especificações técnicas**: Dimensões, formatos, compressão
- **Estrutura de pastas**: Organização recomendada
- **Como adicionar**: Passo a passo para novos assets
- **Como remover**: Limpeza segura de arquivos
- **Otimização**: Ferramentas e técnicas de performance
- **Boas práticas**: Naming, alt text, fallbacks

### ⚙️ **Integrações e Automação**

#### 🔧 [Configuração N8N](./N8N-SETUP.md)
Manual completo de automação avançada:
- **Instalação**: Cloud, Docker, self-hosted
- **Webhooks**: Configuração e teste
- **Workflows prontos**: Templates para importar
- **Google Calendar**: Integração completa
- **WhatsApp Business**: Configuração da API
- **Monitoramento**: Logs, relatórios, alertas

---

## 🚀 Início Rápido

### Para Desenvolvedores

```bash
# 1. Clonar o projeto
git clone https://github.com/seu-usuario/hotel-com-melhor-preco.git
cd hotel-com-melhor-preco

# 2. Instalar dependências
npm install

# 3. Configurar ambiente (opcional - funciona sem N8N)
cp .env.example .env.local

# 4. Executar desenvolvimento
npm run dev
```

### Para Designers/Marketing

1. 📖 Leia a [Personalização do Frontend](./PERSONALIZACAO-FRONTEND.md)
2. 🖼️ Consulte o [Guia de Assets](./ASSETS-E-MIDIAS.md) para dimensões corretas
3. 🎨 Use o sistema de cores e componentes documentados

### Para Administradores

1. 🛠️ Siga a [Instalação e Configuração](./INSTALACAO-E-CONFIGURACAO.md)
2. 🔧 Configure [N8N para automação](./N8N-SETUP.md) (opcional)
3. 📊 Implemente monitoramento e relatórios

---

## 📊 Status do Projeto

### ✅ Funcionalidades Implementadas

- **Frontend Mobile-First** ✅ Completo
  - Layout responsivo otimizado
  - Componentes shadcn/ui configurados
  - Sistema de cores personalizado
  - Animações e transições

- **Chat Inteligente** ✅ Completo
  - Sistema de fallback local (funciona sem N8N)
  - Respostas contextuais inteligentes
  - Formulário de agendamento integrado
  - Transferência para WhatsApp

- **Sistema de Assets** ✅ Completo
  - Otimização automática de imagens
  - Especificações técnicas documentadas
  - Estrutura organizacional definida

- **Integração N8N** ✅ Completo (Opcional)
  - Webhooks configurados
  - Google Calendar automático
  - Workflows prontos para importar
  - Monitoramento e relatórios

### 🔄 Próximas Funcionalidades

- **Analytics Avançado** 🚧 Em desenvolvimento
  - Google Analytics 4 integrado
  - Heatmaps de interação
  - Funil de conversão detalhado

- **CRM Integration** 📅 Planejado
  - Integração com RD Station
  - Pipeline de vendas automatizado
  - Score de leads

- **Multi-idioma** 📅 Planejado
  - Suporte para inglês e espanhol
  - Localização de conteúdo
  - Geolocaização automática

---

## 🛠️ Tecnologias Utilizadas

### Frontend Core
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Componentes acessíveis

### Integrações
- **N8N** - Automação de workflows
- **Google Calendar API** - Agendamentos automáticos
- **WhatsApp Business API** - Comunicação direta
- **Vercel** - Deploy e hosting

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação automática
- **Husky** - Git hooks
- **VS Code** - Editor recomendado

---

## 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Landing Page] --> B[Chat Component]
        B --> C[Booking Form]
        C --> D[WhatsApp Transfer]
    end
    
    subgraph "API Layer"
        E[/api/n8n] --> F[Webhook Handler]
        F --> G[Mock Responses]
    end
    
    subgraph "N8N Automation (Optional)"
        H[Webhook Receiver] --> I[OpenAI/Claude]
        H --> J[Google Calendar]
        H --> K[WhatsApp API]
        H --> L[Email Notifications]
    end
    
    B --> E
    F --> H
    
    subgraph "External Services"
        M[Google Calendar]
        N[WhatsApp Business]
        O[Email SMTP]
        P[Analytics]
    end
    
    J --> M
    K --> N
    L --> O
    A --> P
```

---

## 📝 Guias de Contribuição

### Para Desenvolvedores

1. **Fork** o repositório
2. **Crie branch** para sua feature: `git checkout -b feature/nova-funcionalidade`
3. **Siga os padrões** de código documentados
4. **Teste** sua implementação
5. **Crie Pull Request** com descrição detalhada

### Para Documentação

1. **Mantenha** o padrão de formatação Markdown
2. **Use emojis** para melhor visualização
3. **Inclua exemplos** de código quando aplicável
4. **Atualize** este README se necessário

### Padrões de Código

```typescript
// ✅ BOM - Componente bem documentado
interface HotelCardProps {
  name: string
  image: string
  price: string
  features: string[]
}

export function HotelCard({ name, image, price, features }: HotelCardProps) {
  return (
    <Card className="overflow-hidden">
      <Image
        src={image}
        alt={`${name} - Hotel em Caldas Novas`}
        width={1200}
        height={800}
        className="w-full h-48 object-cover"
      />
      {/* Resto do componente */}
    </Card>
  )
}
```

---

## 🔍 Checklist de Qualidade

### ✅ Frontend
- [ ] **Responsividade**: Testado em mobile, tablet, desktop
- [ ] **Performance**: Lighthouse score > 90
- [ ] **Acessibilidade**: WAI-ARIA compliance
- [ ] **SEO**: Meta tags e structured data
- [ ] **Cross-browser**: Chrome, Firefox, Safari, Edge

### ✅ Chat System
- [ ] **Fallback local**: Funciona sem N8N
- [ ] **Respostas contextuais**: IA inteligente
- [ ] **Formulários**: Validação completa
- [ ] **Integração WhatsApp**: Transfer com dados

### ✅ Assets
- [ ] **Imagens otimizadas**: < 300KB cada
- [ ] **Vídeos comprimidos**: < 5MB cada
- [ ] **Alt text descritivo**: SEO e acessibilidade
- [ ] **Lazy loading**: Performance otimizada

### ✅ Integrações
- [ ] **N8N configurado**: Workflows funcionando
- [ ] **Google Calendar**: Eventos criados automaticamente
- [ ] **Email notifications**: SMTP configurado
- [ ] **Monitoramento**: Logs e alertas ativos

---

## 📞 Suporte e Contato

### Suporte Técnico
- 📧 **Email**: tech@reserveiviagens.com.br
- 📱 **WhatsApp**: (64) 99319-7555
- 💻 **GitHub Issues**: Reporte bugs e sugestões

### Equipe de Desenvolvimento
- **Frontend**: Especialistas em React/Next.js
- **Backend**: Integrações e APIs
- **Design**: UX/UI e assets
- **DevOps**: Deploy e monitoramento

### Horário de Atendimento
- **Segunda a Sexta**: 8h às 18h (Horário de Brasília)
- **Sábado**: 8h às 12h
- **Emergências**: WhatsApp disponível 24/7

---

## 📈 Roadmap

### Q1 2025
- [ ] **Analytics Avançado**: Dashboards detalhados
- [ ] **A/B Testing**: Otimização de conversão
- [ ] **PWA**: Progressive Web App
- [ ] **Performance**: Core Web Vitals optimization

### Q2 2025  
- [ ] **Multi-idioma**: EN/ES support
- [ ] **CRM Integration**: Pipeline automatizado
- [ ] **Mobile App**: React Native version
- [ ] **API Pública**: Para parceiros

### Q3 2025
- [ ] **IA Avançada**: ChatGPT-4 integration
- [ ] **Video Calls**: Consultoria online
- [ ] **Pagamentos**: Gateway integrado
- [ ] **Multi-tenant**: Sistema para franquias

---

## 📜 Licença e Direitos

### Propriedade Intelectual
- **Código**: Proprietário - Reservei Viagens
- **Design**: Proprietário - Reservei Viagens  
- **Conteúdo**: Proprietário - Reservei Viagens
- **Imagens**: Licenciadas para uso específico

### Uso e Distribuição
- ❌ **Redistribuição não autorizada** 
- ❌ **Uso comercial por terceiros**
- ✅ **Modificações para uso interno**
- ✅ **Contribuições via Pull Request**

### Terceiros
- **shadcn/ui**: MIT License
- **Tailwind CSS**: MIT License
- **Next.js**: MIT License
- **Lucide React**: ISC License

---

**Última Atualização**: 2025-01-20  
**Versão da Documentação**: 1.0  
**Próxima Revisão**: 2025-04-20

---

## 🔗 Links Rápidos

| Categoria | Link | Descrição |
|-----------|------|-----------|
| **🏗️ Arquitetura** | [ADR-001](./ADR-001-Arquitetura-Sistema.md) | Decisões técnicas |
| **🛠️ Setup** | [Instalação](./INSTALACAO-E-CONFIGURACAO.md) | Guia de instalação |
| **🎨 Design** | [Personalização](./PERSONALIZACAO-FRONTEND.md) | Customização visual |
| **🖼️ Assets** | [Mídias](./ASSETS-E-MIDIAS.md) | Imagens e vídeos |
| **🔧 Automação** | [N8N Setup](./N8N-SETUP.md) | Integração avançada |
| **🌐 Demo** | [reserveiviagens.com.br](https://reserveiviagens.com.br) | Site em produção |
| **📱 Contato** | [WhatsApp](https://wa.me/5564993197555) | Suporte direto | 