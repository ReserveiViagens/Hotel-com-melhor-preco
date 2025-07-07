#!/bin/bash

# ========================================
# SCRIPT DE TESTES DE SEGURANÇA - RESERVEI VIAGENS
# ========================================

set -e

echo "🛡️ Iniciando testes completos de segurança..."

# ========================================
# CONFIGURAÇÕES
# ========================================
SITE_URL="${SITE_URL:-http://localhost:3000}"
OUTPUT_DIR="security-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Criar diretório de relatórios
mkdir -p "$OUTPUT_DIR"

# ========================================
# AUDITORIA DE DEPENDÊNCIAS
# ========================================
echo "📦 Auditando dependências..."

# Verificar vulnerabilidades conhecidas
npm audit --audit-level moderate > "$OUTPUT_DIR/npm-audit-$TIMESTAMP.txt"

# Verificar dependências desatualizadas
npm outdated > "$OUTPUT_DIR/npm-outdated-$TIMESTAMP.txt"

# Verificar licenças
npx license-checker --summary > "$OUTPUT_DIR/license-check-$TIMESTAMP.txt"

echo "✅ Auditoria de dependências concluída"

# ========================================
# TESTES DE HEADERS DE SEGURANÇA
# ========================================
echo "🔒 Testando headers de segurança..."

# Verificar headers de segurança
curl -I "$SITE_URL" > "$OUTPUT_DIR/security-headers-$TIMESTAMP.txt"

# Verificar CSP
curl -s "$SITE_URL" | grep -i "content-security-policy" > "$OUTPUT_DIR/csp-check-$TIMESTAMP.txt"

# Verificar HSTS
curl -I "$SITE_URL" | grep -i "strict-transport-security" > "$OUTPUT_DIR/hsts-check-$TIMESTAMP.txt"

echo "✅ Headers de segurança verificados"

# ========================================
# TESTES DE INJEÇÃO
# ========================================
echo "💉 Testando vulnerabilidades de injeção..."

# Teste de SQL Injection
SQL_PAYLOADS=("' OR 1=1--" "' UNION SELECT * FROM users--" "'; DROP TABLE users--")

for payload in "${SQL_PAYLOADS[@]}"; do
    echo "Testando SQL Injection: $payload"
    curl -s "$SITE_URL/api/search?q=$payload" > "$OUTPUT_DIR/sql-injection-test-$TIMESTAMP.txt"
done

# Teste de XSS
XSS_PAYLOADS=("<script>alert('XSS')</script>" "javascript:alert('XSS')" "<img src=x onerror=alert('XSS')>")

for payload in "${XSS_PAYLOADS[@]}"; do
    echo "Testando XSS: $payload"
    curl -s -X POST "$SITE_URL/api/contact" \
        -H "Content-Type: application/json" \
        -d "{\"message\":\"$payload\"}" > "$OUTPUT_DIR/xss-test-$TIMESTAMP.txt"
done

echo "✅ Testes de injeção concluídos"

# ========================================
# TESTES DE AUTENTICAÇÃO
# ========================================
echo "🔐 Testando autenticação..."

# Teste de força bruta
for i in {1..5}; do
    echo "Tentativa de login $i"
    curl -s -X POST "$SITE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"test@test.com\",\"password\":\"wrongpassword$i\"}" \
        >> "$OUTPUT_DIR/brute-force-test-$TIMESTAMP.txt"
done

# Teste de bypass de autenticação
curl -s "$SITE_URL/admin" > "$OUTPUT_DIR/auth-bypass-test-$TIMESTAMP.txt"

echo "✅ Testes de autenticação concluídos"

# ========================================
# TESTES DE RATE LIMITING
# ========================================
echo "⏱️ Testando rate limiting..."

# Teste de rate limiting
for i in {1..20}; do
    echo "Requisição $i"
    curl -s "$SITE_URL/api/hotels" >> "$OUTPUT_DIR/rate-limit-test-$TIMESTAMP.txt"
    sleep 0.1
done

echo "✅ Testes de rate limiting concluídos"

