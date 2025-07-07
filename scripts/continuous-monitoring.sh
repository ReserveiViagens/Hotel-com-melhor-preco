#!/bin/bash

# ========================================
# SCRIPT DE MONITORAMENTO CONTÍNUO - RESERVEI VIAGENS
# ========================================

set -e

echo "📊 Iniciando monitoramento contínuo 24/7..."

# ========================================
# CONFIGURAÇÕES
# ========================================
SITE_URL="${SITE_URL:-http://localhost:3000}"
MONITORING_DIR="monitoring-logs"
ALERT_THRESHOLD_RESPONSE_TIME=3000  # 3 segundos
ALERT_THRESHOLD_ERROR_RATE=5        # 5%
ALERT_THRESHOLD_CPU=80              # 80%
ALERT_THRESHOLD_MEMORY=85           # 85%

# Criar diretório de logs
mkdir -p "$MONITORING_DIR"

# ========================================
# FUNÇÕES DE MONITORAMENTO
# ========================================
send_alert() {
    local message="$1"
    local severity="$2"
    
    echo "[$(date)] $severity: $message" >> "$MONITORING_DIR/alerts.log"
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"$severity: $message\",
                \"attachments\": [{
                    \"color\": \"$([ \"$severity\" = \"CRÍTICO\" ] && echo \"danger\" || echo \"warning\")\",
                    \"fields\": [
                        {\"title\": \"Timestamp\", \"value\": \"$(date)\", \"short\": true},
                        {\"title\": \"URL\", \"value\": \"$SITE_URL\", \"short\": true}
                    ]
                }]
            }"
    fi
}

check_health() {
    local start_time=$(date +%s%3N)
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/api/health")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    echo "$(date),health,$response,$response_time" >> "$MONITORING_DIR/health.log"
    
    if [ "$response" != "200" ]; then
        send_alert "Health check falhou: $response" "CRÍTICO"
    fi
    
    if [ $response_time -gt $ALERT_THRESHOLD_RESPONSE_TIME ]; then
        send_alert "Tempo de resposta alto: ${response_time}ms" "ALERTA"
    fi
    
    return $response_time
}

check_performance() {
    local start_time=$(date +%s%3N)
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    echo "$(date),performance,$response,$response_time" >> "$MONITORING_DIR/performance.log"
    
    if [ $response_time -gt $ALERT_THRESHOLD_RESPONSE_TIME ]; then
        send_alert "Performance degradada: ${response_time}ms" "ALERTA"
    fi
}

check_database() {
    local db_status=$(curl -s "$SITE_URL/api/health/database" 2>/dev/null || echo "ERROR")
    
    echo "$(date),database,$db_status" >> "$MONITORING_DIR/database.log"
    
    if [ "$db_status" != "OK" ]; then
        send_alert "Problema no banco de dados: $db_status" "CRÍTICO"
    fi
}

check_cache() {
    local cache_status=$(curl -s "$SITE_URL/api/health/cache" 2>/dev/null || echo "ERROR")
    
    echo "$(date),cache,$cache_status" >> "$MONITORING_DIR/cache.log"
    
    if [ "$cache_status" != "OK" ]; then
        send_alert "Problema no cache: $cache_status" "ALERTA"
    fi
}

