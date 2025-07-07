#!/bin/bash

# ========================================
# SCRIPT DE ANÁLISE DE PERFORMANCE - RESERVEI VIAGENS
# ========================================

set -e

echo "📊 Iniciando análise completa de performance..."

# ========================================
# CONFIGURAÇÕES
# ========================================
SITE_URL="${SITE_URL:-http://localhost:3000}"
OUTPUT_DIR="performance-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Criar diretório de relatórios
mkdir -p "$OUTPUT_DIR"

# ========================================
# ANÁLISE DE BUNDLE
# ========================================
echo "📦 Analisando bundle da aplicação..."

# Analisar bundle
npm run build
npx @next/bundle-analyzer .next/static/chunks --out-dir "$OUTPUT_DIR/bundle-analysis-$TIMESTAMP"

echo "✅ Análise de bundle concluída"

# ========================================
# ANÁLISE DE LIGHTHOUSE
# ========================================
echo "🏆 Executando Lighthouse..."

# Lighthouse para diferentes páginas
PAGES=("/" "/hoteis" "/atracoes" "/promocoes" "/contato")

for page in "${PAGES[@]}"; do
    echo "📄 Analisando página: $page"
    
    npx lighthouse "$SITE_URL$page" \
        --output=json \
        --output-path="$OUTPUT_DIR/lighthouse-$page-$TIMESTAMP.json" \
        --chrome-flags="--headless --no-sandbox --disable-gpu" \
        --only-categories=performance,accessibility,best-practices,seo
done

echo "✅ Análise Lighthouse concluída"

# ========================================
# ANÁLISE DE REDE
# ========================================
echo "🌐 Analisando performance de rede..."

# Teste de velocidade de download
curl -w "@curl-format.txt" -o /dev/null -s "$SITE_URL" > "$OUTPUT_DIR/network-test-$TIMESTAMP.txt"

# Teste de latência
ping -c 10 $(echo "$SITE_URL" | sed 's|https?://||' | sed 's|/.*||') > "$OUTPUT_DIR/latency-test-$TIMESTAMP.txt"

echo "✅ Análise de rede concluída"

# ========================================
# ANÁLISE DE BANCO DE DADOS
# ========================================
echo "🗄️ Analisando performance do banco de dados..."

# Executar queries de teste
node scripts/test-database-performance.js > "$OUTPUT_DIR/database-performance-$TIMESTAMP.txt"

echo "✅ Análise de banco concluída"

# ========================================
# ANÁLISE DE CACHE
# ========================================
echo "💾 Analisando performance de cache..."

# Testar hit rate do cache
node scripts/test-cache-performance.js > "$OUTPUT_DIR/cache-performance-$TIMESTAMP.txt"

echo "✅ Análise de cache concluída"

# ========================================
# ANÁLISE DE MEMÓRIA
# ========================================
echo "🧠 Analisando uso de memória..."

# Monitorar uso de memória durante testes
node scripts/memory-analysis.js > "$OUTPUT_DIR/memory-analysis-$TIMESTAMP.txt"

echo "✅ Análise de memória concluída"

# ========================================
# ANÁLISE DE CPU
# ========================================
echo "🖥️ Analisando uso de CPU..."

# Monitorar uso de CPU durante testes
node scripts/cpu-analysis.js > "$OUTPUT_DIR/cpu-analysis-$TIMESTAMP.txt"

echo "✅ Análise de CPU concluída"

# ========================================
# ANÁLISE DE IMAGENS
# ========================================
echo "🖼️ Analisando otimização de imagens..."

# Verificar tamanho e formato das imagens
find public/images -name "*.jpg" -o -name "*.png" -o -name "*.webp" | head -20 | while read img; do
    echo "Imagem: $img"
    file "$img"
    du -h "$img"
done > "$OUTPUT_DIR/image-analysis-$TIMESTAMP.txt"

echo "✅ Análise de imagens concluída"

# ========================================
# ANÁLISE DE SEO
# ========================================
echo "🔍 Analisando SEO..."

# Verificar meta tags
curl -s "$SITE_URL" | grep -E "<title>|<meta" > "$OUTPUT_DIR/seo-analysis-$TIMESTAMP.txt"

# Verificar sitemap
curl -s "$SITE_URL/sitemap.xml" > "$OUTPUT_DIR/sitemap-$TIMESTAMP.xml"

echo "✅ Análise de SEO concluída"

# ========================================
# ANÁLISE DE ACESSIBILIDADE
# ========================================
echo "♿ Analisando acessibilidade..."

