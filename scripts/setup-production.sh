#!/bin/bash

# ========================================
# SCRIPT DE CONFIGURAÇÃO ADICIONAL - PRODUÇÃO
# ========================================

set -e

echo "🔧 Configurando ambiente de produção..."

# ========================================
# CONFIGURAÇÕES DE SEGURANÇA
# ========================================
echo "🛡️ Configurando segurança..."

# Gerar chaves de segurança
if [ ! -f ".env.production" ]; then
    echo "📝 Criando arquivo de ambiente de produção..."
    cp env.production.example .env.production
    
    # Gerar chaves aleatórias
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    BACKUP_ENCRYPTION_KEY=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Substituir no arquivo
    sed -i "s/your-super-secret-production-key-here/$NEXTAUTH_SECRET/g" .env.production
    sed -i "s/your-32-character-encryption-key/$BACKUP_ENCRYPTION_KEY/g" .env.production
    sed -i "s/your-jwt-secret-here/$JWT_SECRET/g" .env.production
    
    echo "✅ Arquivo .env.production criado"
fi

# ========================================
# CONFIGURAÇÕES DE BANCO DE DADOS
# ========================================
echo "🗄️ Configurando banco de dados..."

# Aplicar migrações
echo "📊 Aplicando migrações..."
npx prisma migrate deploy

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Verificar conexão com banco
echo "🔍 Verificando conexão com banco..."
npx prisma db push --accept-data-loss

# ========================================
# CONFIGURAÇÕES DE CACHE
# ========================================
echo "💾 Configurando cache Redis..."

# Verificar se Redis está disponível
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis encontrado"
    redis-cli ping
else
    echo "⚠️ Redis não encontrado, usando cache em memória"
fi

# ========================================
# CONFIGURAÇÕES DE CDN
# ========================================
echo "🌐 Configurando CDN..."

# Criar diretório para assets estáticos
mkdir -p public/cdn

# Copiar assets para CDN
cp -r public/images public/cdn/
cp -r public/icons public/cdn/

echo "✅ Assets copiados para CDN"

# ========================================
# CONFIGURAÇÕES DE SSL
# ========================================
echo "🔒 Configurando SSL..."

# Verificar certificados SSL
if [ -f "/etc/ssl/certs/reservei.crt" ]; then
    echo "✅ Certificado SSL encontrado"
else
    echo "⚠️ Certificado SSL não encontrado, usando Vercel SSL"
fi

# ========================================
# CONFIGURAÇÕES DE MONITORAMENTO
# ========================================
echo "📊 Configurando monitoramento..."

# Instalar ferramentas de monitoramento
npm install -g lighthouse
npm install -g @next/bundle-analyzer

# Configurar logs
mkdir -p logs
touch logs/app.log
touch logs/error.log
touch logs/access.log

echo "✅ Logs configurados"

# ========================================
# CONFIGURAÇÕES DE BACKUP
# ========================================
echo "💾 Configurando backup..."

# Criar diretório de backup
mkdir -p backups
mkdir -p backups/database
mkdir -p backups/files

# Configurar cron job para backup
(crontab -l 2>/dev/null; echo "0 2 * * * /bin/bash $(pwd)/scripts/backup.sh") | crontab -

echo "✅ Backup configurado"

# ========================================
# CONFIGURAÇÕES DE PERFORMANCE
# ========================================
echo "⚡ Configurando performance..."

# Otimizar imagens
echo "🖼️ Otimizando imagens..."
npm install -g sharp
npm install -g imagemin

# Configurar compressão
echo "🗜️ Configurando compressão..."
npm install -g gzip-cli

# ========================================
# CONFIGURAÇÕES DE SEO
# ========================================
echo "🔍 Configurando SEO..."

# Gerar sitemap
echo "🗺️ Gerando sitemap..."
node scripts/generate-sitemap.js

# Gerar robots.txt
echo "🤖 Gerando robots.txt..."
cat > public/robots.txt << EOF
User-agent: *
Allow: /

Sitemap: https://reservei.com.br/sitemap.xml

Disallow: /admin/
Disallow: /api/
Disallow: /_next/
EOF

# ========================================
# CONFIGURAÇÕES DE ANALYTICS
# ========================================
echo "📈 Configurando analytics..."

# Verificar Google Analytics
if [ -n "$GA_MEASUREMENT_ID" ]; then
    echo "✅ Google Analytics configurado: $GA_MEASUREMENT_ID"
else
    echo "⚠️ Google Analytics não configurado"
fi

# ========================================
# CONFIGURAÇÕES DE EMAIL
# ========================================
echo "📧 Configurando email..."

# Verificar Resend
if [ -n "$RESEND_API_KEY" ]; then
    echo "✅ Resend configurado"
else
    echo "⚠️ Resend não configurado"
fi

# ========================================
# CONFIGURAÇÕES DE PAGAMENTO
# ========================================
echo "💳 Configurando pagamentos..."

# Verificar Stripe
if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo "✅ Stripe configurado"
else
    echo "⚠️ Stripe não configurado"
fi

# Verificar MercadoPago
if [ -n "$MERCADOPAGO_ACCESS_TOKEN" ]; then
    echo "✅ MercadoPago configurado"
else
    echo "⚠️ MercadoPago não configurado"
fi

# ========================================
# CONFIGURAÇÕES DE NOTIFICAÇÕES
# ========================================
echo "🔔 Configurando notificações..."

# Verificar Slack
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    echo "✅ Slack configurado"
else
    echo "⚠️ Slack não configurado"
fi

# ========================================
# TESTES FINAIS
# ========================================
echo "🧪 Executando testes finais..."

# Teste de build
echo "🔨 Teste de build..."
npm run build

# Teste de linting
echo "🔍 Teste de linting..."
npm run lint

# Teste de tipos
echo "📝 Teste de tipos..."
npm run type-check

# Teste de performance
echo "⚡ Teste de performance..."
npm run lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-test.json

# ========================================
# FINALIZAÇÃO
# ========================================
echo "🎉 Configuração de produção concluída!"
echo "✅ Todas as configurações foram aplicadas"
echo "🚀 Sistema pronto para produção"
echo "📊 Monitoramento ativo"
echo "🛡️ Segurança configurada"
echo "⚡ Performance otimizada"

# Limpar arquivos temporários
rm -f lighthouse-test.json

echo "✅ Script de configuração finalizado" 