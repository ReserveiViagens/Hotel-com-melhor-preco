# 🚀 Guia de Instalação e Configuração - Reservei Viagens

## 📋 Pré-requisitos

### Sistema Operacional
- ✅ Windows 10/11, macOS 10.15+, ou Linux (Ubuntu 18.04+)
- ✅ Git instalado
- ✅ Editor de código (VS Code recomendado)

### Ferramentas Necessárias

#### 1. Node.js (Versão 18+ obrigatória)
```bash
# Verificar versão instalada
node --version
npm --version

# Se não tiver Node.js instalado:
# Windows: Baixar de https://nodejs.org/
# macOS: brew install node
# Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

#### 2. PNPM (Recomendado) ou NPM
```bash
# Instalar PNPM globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
```

---

## 🛠️ Instalação do Projeto

### Passo 1: Clonar o Repositório

```bash
# Via HTTPS
git clone https://github.com/seu-usuario/hotel-com-melhor-preco.git

# Via SSH (se configurado)
git clone git@github.com:seu-usuario/hotel-com-melhor-preco.git

# Entrar na pasta do projeto
cd hotel-com-melhor-preco
```

### Passo 2: Instalar Dependências

```bash
# Com PNPM (recomendado)
pnpm install

# OU com NPM
npm install

# OU com Yarn
yarn install
```

### Passo 3: Configurar Variáveis de Ambiente

#### 3.1. Criar arquivo de configuração local
```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# OU criar manualmente
touch .env.local
```

#### 3.2. Configurar `.env.local`
```env
# ======================================
# CONFIGURAÇÃO BÁSICA (OBRIGATÓRIA)
# ======================================

# Ambiente de desenvolvimento
NODE_ENV=development

# ======================================
# INTEGRAÇÃO N8N (OPCIONAL - para chat avançado)
# ======================================

# Se você TEM N8N configurado:
N8N_WEBHOOK_URL=https://sua-instancia-n8n.com/webhook/reservei-chat
N8N_API_KEY=sua-api-key-opcional
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://sua-instancia-n8n.com/webhook/reservei-chat

# Se você NÃO TEM N8N (deixe comentado - sistema funcionará em modo mock):
# N8N_WEBHOOK_URL=
# N8N_API_KEY=
# NEXT_PUBLIC_N8N_WEBHOOK_URL=

# ======================================
# CONFIGURAÇÕES OPCIONAIS
# ======================================

# Google Analytics (se usar)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Calendar (para integração completa)
# GOOGLE_CALENDAR_CREDENTIALS={"type":"service_account",...}
# GOOGLE_CALENDAR_ID=primary

# Email/SMTP (para notificações)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=seu-email@gmail.com
# SMTP_PASS=sua-senha-de-app
```

---

## 🚀 Execução do Projeto

### Desenvolvimento Local

```bash
# Iniciar servidor de desenvolvimento
pnpm dev
# OU
npm run dev

# Acessar aplicação em:
# http://localhost:3000
```

### Build de Produção

```bash
# Gerar build otimizado
pnpm build
# OU
npm run build

# Iniciar servidor de produção
pnpm start
# OU
npm start
```

### Verificação de Qualidade

```bash
# Executar linter
pnpm lint
# OU
npm run lint

# Corrigir problemas de lint automaticamente
pnpm lint --fix
# OU
npm run lint -- --fix
```

---

## 🔧 Configurações Avançadas

### 1. Configuração do VS Code (Recomendado)

Criar `.vscode/settings.json`:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

Extensões recomendadas (`.vscode/extensions.json`):
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 2. Configuração de Git Hooks (Opcional)

```bash
# Instalar husky para git hooks
pnpm add -D husky lint-staged

# Configurar pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Adicionar ao `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 🌐 Deploy e Configuração de Produção

### 1. Deploy na Vercel (Recomendado)

#### Via CLI:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Configurar domínio personalizado
vercel domains add seudominio.com
```

#### Via Interface Web:
1. Acessar [vercel.com](https://vercel.com)
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente
4. Deploy automático

### 2. Variáveis de Ambiente para Produção

No painel da Vercel ou seu provedor:
```env
NODE_ENV=production
N8N_WEBHOOK_URL=https://sua-instancia-n8n-producao.com/webhook/reservei-chat
N8N_API_KEY=sua-api-key-producao
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://sua-instancia-n8n-producao.com/webhook/reservei-chat
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. Configuração de Domínio Personalizado

```bash
# Vercel
vercel domains add reserveiviagens.com.br

# Cloudflare (se usar)
# Configurar DNS para apontar para vercel
```

---

## 🧪 Verificação da Instalação

### Checklist de Funcionamento

Execute estes testes para verificar se tudo está funcionando:

#### ✅ 1. Servidor Local
```bash
pnpm dev
# Deve abrir em http://localhost:3000 sem erros
```

#### ✅ 2. Chat Agent
- Abrir a página
- Clicar no botão roxo do chat (canto inferior esquerdo)
- Digite "Olá" e verificar resposta
- Status deve mostrar "online" (verde)

#### ✅ 3. Formulário de Agendamento
- No chat, digite "Quero fazer uma reserva"
- Deve aparecer formulário de datas
- Preencher e enviar
- Verificar confirmação

#### ✅ 4. Integração WhatsApp
- Após algumas mensagens no chat
- Deve aparecer opção de transfer para WhatsApp
- Clicar deve abrir WhatsApp com dados preenchidos

#### ✅ 5. Navegação
- Testar todos os links do menu
- Verificar responsividade (redimensionar janela)
- Testar em dispositivo móvel

#### ✅ 6. Performance
```bash
# Verificar build sem erros
pnpm build

# Deve gerar pasta .next sem warnings críticos
```

---

## 🚨 Solução de Problemas Comuns

### Problema: "Module not found"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json .next
pnpm install
```

### Problema: "Port 3000 already in use"
```bash
# Usar porta diferente
pnpm dev -p 3001

# OU matar processo na porta 3000
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -ti:3000 | xargs kill
```

### Problema: Chat não responde
1. Verificar console do navegador (F12)
2. Confirmar variáveis N8N (se usando)
3. Chat funciona em modo mock mesmo sem N8N

### Problema: Imagens não carregam
1. Verificar URLs no código
2. Confirmar configuração do `next.config.mjs`
3. Verificar pasta `public/images/`

### Problema: Erro de TypeScript
```bash
# Verificar versão do TypeScript
pnpm list typescript

# Limpar cache do TypeScript
rm -rf .next
pnpm dev
```

---

## 📞 Suporte

### Documentação Adicional
- 📖 [Personalização do Frontend](./PERSONALIZACAO-FRONTEND.md)
- 🖼️ [Gerenciamento de Assets](./ASSETS-E-MIDIAS.md)
- 🔧 [Configuração N8N](./N8N-SETUP.md)
- 📱 [Guia do Chat Agent](./CHAT-AGENT.md)

### Contato para Suporte
- 📧 **Email**: tech@reserveiviagens.com.br
- 📱 **WhatsApp**: (64) 99319-7555
- 💻 **GitHub**: Issues no repositório

---

**Última Atualização**: 2025-01-20  
**Versão da Documentação**: 1.0  
**Compatibilidade**: Next.js 15, Node.js 18+ 