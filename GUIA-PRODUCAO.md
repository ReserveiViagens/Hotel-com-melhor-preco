# 🚀 GUIA RÁPIDO PARA PRODUÇÃO - RESERVEI VIAGENS

## ⚡ Deploy em 5 Minutos

### 1. **Vercel (Recomendado)**
```bash
# 1. Acesse vercel.com
# 2. Conecte seu repositório GitHub
# 3. Configure as variáveis de ambiente
# 4. Deploy automático!
```

### 2. **Netlify**
```bash
# 1. Acesse netlify.com
# 2. Importe do GitHub
# 3. Build command: npm run build
# 4. Publish directory: .next
```

### 3. **Railway**
```bash
# 1. Acesse railway.app
# 2. Conecte o repositório
# 3. Configure variáveis
# 4. Deploy automático
```

---

## 🔧 Variáveis de Ambiente Essenciais

```env
# OBRIGATÓRIAS
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="https://seu-dominio.com"

# AUTENTICAÇÃO
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# PAGAMENTOS
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
MERCADOPAGO_ACCESS_TOKEN="TEST-..."

# IA E CHATBOT
OPENAI_API_KEY="sk-..."

# CACHE E PERFORMANCE
REDIS_URL="redis://localhost:6379"

# MONITORAMENTO
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
```

---

## 📊 Verificação Pós-Deploy

### ✅ **Testes Essenciais**
1. **Homepage carrega** - `https://seu-dominio.com`
2. **Login funciona** - Teste autenticação Google
3. **Painel admin** - `https://seu-dominio.com/admin`
4. **APIs respondem** - `https://seu-dominio.com/api/health`
5. **Chat funciona** - Teste o chatbot

### ✅ **Funcionalidades Críticas**
- [ ] Sistema de reservas
- [ ] Pagamentos (Stripe/MercadoPago)
- [ ] Upload de imagens
- [ ] Sistema de cupons
- [ ] Gamificação
- [ ] Monitoramento

---

## 🛠️ Comandos Úteis

### **Desenvolvimento**
```bash
npm run dev          # Servidor local
npm run build        # Build de produção
npm run start        # Servidor de produção local
```

### **Banco de Dados**
```bash
npx prisma db push   # Aplicar migrações
npx prisma generate  # Gerar cliente Prisma
npx prisma studio    # Interface visual do banco
```

### **Deploy**
```bash
node scripts/deploy-simple.js    # Deploy simplificado
node scripts/deploy-production.js # Deploy completo
```

---

## 📞 Suporte

### **Problemas Comuns**
1. **Erro de build** - Verifique variáveis de ambiente
2. **Banco não conecta** - Verifique DATABASE_URL
3. **Login não funciona** - Verifique Google OAuth
4. **Pagamentos falham** - Verifique chaves Stripe/MercadoPago

### **Logs e Debug**
- **Vercel**: Dashboard > Functions > Logs
- **Netlify**: Site settings > Functions > Logs
- **Railway**: Deployments > Logs

---

## 🎯 Próximos Passos

### **Imediatos**
1. ✅ Configurar domínio personalizado
2. ✅ Configurar SSL/HTTPS
3. ✅ Configurar Google Analytics
4. ✅ Testar todas as funcionalidades
5. ✅ Configurar backup automático

### **Opcionais**
1. 🔄 Migrar para PostgreSQL
2. 🔄 Configurar CDN
3. 🔄 Implementar PWA
4. 🔄 Configurar email marketing
5. 🔄 Implementar app mobile

---

## 📈 Monitoramento

### **Métricas Importantes**
- **Uptime**: > 99.9%
- **Tempo de resposta**: < 2s
- **Taxa de erro**: < 1%
- **Conversão**: > 3%

### **Alertas Configurados**
- ✅ Falha no servidor
- ✅ Tempo de resposta alto
- ✅ Erros de pagamento
- ✅ Falha no banco de dados

---

**Status**: ✅ PRONTO PARA PRODUÇÃO  
**Última atualização**: 7 de Julho de 2025 