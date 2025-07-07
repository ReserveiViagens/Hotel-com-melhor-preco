# 🏨 Reservei Viagens - Sistema Completo

## 🎯 Visão Geral

Sistema de landing page mobile-first para agência de turismo especializada em Caldas Novas, com chat inteligente integrado, CMS administrativo completo e sistema de automação.

### 🚀 Características Principais

- **CMS Administrativo**: Sistema completo para gerenciar conteúdo sem código
- **Frontend Moderno**: Next.js 15 + TypeScript + Tailwind CSS
- **Chat Inteligente**: IA local + integração N8N opcional  
- **Mobile First**: Otimizado para dispositivos móveis
- **Automação**: Integração com Google Calendar, WhatsApp, Email
- **Performance**: Otimização completa de imagens e vídeos
- **SEO**: Server-Side Rendering para melhor indexação

---

## ⚡ Início Rápido

### 🛠️ Setup Automático (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/hotel-com-melhor-preco.git
cd hotel-com-melhor-preco

# 2. Execute o script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# O script vai:
# - Verificar Node.js
# - Instalar dependências
# - Configurar .env.local
# - Testar build
# - Iniciar servidor (opcional)
```

### 🔧 Setup Manual

```bash
# 1. Verificar Node.js 18+
node --version

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
touch .env.local
echo "NODE_ENV=development" > .env.local

# 4. Executar
npm run dev
```

### 🧪 Verificar Funcionamento

1. **Site Principal**: http://localhost:3000
2. **Painel Admin**: http://localhost:3000/admin
3. **Teste o chat**: Botão roxo no canto inferior esquerdo
4. **Digite**: "Olá" para testar resposta
5. **Teste reserva**: Digite "Quero fazer uma reserva"
6. **Teste o CMS**: Acesse o admin e adicione um hotel

---

## 📚 Documentação Completa

### 🏗️ **Arquitetura e Configuração**

| Documento | Descrição | Para quem? |
|-----------|-----------|------------|
| 📋 [**ADR-001: Arquitetura**](./docs/ADR-001-Arquitetura-Sistema.md) | Decisões técnicas e arquitetura | Developers |
| 🛠️ [**Instalação e Configuração**](./docs/INSTALACAO-E-CONFIGURACAO.md) | Setup completo passo a passo | Todos |
| 🔐 [**Variáveis de Ambiente**](./docs/VARIAVEIS-AMBIENTE.md) | Configuração de .env.local | Admins |

### 🎨 **Frontend e Personalização**

| Documento | Descrição | Para quem? |
|-----------|-----------|------------|
| 🏢 [**Sistema Administrativo**](./docs/SISTEMA-ADMINISTRATIVO.md) | CMS completo para gestão | Admins/Editores |
| 🎨 [**Personalização Frontend**](./docs/PERSONALIZACAO-FRONTEND.md) | Cores, fonts, componentes | Designers |
| 🖼️ [**Assets e Mídias**](./docs/ASSETS-E-MIDIAS.md) | Imagens, vídeos, dimensões | Designers |
| 📝 [**Templates e Exemplos**](./docs/TEMPLATES-E-EXEMPLOS.md) | Código pronto para usar | Developers |

### ⚙️ **Integrações e Automação**

| Documento | Descrição | Para quem? |
|-----------|-----------|------------|
| 🔧 [**Configuração N8N**](./docs/N8N-SETUP.md) | Chat avançado e automação | Admins |
| 🧪 [**Testes do Sistema**](./docs/TESTE-DO-SISTEMA.md) | Como testar tudo | QA/Admins |

---

## 🎯 Para Diferentes Perfis

### 👨‍💻 **Desenvolvedores**
```bash
# 1. Setup completo
./scripts/setup.sh

# 2. Leia a documentação técnica
docs/ADR-001-Arquitetura-Sistema.md
docs/TEMPLATES-E-EXEMPLOS.md

