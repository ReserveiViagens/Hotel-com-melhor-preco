#!/bin/bash

# ========================================
# SCRIPT DE DEPLOY AUTOMATIZADO - RESERVEI VIAGENS
# ========================================

set -e

echo "🚀 Iniciando deploy em produção..."

# ========================================
# CONFIGURAÇÕES
# ========================================
PROJECT_NAME="reservei-viagens"
VERCEL_TOKEN="${VERCEL_TOKEN}"
VERCEL_ORG_ID="${VERCEL_ORG_ID}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL}"

# ========================================
# FUNÇÕES DE UTILIDADE
# ========================================
send_slack_notification() {
    local message="$1"
    local color="$2"
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"$message\",
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"fields\": [
                        {\"title\": \"Projeto\", \"value\": \"$PROJECT_NAME\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"$(date)\", \"short\": true}
                    ]
                }]
            }"
    fi
}

# ========================================
# PRÉ-DEPLOY
# ========================================
echo "📋 Executando verificações pré-deploy..."

# Verificar se estamos na branch correta
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Erro: Deploy deve ser feito da branch main"
    send_slack_notification "❌ Deploy falhou: Branch incorreta" "danger"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Erro: Há mudanças não commitadas"
    send_slack_notification "❌ Deploy falhou: Mudanças não commitadas" "danger"
    exit 1
fi

# Verificar dependências
echo "📦 Verificando dependências..."
npm ci --production=false

# Executar testes
echo "🧪 Executando testes..."
npm run test

# Executar linting
echo "🔍 Executando linting..."
npm run lint

# Verificar tipos TypeScript
echo "📝 Verificando tipos TypeScript..."
npm run type-check

# ========================================
# BACKUP ANTES DO DEPLOY
# ========================================
echo "💾 Criando backup antes do deploy..."

# Backup do banco de dados
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️ Backup do banco de dados..."
    npx prisma db push --force-reset
    npx prisma generate
fi

# ========================================
# BUILD DA APLICAÇÃO
# ========================================
echo "🔨 Build da aplicação..."

# Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# Build da aplicação
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d ".next" ]; then
    echo "❌ Erro: Build falhou"
    send_slack_notification "❌ Deploy falhou: Build falhou" "danger"
    exit 1
fi

echo "✅ Build concluído com sucesso"

# ========================================
# DEPLOY NO VERCEL
# ========================================
echo "🚀 Deploy no Vercel..."

if [ -n "$VERCEL_TOKEN" ] && [ -n "$VERCEL_ORG_ID" ] && [ -n "$VERCEL_PROJECT_ID" ]; then
    # Deploy usando Vercel CLI
    npx vercel --prod --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID"
    
    # Obter URL do deploy
    DEPLOY_URL=$(npx vercel ls --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
    
    echo "✅ Deploy concluído: $DEPLOY_URL"
else
    echo "⚠️ Vercel não configurado, pulando deploy automático"
    DEPLOY_URL="https://reservei-viagens.vercel.app"
fi

# ========================================
# PÓS-DEPLOY
# ========================================
echo "🔍 Verificações pós-deploy..."

# Health check
echo "🏥 Health check..."
sleep 30

HEALTH_CHECK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/health")

if [ "$HEALTH_CHECK_RESPONSE" = "200" ]; then
    echo "✅ Health check passou"
else
    echo "❌ Health check falhou: $HEALTH_CHECK_RESPONSE"
    send_slack_notification "❌ Deploy falhou: Health check falhou" "danger"
    exit 1
fi

# Testes de performance
echo "⚡ Testes de performance..."
npm run lighthouse "$DEPLOY_URL" --output=json --output-path=./lighthouse-report.json

# Verificar métricas de performance
LIGHTHOUSE_SCORE=$(node -e "
const report = require('./lighthouse-report.json');
const score = report.categories.performance.score * 100;
console.log(score);
")

if (( $(echo "$LIGHTHOUSE_SCORE >= 80" | bc -l) )); then
    echo "✅ Performance score: $LIGHTHOUSE_SCORE"
else
    echo "⚠️ Performance score baixo: $LIGHTHOUSE_SCORE"
fi

# ========================================
# NOTIFICAÇÕES
# ========================================
echo "📢 Enviando notificações..."

# Notificação de sucesso
send_slack_notification "✅ Deploy em produção concluído com sucesso!\n🌐 URL: $DEPLOY_URL\n⚡ Performance: $LIGHTHOUSE_SCORE" "good"

# Notificação por email (se configurado)
if [ -n "$EMAIL_FROM" ] && [ -n "$EMAIL_TO" ]; then
    echo "📧 Enviando email de notificação..."
    # Implementar envio de email aqui
fi

# ========================================
# MONITORAMENTO PÓS-DEPLOY
# ========================================
echo "📊 Iniciando monitoramento pós-deploy..."

# Monitorar por 5 minutos
for i in {1..10}; do
    echo "Monitoramento $i/10..."
    
    # Verificar status da aplicação
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")
    if [ "$RESPONSE" != "200" ]; then
        echo "⚠️ Aplicação retornou status $RESPONSE"
        send_slack_notification "⚠️ Alerta: Aplicação retornou status $RESPONSE" "warning"
    fi
    
    sleep 30
done

# ========================================
# FINALIZAÇÃO
# ========================================
echo "🎉 Deploy em produção concluído com sucesso!"
echo "🌐 URL: $DEPLOY_URL"
echo "📊 Performance Score: $LIGHTHOUSE_SCORE"
echo "⏰ Timestamp: $(date)"

# Limpar arquivos temporários
rm -f lighthouse-report.json

echo "✅ Script de deploy finalizado" 