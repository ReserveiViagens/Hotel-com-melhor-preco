# 🚀 Guia de Produção - Reservei Viagens

## 📋 Visão Geral

Este guia fornece instruções completas para colocar o sistema Reservei Viagens em produção de forma segura e otimizada.

---

## 🛠️ Pré-requisitos

### **Servidor**
- **Sistema Operacional**: Ubuntu 20.04+ ou CentOS 8+
- **RAM**: Mínimo 2GB (recomendado 4GB+)
- **CPU**: 2 cores (recomendado 4 cores+)
- **Disco**: 20GB+ de espaço livre
- **Rede**: IP público com acesso à internet

### **Software**
- **Node.js**: Versão 18+ (LTS)
- **npm/pnpm**: Gerenciador de pacotes
- **Git**: Controle de versão
- **Nginx/Apache**: Servidor web
- **PostgreSQL**: Banco de dados (recomendado)
- **SSL**: Certificado HTTPS

---

## 📦 Instalação do Sistema

### **1. Preparar o Servidor**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar dependências
sudo apt install -y git nginx postgresql postgresql-contrib

# Verificar instalações
node --version
npm --version
git --version
```

### **2. Clonar o Projeto**

```bash
# Criar diretório do projeto
sudo mkdir -p /var/www/reservei-viagens
sudo chown $USER:$USER /var/www/reservei-viagens
cd /var/www/reservei-viagens

# Clonar repositório
git clone https://github.com/seu-usuario/Hotel-com-melhor-preco.git .
```

### **3. Configurar Variáveis de Ambiente**

```bash
# Copiar arquivo de exemplo
cp env.production.example .env.production

# Editar configurações
nano .env.production
```

**Configurações Obrigatórias:**
```env
NODE_ENV=production
JWT_SECRET=sua_chave_super_secreta_aqui_min_32_caracteres_para_producao_2025
DATABASE_URL=postgresql://usuario:senha@localhost:5432/reservei_viagens
NEXT_PUBLIC_BASE_URL=https://reserveiviagens.com.br
```

### **4. Configurar Banco de Dados**

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE reservei_viagens;
CREATE USER reservei_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE reservei_viagens TO reservei_user;
\q
```

### **5. Instalar Dependências e Build**

```bash
# Instalar dependências
npm ci

# Build de produção
npm run build

# Testar build
npm start
```

---

## 🌐 Configuração do Servidor Web

