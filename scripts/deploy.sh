#!/bin/bash

# ======================================
# SCRIPT DE DEPLOY - RESERVEI VIAGENS
# ======================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto Reservei Viagens"
    exit 1
fi

log "🚀 Iniciando deploy para produção..."

# ======================================
# 1. VERIFICAÇÕES PRÉ-DEPLOY
# ======================================

log "📋 Verificando pré-requisitos..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado"
    exit 1
fi

# Verificar versão do Node.js (mínimo 18)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

log "✅ Node.js $(node -v) - OK"

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    warn "Arquivo .env.production não encontrado"
    info "Copiando env.production.example para .env.production"
    cp env.production.example .env.production
    warn "⚠️  Configure as variáveis de ambiente em .env.production antes de continuar"
    exit 1
fi

# Verificar variáveis críticas
if ! grep -q "JWT_SECRET" .env.production || grep -q "sua_chave_super_secreta" .env.production; then
    error "Configure JWT_SECRET em .env.production"
    exit 1
fi

if ! grep -q "NODE_ENV=production" .env.production; then
    error "NODE_ENV deve ser 'production' em .env.production"
    exit 1
fi

log "✅ Variáveis de ambiente - OK"

# ======================================
# 2. LIMPEZA E PREPARAÇÃO
# ======================================

log "🧹 Limpando arquivos temporários..."

# Limpar cache e builds anteriores
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# Limpar logs antigos
find . -name "*.log" -type f -delete

log "✅ Limpeza concluída"

# ======================================
# 3. INSTALAÇÃO DE DEPENDÊNCIAS
# ======================================

log "📦 Instalando dependências..."

# Verificar se pnpm está instalado
if command -v pnpm &> /dev/null; then
    log "Usando pnpm..."
    pnpm install --frozen-lockfile
else
    log "Usando npm..."
    npm ci
fi

log "✅ Dependências instaladas"

# ======================================
# 4. VERIFICAÇÕES DE QUALIDADE
# ======================================

log "🔍 Executando verificações de qualidade..."

# Lint
if command -v pnpm &> /dev/null; then
    pnpm lint
else
    npm run lint
fi

log "✅ Lint - OK"

# Type check
if command -v pnpm &> /dev/null; then
    pnpm type-check
else
    npm run type-check
fi

log "✅ Type check - OK"

# ======================================
# 5. BUILD DE PRODUÇÃO
# ======================================

log "🏗️  Gerando build de produção..."

# Build
if command -v pnpm &> /dev/null; then
    pnpm build
else
    npm run build
fi

log "✅ Build concluído"

# ======================================
# 6. TESTES DE PRODUÇÃO
# ======================================

log "🧪 Executando testes de produção..."

# Testar se o build funciona
if command -v pnpm &> /dev/null; then
    timeout 30s pnpm start &
else
    timeout 30s npm start &
fi

PID=$!
sleep 10

# Verificar se o servidor está rodando
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Servidor de produção - OK"
    kill $PID 2>/dev/null || true
else
    error "❌ Servidor de produção falhou"
    kill $PID 2>/dev/null || true
    exit 1
fi

# ======================================
# 7. OTIMIZAÇÕES DE PRODUÇÃO
# ======================================

log "⚡ Aplicando otimizações de produção..."

# Criar diretório de logs se não existir
mkdir -p logs

# Configurar permissões
chmod 755 .next
chmod 644 .env.production

log "✅ Otimizações aplicadas"

# ======================================
# 8. BACKUP E VERSIONAMENTO
# ======================================

log "💾 Criando backup..."

# Criar tag de versão
VERSION=$(date +'%Y%m%d_%H%M%S')
git tag "v$VERSION" 2>/dev/null || warn "Tag já existe ou git não configurado"

# Backup do .env
cp .env.production "backup_env_$VERSION.env"

log "✅ Backup criado: backup_env_$VERSION.env"

# ======================================
# 9. DEPLOY FINAL
# ======================================

log "🚀 Deploy finalizado com sucesso!"

# Informações finais
echo ""
echo "=========================================="
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo ""
echo "📊 Informações do Deploy:"
echo "   • Versão: $VERSION"
echo "   • Data: $(date)"
echo "   • Node.js: $(node -v)"
echo "   • Build: .next/"
echo ""
echo "🌐 URLs de Acesso:"
echo "   • Site: https://reserveiviagens.com.br"
echo "   • Admin: https://reserveiviagens.com.br/admin"
echo "   • Login: https://reserveiviagens.com.br/admin/login"
echo ""
echo "🔧 Próximos Passos:"
echo "   1. Configure o servidor web (nginx/apache)"
echo "   2. Configure SSL/HTTPS"
echo "   3. Configure o banco de dados"
echo "   4. Configure os gateways de pagamento"
echo "   5. Teste todas as funcionalidades"
echo ""
echo "📞 Suporte:"
echo "   • Email: suporte@reserveiviagens.com.br"
echo "   • WhatsApp: (64) 9 9999-9999"
echo ""
echo "=========================================="

# ======================================
# 10. COMANDOS ÚTEIS
# ======================================

echo ""
echo "🔧 Comandos Úteis:"
echo "   • Iniciar servidor: npm start"
echo "   • Ver logs: tail -f logs/app.log"
echo "   • Backup: ./scripts/backup.sh"
echo "   • Monitor: ./scripts/monitor.sh"
echo ""

log "✅ Deploy concluído! Sistema pronto para produção." 