check_system_resources() {
    # CPU Usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    
    # Memory Usage
    local memory_usage=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
    
    # Disk Usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    
    echo "$(date),system,$cpu_usage,$memory_usage,$disk_usage" >> "$MONITORING_DIR/system.log"
    
    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        send_alert "CPU alto: ${cpu_usage}%" "ALERTA"
    fi
    
    if (( $(echo "$memory_usage > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
        send_alert "Memória alta: ${memory_usage}%" "ALERTA"
    fi
    
    if [ $disk_usage -gt 90 ]; then
        send_alert "Disco quase cheio: ${disk_usage}%" "CRÍTICO"
    fi
}

check_error_rate() {
    local total_requests=$(curl -s "$SITE_URL/api/metrics/requests" 2>/dev/null || echo "0")
    local error_requests=$(curl -s "$SITE_URL/api/metrics/errors" 2>/dev/null || echo "0")
    
    if [ "$total_requests" -gt 0 ]; then
        local error_rate=$(echo "scale=2; $error_requests * 100 / $total_requests" | bc -l)
        echo "$(date),errors,$total_requests,$error_requests,$error_rate" >> "$MONITORING_DIR/errors.log"
        
        if (( $(echo "$error_rate > $ALERT_THRESHOLD_ERROR_RATE" | bc -l) )); then
            send_alert "Taxa de erro alta: ${error_rate}%" "CRÍTICO"
        fi
    fi
}

check_security() {
    # Verificar tentativas de login suspeitas
    local failed_logins=$(curl -s "$SITE_URL/api/security/failed-logins" 2>/dev/null || echo "0")
    
    if [ "$failed_logins" -gt 10 ]; then
        send_alert "Muitas tentativas de login falhadas: $failed_logins" "ALERTA"
    fi
    
    # Verificar ataques detectados
    local attacks=$(curl -s "$SITE_URL/api/security/attacks" 2>/dev/null || echo "0")
    
    if [ "$attacks" -gt 0 ]; then
        send_alert "Ataques detectados: $attacks" "CRÍTICO"
    fi
}

check_backup() {
    local last_backup=$(curl -s "$SITE_URL/api/backup/last" 2>/dev/null || echo "ERROR")
    
    if [ "$last_backup" != "ERROR" ]; then
        local backup_age=$(($(date +%s) - $(date -d "$last_backup" +%s)))
        local backup_age_hours=$((backup_age / 3600))
        
        echo "$(date),backup,$last_backup,$backup_age_hours" >> "$MONITORING_DIR/backup.log"
        
        if [ $backup_age_hours -gt 24 ]; then
            send_alert "Backup desatualizado: ${backup_age_hours}h atrás" "ALERTA"
        fi
    fi
}

check_ssl_certificate() {
    if [[ "$SITE_URL" == https://* ]]; then
        local domain=$(echo "$SITE_URL" | sed 's|https://||' | sed 's|/.*||')
        local cert_expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
        
        if [ -n "$cert_expiry" ]; then
            local expiry_date=$(date -d "$cert_expiry" +%s)
            local current_date=$(date +%s)
            local days_until_expiry=$(( (expiry_date - current_date) / 86400 ))
            
            echo "$(date),ssl,$cert_expiry,$days_until_expiry" >> "$MONITORING_DIR/ssl.log"
            
            if [ $days_until_expiry -lt 30 ]; then
                send_alert "Certificado SSL expira em ${days_until_expiry} dias" "ALERTA"
            fi
        fi
    fi
}

generate_daily_report() {
    local report_date=$(date +"%Y-%m-%d")
    local report_file="$MONITORING_DIR/daily-report-$report_date.md"
    
    cat > "$report_file" << EOF
# Relatório Diário de Monitoramento - $report_date

## 📊 Métricas Gerais
- **Uptime:** [Calcular]
- **Tempo médio de resposta:** [Calcular]
- **Taxa de erro:** [Calcular]
- **Requisições totais:** [Calcular]

## 🚨 Alertas
$(grep "$report_date" "$MONITORING_DIR/alerts.log" | head -10)

## 📈 Performance
- **CPU médio:** [Calcular]
- **Memória média:** [Calcular]
- **Disco usado:** [Calcular]

## 🔒 Segurança
- **Tentativas de login falhadas:** [Calcular]
- **Ataques detectados:** [Calcular]

## 💾 Backup
- **Último backup:** [Verificar]
- **Status:** [Verificar]

## 🔐 SSL
- **Certificado:** [Verificar]
- **Expira em:** [Verificar]
EOF

    echo "📋 Relatório diário gerado: $report_file"
}

# ========================================
# LOOP PRINCIPAL DE MONITORAMENTO
# ========================================
echo "🔄 Iniciando loop de monitoramento..."

while true; do
    echo "[$(date)] Executando verificações..."
    
    # Verificações básicas
    check_health
    check_performance
    check_database
    check_cache
    
    # Verificações de sistema
    check_system_resources
    check_error_rate
    
    # Verificações de segurança
    check_security
    
    # Verificações de infraestrutura
    check_backup
    check_ssl_certificate
    
    # Gerar relatório diário às 00:00
    if [ "$(date +%H:%M)" = "00:00" ]; then
        generate_daily_report
    fi
    
    # Limpar logs antigos (manter apenas 7 dias)
    find "$MONITORING_DIR" -name "*.log" -mtime +7 -delete
    
    echo "[$(date)] Verificações concluídas. Aguardando 60 segundos..."
    sleep 60
done 