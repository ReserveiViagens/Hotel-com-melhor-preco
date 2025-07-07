#!/bin/bash

# ======================================
# Setup Inicial - Reservei Viagens
# ======================================

echo "🚀 Iniciando setup do projeto Reservei Viagens..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar etapas
step() {
    echo -e "\n${BLUE}📋 $1${NC}"
}

# Função para sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para aviso
warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Função para erro
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto (onde está o package.json)"
    exit 1
fi

# Passo 1: Verificar Node.js
step "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    error "Node.js versão $REQUIRED_VERSION+ necessária. Atual: $NODE_VERSION"
    exit 1
fi

success "Node.js $NODE_VERSION - OK"

# Passo 2: Instalar dependências
step "Instalando dependências..."
if command -v pnpm &> /dev/null; then
    pnpm install
    success "Dependências instaladas com PNPM"
elif command -v yarn &> /dev/null; then
    yarn install
    success "Dependências instaladas com Yarn"
else
    npm install
    success "Dependências instaladas com NPM"
fi

# Passo 3: Configurar ambiente
step "Configurando arquivo de ambiente..."
if [ ! -f ".env.local" ]; then
    touch .env.local
    cat > .env.local << 'EOF'
# ======================================
# Reservei Viagens - Configuração Local
# ======================================

# Ambiente de desenvolvimento
NODE_ENV=development

# ======================================
# N8N (Opcional - deixe comentado para usar modo mock)
# ======================================
# N8N_WEBHOOK_URL=https://sua-instancia-n8n.com/webhook/reservei-chat
# N8N_API_KEY=sua-api-key-opcional
# NEXT_PUBLIC_N8N_WEBHOOK_URL=https://sua-instancia-n8n.com/webhook/reservei-chat

# ======================================
# Google Analytics (Opcional)
# ======================================
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

EOF
    success "Arquivo .env.local criado"
else
    warning "Arquivo .env.local já existe - mantendo configuração atual"
fi

# Passo 4: Verificar build
step "Testando build do projeto..."
if npm run build > /dev/null 2>&1; then
    success "Build executado com sucesso"
else
    error "Falha no build - verifique os erros acima"
    exit 1
fi

# Passo 5: Criar pasta de scripts se não existir
if [ ! -d "scripts" ]; then
    mkdir scripts
    success "Pasta scripts criada"
fi

# Passo 6: Tornar scripts executáveis
if [ -f "scripts/test-complete.sh" ]; then
    chmod +x scripts/*.sh 2>/dev/null || true
    success "Scripts configurados"
fi

# Finalização
echo ""
echo "🎉 Setup concluído com sucesso!"
echo "================================"
echo ""
echo "📝 Próximos passos:"
echo "1. Execute: npm run dev"
echo "2. Acesse: http://localhost:3000"
echo "3. Teste o chat (botão roxo no canto inferior)"
echo ""
echo "📚 Documentação:"
echo "- Personalização: docs/PERSONALIZACAO-FRONTEND.md"
echo "- Assets: docs/ASSETS-E-MIDIAS.md"
echo "- N8N Setup: docs/N8N-SETUP.md"
echo "- Variáveis: docs/VARIAVEIS-AMBIENTE.md"
echo ""
echo "💬 Suporte: WhatsApp (64) 99319-7555"
echo ""

# Perguntar se quer iniciar o servidor
read -p "Deseja iniciar o servidor de desenvolvimento agora? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Iniciando servidor..."
    npm run dev
fi 