# ========================================
# TESTES DE CORS
# ========================================
echo "🌐 Testando CORS..."

# Teste de CORS
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS "$SITE_URL/api/users" > "$OUTPUT_DIR/cors-test-$TIMESTAMP.txt"

echo "✅ Testes de CORS concluídos"

# ========================================
# TESTES DE PATH TRAVERSAL
# ========================================
echo "📁 Testando path traversal..."

# Teste de path traversal
PATHS=("../../../etc/passwd" "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts" "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd")

for path in "${PATHS[@]}"; do
    echo "Testando path: $path"
    curl -s "$SITE_URL/api/files/$path" > "$OUTPUT_DIR/path-traversal-test-$TIMESTAMP.txt"
done

echo "✅ Testes de path traversal concluídos"

# ========================================
# TESTES DE COMMAND INJECTION
# ========================================
echo "💻 Testando command injection..."

# Teste de command injection
COMMANDS=("; ls -la" "| whoami" "`id`" "$(cat /etc/passwd)")

for cmd in "${COMMANDS[@]}"; do
    echo "Testando comando: $cmd"
    curl -s "$SITE_URL/api/search?q=test$cmd" > "$OUTPUT_DIR/command-injection-test-$TIMESTAMP.txt"
done

echo "✅ Testes de command injection concluídos"

# ========================================
# TESTES DE CSRF
# ========================================
echo "🔄 Testando CSRF..."

# Teste de CSRF
curl -s -X POST "$SITE_URL/api/users/update" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"attacker@evil.com\"}" \
    -H "Referer: https://malicious-site.com" > "$OUTPUT_DIR/csrf-test-$TIMESTAMP.txt"

echo "✅ Testes de CSRF concluídos"

# ========================================
# TESTES DE SENSITIVE DATA EXPOSURE
# ========================================
echo "🔍 Testando exposição de dados sensíveis..."

# Verificar se há dados sensíveis expostos
curl -s "$SITE_URL" | grep -E "(password|secret|key|token)" > "$OUTPUT_DIR/sensitive-data-test-$TIMESTAMP.txt"

# Verificar arquivos de configuração
curl -s "$SITE_URL/.env" > "$OUTPUT_DIR/env-exposure-test-$TIMESTAMP.txt"
curl -s "$SITE_URL/config.json" > "$OUTPUT_DIR/config-exposure-test-$TIMESTAMP.txt"

echo "✅ Testes de dados sensíveis concluídos"

# ========================================
# TESTES DE SSL/TLS
# ========================================
echo "🔐 Testando SSL/TLS..."