# Testar com axe-core
npx axe "$SITE_URL" --save "$OUTPUT_DIR/accessibility-$TIMESTAMP.json"

echo "✅ Análise de acessibilidade concluída"

# ========================================
# ANÁLISE DE SEGURANÇA
# ========================================
echo "🛡️ Analisando segurança..."

# Verificar headers de segurança
curl -I "$SITE_URL" > "$OUTPUT_DIR/security-headers-$TIMESTAMP.txt"

# Verificar vulnerabilidades
npm audit --json > "$OUTPUT_DIR/security-audit-$TIMESTAMP.json"

echo "✅ Análise de segurança concluída"

# ========================================
# ANÁLISE DE MOBILE
# ========================================
echo "📱 Analisando performance mobile..."

# Lighthouse para mobile
npx lighthouse "$SITE_URL" \
    --output=json \
    --output-path="$OUTPUT_DIR/lighthouse-mobile-$TIMESTAMP.json" \
    --chrome-flags="--headless --no-sandbox --disable-gpu" \
    --only-categories=performance \
    --emulated-form-factor=mobile

echo "✅ Análise mobile concluída"

# ========================================
# GERAR RELATÓRIO FINAL
# ========================================
echo "📋 Gerando relatório final..."

cat > "$OUTPUT_DIR/performance-report-$TIMESTAMP.md" << EOF
# Relatório de Performance - Reservei Viagens
**Data:** $(date)
**URL:** $SITE_URL

## 📊 Resumo Executivo

### Métricas Principais
- **Performance Score:** [Verificar Lighthouse]
- **First Contentful Paint:** [Verificar Lighthouse]
- **Largest Contentful Paint:** [Verificar Lighthouse]
- **Cumulative Layout Shift:** [Verificar Lighthouse]
- **First Input Delay:** [Verificar Lighthouse]

### Recomendações
1. **Otimizações de Imagem:** [Verificar análise de imagens]
2. **Otimizações de Bundle:** [Verificar análise de bundle]
3. **Otimizações de Cache:** [Verificar análise de cache]
4. **Otimizações de Banco:** [Verificar análise de banco]

## 📁 Arquivos de Análise
- Bundle Analysis: \`bundle-analysis-$TIMESTAMP/\`
- Lighthouse Reports: \`lighthouse-*-$TIMESTAMP.json\`
- Network Tests: \`network-test-$TIMESTAMP.txt\`
- Database Performance: \`database-performance-$TIMESTAMP.txt\`
- Cache Performance: \`cache-performance-$TIMESTAMP.txt\`
- Memory Analysis: \`memory-analysis-$TIMESTAMP.txt\`
- CPU Analysis: \`cpu-analysis-$TIMESTAMP.txt\`
- Image Analysis: \`image-analysis-$TIMESTAMP.txt\`
- SEO Analysis: \`seo-analysis-$TIMESTAMP.txt\`
- Accessibility: \`accessibility-$TIMESTAMP.json\`
- Security Audit: \`security-audit-$TIMESTAMP.json\`
- Mobile Performance: \`lighthouse-mobile-$TIMESTAMP.json\`

## 🚀 Próximos Passos
1. Revisar relatórios detalhados
2. Implementar otimizações recomendadas
3. Re-executar análise após otimizações
4. Monitorar performance continuamente
EOF

echo "✅ Relatório final gerado: $OUTPUT_DIR/performance-report-$TIMESTAMP.md"

# ========================================
# ENVIAR NOTIFICAÇÕES
# ========================================
echo "📢 Enviando notificações..."

if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"📊 Análise de Performance Concluída\",
            \"attachments\": [{
                \"color\": \"good\",
                \"fields\": [
                    {\"title\": \"Projeto\", \"value\": \"Reservei Viagens\", \"short\": true},
                    {\"title\": \"Timestamp\", \"value\": \"$(date)\", \"short\": true},
                    {\"title\": \"Relatórios\", \"value\": \"$OUTPUT_DIR/\", \"short\": false}
                ]
            }]
        }"
fi

# ========================================
# FINALIZAÇÃO
# ========================================
echo "🎉 Análise de performance concluída!"
echo "📁 Relatórios salvos em: $OUTPUT_DIR/"
echo "📋 Relatório principal: $OUTPUT_DIR/performance-report-$TIMESTAMP.md"
echo "⏰ Duração: $(($SECONDS / 60)) minutos"

echo "✅ Script de análise de performance finalizado" 