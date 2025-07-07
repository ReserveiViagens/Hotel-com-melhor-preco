# Guia de Deploy e Configuração - Reservei Viagens

## 🚀 Funcionalidades Implementadas

### ✅ Sistema Completo de Reservas
- Cadastro e gestão de hotéis, ingressos, atrações e promoções
- Sistema de reservas com controle de status
- Múltiplos gateways de pagamento (Mercado Pago, Pagarme, Stone, Stripe)
- Geração automática de vouchers em PDF
- Relatórios de vendas com filtros e exportação CSV

### ✅ Sistema de Autenticação
- Login e cadastro para clientes e administradores
- Autenticação JWT com middleware de proteção de rotas
- Sistema de recuperação de senha via email
- Hook personalizado para autenticação
- Layout administrativo com logout

### ✅ Integração com IA (OpenAI)
- Chat inteligente com contexto da Reservei Viagens
- Geração automática de descrições para produtos
- Análise de sentimento de avaliações
- Fallback para respostas baseadas em palavras-chave
- Integração com n8n para automações

### ✅ Banco de Dados PostgreSQL
- Schema completo com Prisma ORM
- Tabelas para usuários, reservas, tokens de reset e monitoramento
- Migrações automáticas
- Backup e restauração

### ✅ Monitoramento e Segurança
- Log de uso da API com estatísticas
- Middleware JWT para proteção de rotas
- Configurações centralizadas
- Limpeza automática de logs antigos

## 📋 Pré-requisitos

### 1. Banco de Dados PostgreSQL
```bash
# Instalar PostgreSQL
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql postgresql-server

# macOS
brew install postgresql

# Windows
# Baixar e instalar do site oficial: https://www.postgresql.org/download/windows/
```

### 2. Node.js e npm
```bash
# Verificar versões
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
```

### 3. Configurações de Email
- Conta Gmail com autenticação de 2 fatores ativada
- Senha de aplicativo gerada
- Ou servidor SMTP próprio

## 🔧 Configuração Inicial

### 1. Clonar e Instalar Dependências
```bash
git clone <seu-repositorio>
cd Hotel-com-melhor-preco
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp env.production.example .env.production

# Editar com suas configurações
nano .env.production
```

### 3. Configurar Banco de Dados
```bash
# Criar banco de dados
sudo -u postgres psql
CREATE DATABASE reservei_viagens;
CREATE USER reservei_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE reservei_viagens TO reservei_user;
\q

# Executar migrações
npx prisma migrate deploy
npx prisma generate
```

### 4. Configurar OpenAI
1. Acesse: https://platform.openai.com/api-keys
2. Crie uma nova chave de API
3. Adicione no arquivo `.env.production`:
```env
OPENAI_API_KEY="sk-sua-chave-aqui"
```

### 5. Configurar Email
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASS="sua-senha-de-aplicativo"
```

## 🚀 Deploy em Produção

### 1. Scripts de Deploy
```bash
# Build para produção
npm run production:build

# Iniciar servidor de produção
npm run production:start

# Deploy completo
npm run production:deploy
```

### 2. Configurar PM2 (Recomendado)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo de configuração
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'reservei-viagens',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Configurar Nginx (Opcional)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Configurações de Segurança

### 1. Chaves Secretas
```bash
# Gerar chave JWT segura
openssl rand -base64 32

# Gerar chave NextAuth
openssl rand -base64 32
```

### 2. Configurar HTTPS
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com
```

### 3. Firewall
```bash
# Configurar UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📊 Monitoramento

### 1. Logs da Aplicação
```bash
# Ver logs com PM2
pm2 logs reservei-viagens

# Ver logs do sistema
sudo journalctl -u pm2-root -f
```

### 2. Monitoramento de API
- Acesse: `/admin/monitoring` no painel administrativo
- Estatísticas de uso da API
- Top usuários
- Taxa de erro
- Tempo de resposta

### 3. Backup Automático
```bash
# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump reservei_viagens > backup_$DATE.sql
gzip backup_$DATE.sql
# Enviar para storage remoto
```

## 🔧 Manutenção

### 1. Atualizações
```bash
# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Executar migrações
npx prisma migrate deploy

# Reiniciar aplicação
pm2 restart reservei-viagens
```

### 2. Limpeza de Logs
```bash
# Limpar logs antigos (automático)
# Executado diariamente às 00:00

# Limpeza manual
npx prisma db execute --file cleanup-logs.sql
```

### 3. Backup e Restauração
```bash
# Backup
pg_dump reservei_viagens > backup.sql

# Restauração
psql reservei_viagens < backup.sql
```

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar DATABASE_URL
   - Verificar se PostgreSQL está rodando
   - Verificar permissões do usuário

2. **Erro de autenticação OpenAI**
   - Verificar OPENAI_API_KEY
   - Verificar créditos da conta
   - Verificar limites de uso

3. **Email não enviado**
   - Verificar configurações SMTP
   - Verificar senha de aplicativo
   - Verificar firewall

4. **Erro de JWT**
   - Verificar JWT_SECRET
   - Verificar expiração do token
   - Verificar formato do token

### Logs de Debug
```bash
# Habilitar logs detalhados
export DEBUG=*
npm run production:start
```

## 📞 Suporte

Para suporte técnico:
- Email: suporte@reserveiviagens.com
- Documentação: /docs
- Issues: GitHub Issues

---

**Reservei Viagens** - Sistema completo de reservas com IA 