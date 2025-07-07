# 🔐 Configuração de Variáveis de Ambiente - Reservei Viagens

## 📋 Visão Geral

Este documento explica todas as variáveis de ambiente necessárias para configurar o sistema Reservei Viagens corretamente.

---

## 📝 Arquivo .env.local

### 1. **Criar o Arquivo**

```bash
# Na raiz do projeto, crie o arquivo .env.local:
touch .env.local

# Ou copie do exemplo (se existir):
cp .env.example .env.local
```

### 2. **Configuração Básica (Mínima)**

```env
# ======================================
# CONFIGURAÇÃO MÍNIMA PARA FUNCIONAR
# ======================================

# Ambiente
NODE_ENV=development

# Sem essas variáveis, o sistema funcionará em modo mock
# (chat funcionará normalmente, mas sem N8N)
```

---

## 🔌 Configurações do N8N

### **Variáveis Obrigatórias (para chat avançado)**

```env
# ======================================
# N8N INTEGRATION - CHAT AVANÇADO
# ======================================

# URL do webhook do N8N (servidor side - segura)
N8N_WEBHOOK_URL=https://sua-instancia-n8n.com/webhook/reservei-chat

# API Key do N8N (opcional - apenas se usar autenticação)
N8N_API_KEY=sua-api-key-opcional

# URL pública do webhook (client side - visível no browser)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://sua-instancia-n8n.com/webhook/reservei-chat
```

### **Como Obter as URLs do N8N**

