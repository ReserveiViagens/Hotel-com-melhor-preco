#!/bin/bash

# ======================================
# SCRIPT DE MONITORAMENTO - RESERVEI VIAGENS
# ======================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Configurações
APP_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3000/admin"
LOG_FILE="logs/monitor.log"
ALERT_EMAIL="alerts@reserveiviagens.com.br"

# Criar diretório de logs se não existir
mkdir -p logs

# Função para log em arquivo
log_to_file() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Função para verificar se o processo está rodando
check_process() {
    if pgrep -f "next start" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Função para verificar resposta HTTP
check_http() {
    local url=$1
    local timeout=10
    
    if curl -f -s --max-time $timeout "$url" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Função para verificar uso de memória
check_memory() {
    local process_pid=$(pgrep -f "next start" | head -1)
    if [ -n "$process_pid" ]; then
        local memory_usage=$(ps -p "$process_pid" -o %mem --no-headers)
        echo "$memory_usage"
    else
        echo "0"
    fi
}

# Função para verificar uso de CPU
check_cpu() {
    local process_pid=$(pgrep -f "next start" | head -1)
    if [ -n "$process_pid" ]; then
        local cpu_usage=$(ps -p "$process_pid" -o %cpu --no-headers)
        echo "$cpu_usage"
    else
        echo "0"
    fi
}

# Função para verificar espaço em disco
check_disk() {
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    echo "$disk_usage"
}

# Função para enviar alerta
send_alert() {
    local message=$1
    local subject="[ALERTA] Reservei Viagens - $(date +'%Y-%m-%d %H:%M:%S')"
    
    # Log do alerta
    error "$message"
    log_to_file "ALERTA: $message"
    
    # Enviar email (se configurado)
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL" 2>/dev/null || true
    fi
    
    # Enviar para webhook (se configurado)
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST -H "Content-Type: application/json" \
             -d "{\"text\":\"$subject: $message\"}" \
             "$WEBHOOK_URL" 2>/dev/null || true
    fi
}

# Função principal de monitoramento
monitor_system() {
    log "🔍 Iniciando monitoramento do sistema..."
    
    # ======================================
    # 1. VERIFICAÇÃO DO PROCESSO
    # ======================================
    
    if check_process; then
        log "✅ Processo Next.js está rodando"
        log_to_file "STATUS: Processo OK"
    else
        send_alert "Processo Next.js não está rodando"
        return 1
    fi
    
    # ======================================
    # 2. VERIFICAÇÃO HTTP
    # ======================================
    
    if check_http "$APP_URL"; then
        log "✅ Site principal responde (HTTP 200)"
        log_to_file "STATUS: Site principal OK"
    else
        send_alert "Site principal não responde"
        return 1
    fi
    
    if check_http "$ADMIN_URL"; then
        log "✅ Painel administrativo responde"
        log_to_file "STATUS: Admin OK"
    else
        warn "Painel administrativo não responde (pode ser normal se não autenticado)"
        log_to_file "WARNING: Admin não responde"
    fi
    
    # ======================================
    # 3. VERIFICAÇÃO DE RECURSOS
    # ======================================
    
    # Memória
    local memory_usage=$(check_memory)
    if (( $(echo "$memory_usage > 80" | bc -l) )); then
        warn "Uso de memória alto: ${memory_usage}%"
        log_to_file "WARNING: Memória alta - ${memory_usage}%"
    else
        log "✅ Uso de memória: ${memory_usage}%"
        log_to_file "STATUS: Memória OK - ${memory_usage}%"
    fi
    
    # CPU
    local cpu_usage=$(check_cpu)
    if (( $(echo "$cpu_usage > 90" | bc -l) )); then
        warn "Uso de CPU alto: ${cpu_usage}%"
        log_to_file "WARNING: CPU alta - ${cpu_usage}%"
    else
        log "✅ Uso de CPU: ${cpu_usage}%"
        log_to_file "STATUS: CPU OK - ${cpu_usage}%"
    fi
    
    # Disco
    local disk_usage=$(check_disk)
    if [ "$disk_usage" -gt 90 ]; then
        send_alert "Espaço em disco crítico: ${disk_usage}%"
        log_to_file "ALERTA: Disco crítico - ${disk_usage}%"
    elif [ "$disk_usage" -gt 80 ]; then
        warn "Espaço em disco baixo: ${disk_usage}%"
        log_to_file "WARNING: Disco baixo - ${disk_usage}%"
    else
        log "✅ Espaço em disco: ${disk_usage}%"
        log_to_file "STATUS: Disco OK - ${disk_usage}%"
    fi
    
    # ======================================
    # 4. VERIFICAÇÃO DE LOGS
    # ======================================
    
    # Verificar erros recentes nos logs
    if [ -f "logs/app.log" ]; then
        local recent_errors=$(tail -100 logs/app.log | grep -i "error\|exception\|fatal" | wc -l)
        if [ "$recent_errors" -gt 10 ]; then
            warn "Muitos erros nos logs recentes: $recent_errors"
            log_to_file "WARNING: Muitos erros nos logs - $recent_errors"
        fi
    fi
    
    # ======================================
    # 5. VERIFICAÇÃO DE CONECTIVIDADE
    # ======================================
    
    # Verificar conectividade com internet
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        log "✅ Conectividade com internet OK"
        log_to_file "STATUS: Internet OK"
    else
        warn "Problemas de conectividade com internet"
        log_to_file "WARNING: Problemas de internet"
    fi
    
    # ======================================
    # 6. VERIFICAÇÃO DE APIS
    # ======================================
    
    # Verificar APIs críticas
    local apis=("/api/payments" "/api/vouchers/generate" "/api/reports/sales")
    
    for api in "${apis[@]}"; do
        if check_http "$APP_URL$api"; then
            log "✅ API $api responde"
            log_to_file "STATUS: API $api OK"
        else
            warn "API $api não responde"
            log_to_file "WARNING: API $api não responde"
        fi
    done
    
    return 0
}

# Função para monitoramento contínuo
monitor_continuous() {
    local interval=${1:-60}  # Intervalo em segundos (padrão: 60s)
    
    log "🔄 Iniciando monitoramento contínuo (intervalo: ${interval}s)"
    
    while true; do
        monitor_system
        
        if [ $? -eq 0 ]; then
            log "✅ Verificação concluída - aguardando próxima verificação..."
        else
            error "❌ Problemas detectados - aguardando próxima verificação..."
        fi
        
        sleep "$interval"
    done
}

# Função para gerar relatório
generate_report() {
    log "📊 Gerando relatório de status..."
    
    local report_file="logs/status_report_$(date +'%Y%m%d_%H%M%S').txt"
    
    cat > "$report_file" << EOF
==========================================
RELATÓRIO DE STATUS - RESERVEI VIAGENS
==========================================

Data: $(date)
Servidor: $(hostname)
Uptime: $(uptime)

=== STATUS DO PROCESSO ===
EOF
    
    if check_process; then
        echo "✅ Processo Next.js: RODANDO" >> "$report_file"
    else
        echo "❌ Processo Next.js: PARADO" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

=== STATUS HTTP ===
EOF
    
    if check_http "$APP_URL"; then
        echo "✅ Site principal: OK" >> "$report_file"
    else
        echo "❌ Site principal: ERRO" >> "$report_file"
    fi
    
    if check_http "$ADMIN_URL"; then
        echo "✅ Painel admin: OK" >> "$report_file"
    else
        echo "⚠️  Painel admin: NÃO RESPONDE" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

=== RECURSOS DO SISTEMA ===
Memória: $(check_memory)%
CPU: $(check_cpu)%
Disco: $(check_disk)%

=== LOGS RECENTES ===
EOF
    
    if [ -f "logs/app.log" ]; then
        tail -20 logs/app.log >> "$report_file"
    else
        echo "Nenhum log encontrado" >> "$report_file"
    fi
    
    log "✅ Relatório gerado: $report_file"
}

# Menu principal
case "${1:-help}" in
    "check")
        monitor_system
        ;;
    "continuous")
        monitor_continuous "${2:-60}"
        ;;
    "report")
        generate_report
        ;;
    "help"|*)
        echo ""
        echo "=========================================="
        echo "🔍 MONITORAMENTO - RESERVEI VIAGENS"
        echo "=========================================="
        echo ""
        echo "Uso: $0 [comando] [opções]"
        echo ""
        echo "Comandos:"
        echo "  check       - Verificação única"
        echo "  continuous  - Monitoramento contínuo"
        echo "  report      - Gerar relatório"
        echo "  help        - Mostrar esta ajuda"
        echo ""
        echo "Exemplos:"
        echo "  $0 check                    # Verificação única"
        echo "  $0 continuous 30            # Monitoramento a cada 30s"
        echo "  $0 report                   # Gerar relatório"
        echo ""
        echo "Logs: $LOG_FILE"
        echo ""
        ;;
esac 