#!/bin/bash

# ======================================
# SCRIPT DE BACKUP - RESERVEI VIAGENS
# ======================================

set -e

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

# Configurações
BACKUP_DIR="./backups"
DATE=$(date +'%Y%m%d_%H%M%S')
RETENTION_DAYS=30

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

log "💾 Iniciando backup do sistema..."

# ======================================
# 1. BACKUP DO BANCO DE DADOS
# ======================================

log "🗄️  Fazendo backup do banco de dados..."

# Verificar se é PostgreSQL ou SQLite
if grep -q "postgresql://" .env.production 2>/dev/null; then
    # PostgreSQL
    DB_URL=$(grep "DATABASE_URL" .env.production | cut -d'=' -f2)
    
    if command -v pg_dump &> /dev/null; then
        # Extrair informações da URL
        DB_HOST=$(echo $DB_URL | sed 's/.*@\([^:]*\).*/\1/')
        DB_PORT=$(echo $DB_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
        DB_NAME=$(echo $DB_URL | sed 's/.*\///')
        DB_USER=$(echo $DB_URL | sed 's/.*:\/\/\([^:]*\):.*/\1/')
        DB_PASS=$(echo $DB_URL | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/')
        
        # Backup PostgreSQL
        PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/database_$DATE.sql"
        log "✅ Backup PostgreSQL criado: database_$DATE.sql"
    else
        warn "pg_dump não encontrado. Instale o PostgreSQL client."
    fi
else
    # SQLite
    if [ -f "dev.db" ]; then
        cp dev.db "$BACKUP_DIR/database_$DATE.db"
        log "✅ Backup SQLite criado: database_$DATE.db"
    else
        warn "Arquivo de banco SQLite não encontrado"
    fi
fi

# ======================================
# 2. BACKUP DE ARQUIVOS IMPORTANTES
# ======================================

log "📁 Fazendo backup de arquivos importantes..."

# Backup do .env
if [ -f ".env.production" ]; then
    cp .env.production "$BACKUP_DIR/env_production_$DATE.env"
    log "✅ Backup .env.production criado"
fi

# Backup de logs
if [ -d "logs" ]; then
    tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" logs/
    log "✅ Backup de logs criado: logs_$DATE.tar.gz"
fi

# Backup de uploads (se existir)
if [ -d "uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" uploads/
    log "✅ Backup de uploads criado: uploads_$DATE.tar.gz"
fi

# ======================================
# 3. BACKUP DE CONFIGURAÇÕES
# ======================================

log "⚙️  Fazendo backup de configurações..."

# Criar arquivo de configurações
cat > "$BACKUP_DIR/config_$DATE.txt" << EOF
=== CONFIGURAÇÃO DO SISTEMA - $DATE ===

Versão do Node.js: $(node -v)
Versão do npm: $(npm -v)
Data do backup: $(date)

=== ARQUIVOS DE CONFIGURAÇÃO ===
$(ls -la *.json *.js *.ts 2>/dev/null | head -10)

=== VARIÁVEIS DE AMBIENTE ===
$(grep -v "^#" .env.production 2>/dev/null | head -10)

=== DEPENDÊNCIAS ===
$(npm list --depth=0 2>/dev/null | head -10)
EOF

log "✅ Backup de configurações criado: config_$DATE.txt"

# ======================================
# 4. COMPRESSÃO E ORGANIZAÇÃO
# ======================================

log "🗜️  Comprimindo backups..."

# Criar backup completo
cd "$BACKUP_DIR"
tar -czf "backup_completo_$DATE.tar.gz" \
    database_$DATE.* \
    env_production_$DATE.env \
    logs_$DATE.tar.gz \
    uploads_$DATE.tar.gz \
    config_$DATE.txt 2>/dev/null || true

log "✅ Backup completo criado: backup_completo_$DATE.tar.gz"

# Voltar ao diretório original
cd ..

# ======================================
# 5. LIMPEZA DE BACKUPS ANTIGOS
# ======================================

log "🧹 Limpando backups antigos..."

# Remover backups mais antigos que RETENTION_DAYS
find "$BACKUP_DIR" -name "backup_*" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "database_*" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "env_*" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "logs_*" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "uploads_*" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "config_*" -type f -mtime +$RETENTION_DAYS -delete

log "✅ Limpeza concluída"

# ======================================
# 6. VERIFICAÇÃO DO BACKUP
# ======================================

log "🔍 Verificando integridade do backup..."

# Verificar se o backup foi criado
if [ -f "$BACKUP_DIR/backup_completo_$DATE.tar.gz" ]; then
    SIZE=$(du -h "$BACKUP_DIR/backup_completo_$DATE.tar.gz" | cut -f1)
    log "✅ Backup verificado: $SIZE"
else
    warn "Backup completo não foi criado"
fi

# ======================================
# 7. RELATÓRIO FINAL
# ======================================

echo ""
echo "=========================================="
echo "💾 BACKUP CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo ""
echo "📊 Informações do Backup:"
echo "   • Data: $(date)"
echo "   • Diretório: $BACKUP_DIR"
echo "   • Arquivo: backup_completo_$DATE.tar.gz"
echo "   • Tamanho: $SIZE"
echo ""
echo "📁 Arquivos incluídos:"
echo "   • Banco de dados"
echo "   • Configurações (.env)"
echo "   • Logs do sistema"
echo "   • Uploads (se existir)"
echo "   • Configurações do sistema"
echo ""
echo "🗑️  Retenção: $RETENTION_DAYS dias"
echo ""

# Listar backups disponíveis
echo "📋 Backups disponíveis:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -5 || echo "   Nenhum backup encontrado"

echo ""
echo "=========================================="

log "✅ Backup concluído com sucesso!" 