#### N8N Cloud:
1. Acesse [n8n.cloud](https://n8n.cloud)
2. Crie um workspace
3. URL será: `https://seu-workspace.app.n8n.cloud`
4. Webhook será: `https://seu-workspace.app.n8n.cloud/webhook/reservei-chat`

#### N8N Self-hosted:
1. Configure seu domínio (ex: `n8n.reserveiviagens.com.br`)
2. URL será: `https://n8n.reserveiviagens.com.br/webhook/reservei-chat`

#### N8N Local (desenvolvimento):
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/reservei-chat
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/reservei-chat
```

---

## 📅 Integração Google Calendar

### **Variáveis para Google Calendar**

```env
# ======================================
# GOOGLE CALENDAR INTEGRATION
# ======================================

# Credenciais da conta de serviço (JSON como string)
GOOGLE_CALENDAR_CREDENTIALS={"type":"service_account","project_id":"reservei-viagens-123","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"reservei-calendar@reservei-viagens-123.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token"}

# ID da agenda do Google Calendar
GOOGLE_CALENDAR_ID=primary
# OU ID de agenda específica:
# GOOGLE_CALENDAR_ID=c_1234567890abcdef@group.calendar.google.com
```

### **Como Configurar Google Calendar**

1. **Criar Projeto no Google Cloud:**
   - Acesse [console.cloud.google.com](https://console.cloud.google.com)
   - Crie projeto: "Reservei Viagens N8N"
   - Ative Google Calendar API

2. **Criar Conta de Serviço:**
   - IAM & Admin > Service Accounts
   - Create Service Account: `reservei-calendar`
   - Baixe credenciais JSON

3. **Configurar Agenda:**
   - Abra Google Calendar
   - Crie agenda: "Reservas Reservei Viagens"
   - Compartilhe com email da conta de serviço (editor)

4. **Adicionar ao .env.local:**
   ```env
   GOOGLE_CALENDAR_CREDENTIALS={"type":"service_account",...}
   GOOGLE_CALENDAR_ID=sua_agenda_id
   ```

---

## 📧 Configurações de Email

### **SMTP para Notificações**

```env
# ======================================
# EMAIL NOTIFICATIONS
# ======================================

# Configurações do servidor SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=reservas@reserveiviagens.com.br
SMTP_PASS=sua_senha_de_app

# Email de destino para notificações
NOTIFICATION_EMAIL=gestao@reserveiviagens.com.br

# Email de origem (deve ser o mesmo do SMTP_USER)
FROM_EMAIL=reservas@reserveiviagens.com.br
```

### **Configuração Gmail/Google Workspace**

1. **Ativar 2FA** na conta Google
2. **Gerar senha de app:**
   - Google Account > Security > 2-Step Verification
   - App passwords > Generate
3. **Usar senha gerada** no `SMTP_PASS`

### **Outras Opções de SMTP**

#### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua_api_key_sendgrid
```

#### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.seudominio.com
SMTP_PASS=sua_senha_mailgun
```

---

## 📊 Analytics e Monitoramento

### **Google Analytics**

```env
# ======================================
# ANALYTICS
# ======================================

# Google Analytics 4 ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Tag Manager (opcional)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### **Outras Ferramentas de Analytics**

```env
# Hotjar (heatmaps)
NEXT_PUBLIC_HOTJAR_ID=123456

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345

# Google Ads Conversion
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-123456789
```

---

## 🔒 Configurações de Segurança

### **Chaves de Criptografia**

```env
# ======================================
# SECURITY
# ======================================

# Chave secreta para JWT (se usar autenticação)
JWT_SECRET=sua_chave_super_secreta_aqui_min_32_caracteres

# Chave para criptografia de dados sensíveis
ENCRYPTION_KEY=sua_chave_de_criptografia_256_bits
```

### **Rate Limiting**

```env
# Limite de requests por IP
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000  # 15 minutos em ms

# Limite específico para chat
CHAT_RATE_LIMIT_MAX=30
CHAT_RATE_LIMIT_WINDOW=60000  # 1 minuto em ms
```

---

## 🌐 Configurações de Deploy

### **Vercel (Produção)**

```env
# ======================================
# VERCEL DEPLOYMENT
# ======================================

# URL base do site
NEXT_PUBLIC_SITE_URL=https://reserveiviagens.com.br

# Vercel URL (automática)
VERCEL_URL=reserveiviagens.vercel.app

# Ambiente
VERCEL_ENV=production
```

### **Outros Provedores**

#### Netlify:
```env
NEXT_PUBLIC_SITE_URL=https://reserveiviagens.netlify.app
NETLIFY_SITE_ID=seu_site_id
```

#### Railway:
```env
RAILWAY_ENVIRONMENT=production
RAILWAY_SERVICE_NAME=reservei-viagens
```

---

## 🧪 Configurações de Desenvolvimento

### **Desenvolvimento Local**

```env
# ======================================
# DEVELOPMENT ONLY
# ======================================

# Debug mode
DEBUG=true
NODE_ENV=development

# Logs detalhados
LOG_LEVEL=debug

# Disable SSL verification (apenas local)
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### **Teste e Staging**

```env
# Ambiente de teste
NODE_ENV=staging
NEXT_PUBLIC_SITE_URL=https://staging.reserveiviagens.com.br

# Base de dados de teste
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/reservei_test

# N8N de teste
N8N_WEBHOOK_URL=https://test-n8n.reserveiviagens.com.br/webhook/reservei-chat
```

---

## 📋 Templates Prontos

### **Template 1: Desenvolvimento Local (Sem N8N)**

```env
# Arquivo: .env.local
NODE_ENV=development
DEBUG=true

# Chat funcionará em modo mock
# Não precisa de outras configurações
```

### **Template 2: Desenvolvimento com N8N Local**

```env
# Arquivo: .env.local
NODE_ENV=development

# N8N Local
N8N_WEBHOOK_URL=http://localhost:5678/webhook/reservei-chat
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/reservei-chat

# Email local (opcional)
SMTP_HOST=localhost
SMTP_PORT=1025
```

### **Template 3: Produção Completa**

```env
# Arquivo: .env.local (produção)
NODE_ENV=production

# N8N Produção
N8N_WEBHOOK_URL=https://n8n.reserveiviagens.com.br/webhook/reservei-chat
N8N_API_KEY=sua_api_key_producao
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.reserveiviagens.com.br/webhook/reservei-chat

# Google Calendar
GOOGLE_CALENDAR_CREDENTIALS={"type":"service_account",...}
GOOGLE_CALENDAR_ID=c_agenda_producao@group.calendar.google.com

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=reservas@reserveiviagens.com.br
SMTP_PASS=senha_de_app_gmail
NOTIFICATION_EMAIL=gestao@reserveiviagens.com.br

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Site
NEXT_PUBLIC_SITE_URL=https://reserveiviagens.com.br
```

---

## 🔍 Verificação e Troubleshooting

### **Script de Verificação**

```bash
# scripts/check-env.sh
#!/bin/bash

echo "🔍 Verificando configuração de variáveis..."

# Verificar .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Arquivo .env.local não encontrado"
    echo "💡 Crie com: touch .env.local"
    exit 1
fi

# Carregar variáveis
source .env.local

# Verificar N8N
if [ -n "$N8N_WEBHOOK_URL" ]; then
    echo "✅ N8N_WEBHOOK_URL configurado"
    
    # Testar conexão
    if curl -s "$N8N_WEBHOOK_URL" > /dev/null; then
        echo "✅ N8N webhook acessível"
    else
        echo "⚠️ N8N webhook não acessível (pode estar offline)"
    fi
else
    echo "⚠️ N8N não configurado - modo mock ativo"
fi

# Verificar Google Calendar
if [ -n "$GOOGLE_CALENDAR_CREDENTIALS" ]; then
    echo "✅ Google Calendar configurado"
else
    echo "⚠️ Google Calendar não configurado"
fi

# Verificar SMTP
if [ -n "$SMTP_HOST" ]; then
    echo "✅ SMTP configurado"
else
    echo "⚠️ SMTP não configurado"
fi

echo "🎉 Verificação concluída!"
```

### **Problemas Comuns**

#### Chat não funciona:
```bash
# Verificar se variáveis estão carregadas
echo $N8N_WEBHOOK_URL
echo $NEXT_PUBLIC_N8N_WEBHOOK_URL

# Testar webhook
curl -X POST $N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### Google Calendar não cria eventos:
```bash
# Verificar credenciais
echo $GOOGLE_CALENDAR_CREDENTIALS | jq .

# Verificar ID da agenda
echo $GOOGLE_CALENDAR_ID
```

#### Email não envia:
```bash
# Testar conexão SMTP
telnet $SMTP_HOST $SMTP_PORT
```

---

## ✅ Checklist de Configuração

### **Desenvolvimento Local**
- [ ] Arquivo `.env.local` criado
- [ ] `NODE_ENV=development` definido
- [ ] Chat funcionando (modo mock ou N8N)
- [ ] Servidor iniciando sem erros

### **Produção Básica**
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_SITE_URL` correto
- [ ] SSL/HTTPS configurado
- [ ] Analytics configurado

### **Produção Completa**
- [ ] N8N configurado e testado
- [ ] Google Calendar funcionando
- [ ] Email notifications ativas
- [ ] Monitoramento configurado
- [ ] Backup das configurações feito

---

**Última Atualização**: 2025-01-20  
**Próximo**: [Testes do Sistema](./TESTE-DO-SISTEMA.md) 