### **Nginx (Recomendado)**

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/reservei-viagens
```

**Conteúdo da configuração:**
```nginx
server {
    listen 80;
    server_name reserveiviagens.com.br www.reserveiviagens.com.br;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name reserveiviagens.com.br www.reserveiviagens.com.br;
    
    # SSL (configurar com Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/reserveiviagens.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reserveiviagens.com.br/privkey.pem;
    
    # Configurações de segurança
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Headers de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Diretório raiz
    root /var/www/reservei-viagens;
    
    # Logs
    access_log /var/log/nginx/reservei-viagens.access.log;
    error_log /var/log/nginx/reservei-viagens.error.log;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Proxy para Next.js
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
        proxy_read_timeout 86400;
    }
    
    # Cache para arquivos estáticos
    location /_next/static/ {
        alias /var/www/reservei-viagens/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Cache para imagens
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/reservei-viagens /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **SSL com Let's Encrypt**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d reserveiviagens.com.br -d www.reserveiviagens.com.br

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 Configuração do PM2

### **Instalar e Configurar PM2**

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Criar arquivo de configuração
nano ecosystem.config.js
```

**Conteúdo do ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'reservei-viagens',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/reservei-viagens',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar startup automático
pm2 startup
```

---

## 📊 Monitoramento e Logs

### **Scripts de Monitoramento**

```bash
# Dar permissão aos scripts
chmod +x scripts/*.sh

# Verificação única
./scripts/monitor.sh check

# Monitoramento contínuo
./scripts/monitor.sh continuous 60

# Gerar relatório
./scripts/monitor.sh report
```

### **Logs do Sistema**

```bash
# Ver logs da aplicação
pm2 logs reservei-viagens

# Ver logs do Nginx
sudo tail -f /var/log/nginx/reservei-viagens.access.log
sudo tail -f /var/log/nginx/reservei-viagens.error.log

# Ver logs do sistema
sudo journalctl -u nginx -f
```

---

## 💾 Backup e Manutenção

### **Backup Automático**

```bash
# Executar backup manual
./scripts/backup.sh

# Configurar backup automático
crontab -e
# Adicionar: 0 2 * * * /var/www/reservei-viagens/scripts/backup.sh
```

### **Atualizações**

```bash
# Parar aplicação
pm2 stop reservei-viagens

# Backup antes da atualização
./scripts/backup.sh

# Atualizar código
git pull origin main

# Instalar dependências
npm ci

# Build de produção
npm run build

# Reiniciar aplicação
pm2 restart reservei-viagens

# Verificar status
pm2 status
```

---

## 🔐 Segurança

### **Firewall**

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000
sudo ufw enable
```

### **Usuários e Permissões**

```bash
# Criar usuário dedicado
sudo adduser reservei
sudo usermod -aG sudo reservei

# Configurar permissões
sudo chown -R reservei:reservei /var/www/reservei-viagens
sudo chmod -R 755 /var/www/reservei-viagens
sudo chmod 600 /var/www/reservei-viagens/.env.production
```

### **Configurações de Segurança**

```bash
# Desabilitar login root
sudo passwd -l root

# Configurar SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
sudo systemctl restart ssh
```

---

## 🚀 Deploy Automatizado

### **Script de Deploy**

```bash
# Executar deploy completo
./scripts/deploy.sh

# Ou usar npm scripts
npm run deploy
```

### **CI/CD com GitHub Actions**

Criar `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/reservei-viagens
          git pull origin main
          npm ci
          npm run build
          pm2 restart reservei-viagens
```

---

## 📈 Performance e Otimização

### **Otimizações do Next.js**

```javascript
// next.config.mjs
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  },
  images: {
    domains: ['reserveiviagens.com.br'],
    formats: ['image/webp', 'image/avif']
  }
}
```

### **Cache e CDN**

```bash
# Configurar cache no Nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔍 Troubleshooting

### **Problemas Comuns**

**1. Aplicação não inicia**
```bash
# Verificar logs
pm2 logs reservei-viagens
tail -f logs/app.log

# Verificar variáveis de ambiente
cat .env.production

# Verificar porta
netstat -tlnp | grep :3000
```

**2. Erro de banco de dados**
```bash
# Verificar conexão PostgreSQL
sudo -u postgres psql -d reservei_viagens

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**3. Problemas de SSL**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew --dry-run
```

### **Comandos Úteis**

```bash
# Status do sistema
pm2 status
systemctl status nginx
systemctl status postgresql

# Logs em tempo real
pm2 logs --lines 100
sudo journalctl -f

# Verificar recursos
htop
df -h
free -h
```

---

## 📞 Suporte

### **Contatos de Emergência**
- **Email**: suporte@reserveiviagens.com.br
- **WhatsApp**: (64) 9 9999-9999
- **Horário**: 24/7 para emergências

### **Documentação Adicional**
- [Manual do Sistema](./SISTEMA-ADMINISTRATIVO.md)
- [Configurações de Ambiente](./VARIAVEIS-AMBIENTE.md)
- [Implementações Completas](./IMPLEMENTACOES-COMPLETAS.md)

---

## ✅ Checklist de Produção

- [ ] Servidor configurado com Node.js 18+
- [ ] Banco de dados PostgreSQL configurado
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/HTTPS configurado
- [ ] Nginx configurado como proxy reverso
- [ ] PM2 configurado para gerenciar processo
- [ ] Scripts de backup configurados
- [ ] Monitoramento ativo
- [ ] Firewall configurado
- [ ] Usuários e permissões configurados
- [ ] Logs configurados
- [ ] Testes de funcionalidade realizados
- [ ] Documentação atualizada

---

**🎉 Sistema pronto para produção!**

*Última atualização: Janeiro 2025*  
*Versão: 2.0* 