# 3. Execute testes
npm run build
npm run lint
```

### 🎨 **Designers/Marketing**
- 📖 [**Guia de Personalização**](./docs/PERSONALIZACAO-FRONTEND.md) - Cores, fonts, layout
- 🖼️ [**Especificações de Assets**](./docs/ASSETS-E-MIDIAS.md) - Dimensões corretas
- 💡 **Dica**: Use os templates prontos em `docs/TEMPLATES-E-EXEMPLOS.md`

### 👨‍💼 **Administradores**
- 🏢 [**Sistema Administrativo**](./docs/SISTEMA-ADMINISTRATIVO.md) - CMS completo
- 🛠️ [**Guia de Instalação**](./docs/INSTALACAO-E-CONFIGURACAO.md) - Setup completo
- 🔐 [**Configuração de Ambiente**](./docs/VARIAVEIS-AMBIENTE.md) - Variáveis necessárias
- 🔧 [**Setup N8N**](./docs/N8N-SETUP.md) - Automação avançada
- 🧪 [**Testes**](./docs/TESTE-DO-SISTEMA.md) - Verificação completa

---

## 🔥 Funcionalidades Principais

### 🏢 **CMS Administrativo**
- 🏨 **Gerenciamento de Hotéis** com upload de imagens e edição completa
- 🎫 **Sistema de Ingressos** para parques e atrações
- 📸 **Galeria de Assets** com categorização automática
- 📝 **Edição sem código** de todos os conteúdos
- 💾 **Controle de alterações** com salvamento global
- 🔍 **Busca e filtros** avançados

### 💬 **Chat Inteligente**
- ✅ **Funciona sem configuração** (modo mock)
- 🤖 **IA contextual** para perguntas sobre hotéis, parques, preços
- 📝 **Formulário de agendamento** integrado
- 📱 **Transfer para WhatsApp** com dados preenchidos
- 🔧 **Integração N8N** opcional para automação avançada

### 🏨 **Sistema de Reservas**
- 📅 **Google Calendar** automático (com N8N)
- 📧 **Email notifications** para equipe
- 📊 **Dashboard de métricas** e relatórios
- 🔄 **Workflow automatizado** completo

### 📱 **Mobile-First Design**
- 🎨 **Design responsivo** otimizado para mobile
- ⚡ **Performance** optimizada (Lighthouse 90+)
- ♿ **Acessibilidade** WCAG compliant
- 🖼️ **Otimização automática** de imagens

---

## 🛠️ Tecnologias

### **Core Stack**
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática  
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Componentes acessíveis

### **Integrações**
- **N8N** - Automação de workflows (opcional)
- **Google Calendar API** - Agendamentos automáticos
- **WhatsApp Business API** - Comunicação direta
- **Vercel** - Deploy e hosting

---

## 📊 Status do Projeto

### ✅ **Funcionalidades Implementadas**

- **CMS Administrativo** ✅ Completo (hotéis, ingressos, assets)
- **Frontend Mobile-First** ✅ Completo
- **Chat Inteligente** ✅ Completo (mock + N8N)
- **Sistema de Assets** ✅ Completo
- **Integração N8N** ✅ Completo (opcional)
- **Documentação** ✅ Completa

### 🔄 **Próximas Funcionalidades**

- **Analytics Avançado** 🚧 Em desenvolvimento
- **CRM Integration** 📅 Planejado
- **Multi-idioma** 📅 Planejado

---

## 🚀 Deploy

### **Vercel (Recomendado)**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configurar domínio
vercel domains add seudominio.com
```

### **Outras Opções**
- **Netlify**: `npm run build` → Deploy pasta `.next`
- **Railway**: Conectar repositório GitHub
- **DigitalOcean**: Docker + Nginx

---

## 🔍 Troubleshooting

### **Problemas Comuns**

#### Chat não funciona
```bash
# Verificar console (F12)
# Verificar variáveis N8N (se usando)
# Chat funciona em modo mock por padrão
```

#### Erro de build
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

#### Imagens não carregam
```bash
# Verificar pasta public/images/
# Verificar next.config.mjs
# Verificar URLs no código
```

### **Scripts de Diagnóstico**
```bash
# Teste completo
scripts/test-complete.sh

# Verificar ambiente
scripts/check-env.sh

# Monitoramento
scripts/monitor.sh
```

---

## 📞 Suporte

### **Documentação**
- 📚 **Completa**: `docs/README.md`
- 🔧 **Setup**: `docs/INSTALACAO-E-CONFIGURACAO.md`
- 🎨 **Design**: `docs/PERSONALIZACAO-FRONTEND.md`

### **Contato**
- 📧 **Email**: tech@reserveiviagens.com.br
- 📱 **WhatsApp**: (64) 99319-7555
- 💻 **GitHub**: Issues no repositório

### **Horários**
- **Segunda a Sexta**: 8h às 18h (Brasília)
- **Sábado**: 8h às 12h
- **Emergências**: WhatsApp 24/7

---

## 📜 Licença

Código proprietário - **Reservei Viagens**
- ❌ Redistribuição não autorizada
- ❌ Uso comercial por terceiros  
- ✅ Modificações para uso interno
- ✅ Contribuições via Pull Request

---

## 🎯 Links Rápidos

| Ação | Link | Descrição |
|------|------|-----------|
| 🚀 **Setup** | `./scripts/setup.sh` | Configuração automática |
| 🏢 **Admin** | `http://localhost:3000/admin` | Painel Administrativo |
| 📖 **Docs** | [`docs/`](./docs/) | Documentação completa |
| 🎯 **CMS** | [`docs/SISTEMA-ADMINISTRATIVO.md`](./docs/SISTEMA-ADMINISTRATIVO.md) | Manual do CMS |
| 🎨 **Design** | [`docs/PERSONALIZACAO-FRONTEND.md`](./docs/PERSONALIZACAO-FRONTEND.md) | Guia de customização |
| 🖼️ **Assets** | [`docs/ASSETS-E-MIDIAS.md`](./docs/ASSETS-E-MIDIAS.md) | Imagens e vídeos |
| 🔧 **N8N** | [`docs/N8N-SETUP.md`](./docs/N8N-SETUP.md) | Automação avançada |
| 🧪 **Testes** | [`docs/TESTE-DO-SISTEMA.md`](./docs/TESTE-DO-SISTEMA.md) | Como testar |
| 📱 **Demo** | [reserveiviagens.com.br](https://reserveiviagens.com.br) | Site em produção |

---

**Última Atualização**: 2025-01-20  
**Versão**: 1.0  
**Compatibilidade**: Next.js 15, Node.js 18+ 