# Verificar certificado SSL
if [[ "$SITE_URL" == https://* ]]; then
    echo | openssl s_client -servername $(echo "$SITE_URL" | sed 's|https://||' | sed 's|/.*||') -connect $(echo "$SITE_URL" | sed 's|https://||' | sed 's|/.*||'):443 2>/dev/null | openssl x509 -noout -dates > "$OUTPUT_DIR/ssl-test-$TIMESTAMP.txt"
fi

echo "✅ Testes de SSL/TLS concluídos"

# ========================================
# TESTES DE LOGOUT
# ========================================
echo "🚪 Testando logout..."

# Teste de logout
curl -s -X POST "$SITE_URL/api/auth/logout" > "$OUTPUT_DIR/logout-test-$TIMESTAMP.txt"

# Verificar se sessão foi invalidada
curl -s "$SITE_URL/admin" > "$OUTPUT_DIR/session-invalidation-test-$TIMESTAMP.txt"

echo "✅ Testes de logout concluídos"

# ========================================
# TESTES DE VALIDAÇÃO DE INPUT
# ========================================
echo "✅ Testando validação de input..."

# Teste de input malicioso
MALICIOUS_INPUTS=("<script>alert('XSS')</script>" "'; DROP TABLE users; --" "../../../etc/passwd" "javascript:alert('XSS')")

for input in "${MALICIOUS_INPUTS[@]}"; do
    echo "Testando input: $input"
    curl -s -X POST "$SITE_URL/api/contact" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$input\",\"email\":\"$input\",\"message\":\"$input\"}" \
        >> "$OUTPUT_DIR/input-validation-test-$TIMESTAMP.txt"
done

echo "✅ Testes de validação de input concluídos"

# ========================================
# TESTES DE PERMISSÕES
# ========================================
echo "🔑 Testando permissões..."

# Teste de acesso a recursos protegidos
PROTECTED_ROUTES=("/admin" "/api/admin/users" "/api/admin/settings" "/admin/dashboard")

for route in "${PROTECTED_ROUTES[@]}"; do
    echo "Testando rota protegida: $route"
    curl -s "$SITE_URL$route" > "$OUTPUT_DIR/permissions-test-$TIMESTAMP.txt"
done

echo "✅ Testes de permissões concluídos"

# ========================================
# GERAR RELATÓRIO DE SEGURANÇA
# ========================================
echo "📋 Gerando relatório de segurança..."

cat > "$OUTPUT_DIR/security-report-$TIMESTAMP.md" << EOF
# Relatório de Segurança - Reservei Viagens
**Data:** $(date)
**URL:** $SITE_URL

## 🛡️ Resumo Executivo

### Vulnerabilidades Encontradas
- **Críticas:** [Verificar relatórios]
- **Altas:** [Verificar relatórios]
- **Médias:** [Verificar relatórios]
- **Baixas:** [Verificar relatórios]

### Status de Segurança
- **Headers de Segurança:** [Verificar security-headers]
- **Autenticação:** [Verificar auth tests]
- **Validação de Input:** [Verificar input validation]
- **Rate Limiting:** [Verificar rate limit tests]

## 📁 Arquivos de Teste
- NPM Audit: \`npm-audit-$TIMESTAMP.txt\`
- Security Headers: \`security-headers-$TIMESTAMP.txt\`
- SQL Injection: \`sql-injection-test-$TIMESTAMP.txt\`
- XSS Tests: \`xss-test-$TIMESTAMP.txt\`
- Brute Force: \`brute-force-test-$TIMESTAMP.txt\`
- Rate Limiting: \`rate-limit-test-$TIMESTAMP.txt\`
- CORS Tests: \`cors-test-$TIMESTAMP.txt\`
- Path Traversal: \`path-traversal-test-$TIMESTAMP.txt\`
- Command Injection: \`command-injection-test-$TIMESTAMP.txt\`
- CSRF Tests: \`csrf-test-$TIMESTAMP.txt\`
- Sensitive Data: \`sensitive-data-test-$TIMESTAMP.txt\`
- SSL/TLS: \`ssl-test-$TIMESTAMP.txt\`
- Logout: \`logout-test-$TIMESTAMP.txt\`
- Input Validation: \`input-validation-test-$TIMESTAMP.txt\`
- Permissions: \`permissions-test-$TIMESTAMP.txt\`

## 🚨 Recomendações
1. **Atualizar dependências vulneráveis**
2. **Implementar headers de segurança**
3. **Melhorar validação de input**
4. **Configurar rate limiting**
5. **Implementar CSRF protection**
6. **Auditar permissões de acesso**

## 🔧 Próximos Passos
1. Revisar todos os relatórios
2. Corrigir vulnerabilidades críticas
3. Implementar medidas de segurança
4. Re-executar testes após correções
5. Configurar monitoramento contínuo
EOF

echo "✅ Relatório de segurança gerado: $OUTPUT_DIR/security-report-$TIMESTAMP.md"

# ========================================
# ENVIAR NOTIFICAÇÕES
# ========================================
echo "📢 Enviando notificações de segurança..."

if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"🛡️ Testes de Segurança Concluídos\",
            \"attachments\": [{
                \"color\": \"warning\",
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
echo "🎉 Testes de segurança concluídos!"
echo "📁 Relatórios salvos em: $OUTPUT_DIR/"
echo "📋 Relatório principal: $OUTPUT_DIR/security-report-$TIMESTAMP.md"
echo "⏰ Duração: $(($SECONDS / 60)) minutos"

echo "✅ Script de testes de segurança finalizado" 