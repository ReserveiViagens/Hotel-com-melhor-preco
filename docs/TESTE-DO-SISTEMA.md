# 🧪 Guia de Teste do Sistema - Reservei Viagens

## 📋 Índice

1. [Testes de Funcionamento Básico](#testes-de-funcionamento-básico)
2. [Testes do Chat Agent](#testes-do-chat-agent)
3. [Testes de Responsividade](#testes-de-responsividade)
4. [Testes de Performance](#testes-de-performance)
5. [Testes de Integração N8N](#testes-de-integração-n8n)
6. [Testes de Acessibilidade](#testes-de-acessibilidade)
7. [Scripts de Teste Automatizados](#scripts-de-teste-automatizados)

---

## 🚀 Testes de Funcionamento Básico

### 1. **Setup Inicial**

#### Verificação do Ambiente
```bash
# 1. Verificar versões
node --version    # Deve ser 18+
npm --version     # Deve funcionar

# 2. Iniciar servidor
npm run dev       # Deve abrir em http://localhost:3000

# 3. Verificar no navegador
# - Página carrega sem erros
# - Console não mostra erros críticos (F12)
# - Loading screen aparece primeiro
```

#### ✅ **Checklist Básico**
- [ ] Página carrega em menos de 3 segundos
- [ ] Loading animado aparece e desaparece
- [ ] Logo da Reservei Viagens visível
- [ ] Menu de categorias funcional
- [ ] Não há erros no console (F12)

### 2. **Navegação Principal**

#### Teste de Links
```bash
# URLs a testar:
http://localhost:3000/           # Página inicial
http://localhost:3000/hoteis     # Página de hotéis
http://localhost:3000/ingressos  # Página de ingressos
http://localhost:3000/atracoes   # Página de atrações
http://localhost:3000/promocoes  # Página de promoções
http://localhost:3000/contato    # Página de contato
```

#### ✅ **Checklist de Navegação**
- [ ] Todos os links do header funcionam
- [ ] Menu inferior (mobile) responde
- [ ] Botão "Voltar" funciona em todas as páginas
- [ ] Scroll suave funciona
- [ ] Botão "Topo da página" aparece e funciona

---

## 💬 Testes do Chat Agent

### 1. **Testes Básicos do Chat**

#### Inicialização
```
1. Abrir página inicial
2. Localizar botão roxo do chat (canto inferior esquerdo)
3. Clicar no botão
4. Verificar se chat abre com mensagem de boas-vindas
```

#### ✅ **Checklist de Inicialização**
- [ ] Botão do chat visível
- [ ] Chat abre ao clicar
- [ ] Mensagem de boas-vindas da Serena aparece
- [ ] Status "online" (verde) visível
- [ ] Campo de texto habilitado

### 2. **Testes de Conversação**

#### Teste 1: Saudação Básica
```
Digite: "Olá"
Resposta esperada: Saudação amigável da Serena
```

#### Teste 2: Pergunta sobre Hotéis
```
Digite: "Quais hotéis vocês têm?"
Resposta esperada: Lista com hotéis DiRoma, preços e características
```

#### Teste 3: Pergunta sobre Parques
```
Digite: "Quero ingressos para parques"
Resposta esperada: Lista de parques com preços e descontos
```

#### Teste 4: Solicitação de Reserva
```
Digite: "Quero fazer uma reserva"
Resposta esperada: Formulário de agendamento deve aparecer
```

#### ✅ **Checklist de Conversação**
- [ ] Chat responde a todas as mensagens
- [ ] Respostas são contextuais e relevantes
- [ ] Tempo de resposta < 3 segundos
- [ ] Animação de "digitando" funciona
- [ ] Histórico de mensagens mantido

### 3. **Teste do Formulário de Agendamento**

#### Fluxo Completo
```
1. Digite: "Quero fazer uma reserva"
2. Formulário deve aparecer
3. Preencher campos:
   - Check-in: [data futura]
   - Check-out: [data posterior ao check-in]
   - Adultos: 2
   - Crianças: 1
   - Bebês: 0
4. Clicar "Confirmar Agendamento"
5. Verificar mensagem de confirmação
```

#### ✅ **Checklist do Formulário**
- [ ] Formulário aparece após solicitação
- [ ] Validação de datas funciona
- [ ] Contadores de pessoas funcionam
- [ ] Cálculo de dias automático
- [ ] Confirmação gera resposta positiva
- [ ] Dados são mantidos na conversa

### 4. **Teste de Transfer para WhatsApp**

#### Fluxo de Transferência
```
1. Conversar por 3-4 mensagens
2. Aguardar aparecer opção de WhatsApp
3. Clicar "Continuar no WhatsApp"
4. Verificar se abre WhatsApp com dados preenchidos
```

#### ✅ **Checklist WhatsApp**
- [ ] Opção aparece após algumas mensagens
- [ ] Link abre WhatsApp/WhatsApp Web
- [ ] Mensagem contém dados da conversa
- [ ] Números de telefone corretos
- [ ] Dados de agendamento incluídos (se preenchidos)

---

## 📱 Testes de Responsividade

### 1. **Breakpoints a Testar**

#### Dispositivos Mobile
```
- iPhone SE (375x667)
- iPhone 12 (390x844)
- Galaxy S21 (360x800)
- Pixel 5 (393x851)
```

#### Tablets
```
- iPad (768x1024)
- iPad Pro (1024x1366)
- Galaxy Tab (800x1280)
```

#### Desktop
```
- Laptop (1366x768)
- Desktop (1920x1080)
- Ultrawide (2560x1440)
```

### 2. **Elementos a Verificar**

#### ✅ **Layout Mobile**
- [ ] Chat não cobre elementos importantes
- [ ] Botões têm tamanho adequado (min 44px)
- [ ] Texto legível sem zoom
- [ ] Menu inferior não sobrepõe conteúdo
- [ ] Imagens carregam corretamente
- [ ] Vídeo se adapta à tela

#### ✅ **Layout Desktop**
- [ ] Conteúdo centralizado (max-width)
- [ ] Não há elementos muito pequenos
- [ ] Chat posicionado adequadamente
- [ ] Navegação intuitiva
- [ ] Hover effects funcionam

### 3. **Teste de Orientação**

#### Mobile - Rotação de Tela
```
1. Abrir em modo retrato
2. Girar para modo paisagem
3. Verificar se layout se adapta
4. Testar chat em ambas orientações
```

---

## ⚡ Testes de Performance

### 1. **Google Lighthouse**

#### Como Executar
```
1. Abrir DevTools (F12)
2. Ir para aba "Lighthouse"
3. Selecionar "Performance", "Accessibility", "SEO"
4. Executar teste
```

#### ✅ **Metas de Performance**
- [ ] Performance Score > 90
- [ ] Accessibility Score > 95
- [ ] SEO Score > 95
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Cumulative Layout Shift < 0.1

### 2. **Teste de Carregamento**

#### Conexões a Testar
```
- Fast 3G (1.6 Mbps)
- Slow 3G (0.4 Mbps)
- WiFi (50+ Mbps)
```

#### ✅ **Tempos Esperados**
- [ ] First Byte < 1s (todas as conexões)
- [ ] Interactive < 5s (3G lento)
- [ ] Imagens carregam progressivamente
- [ ] Chat funciona em qualquer velocidade

### 3. **Teste de Assets**

#### Verificações de Tamanho
```bash
# Verificar tamanho das imagens
find public/images -name "*.jpg" -exec ls -lh {} \; | awk '{print $5, $9}'

# Verificar bundle JavaScript
npm run build
# Verificar tamanhos na saída do build
```

#### ✅ **Limites de Tamanho**
- [ ] Imagens < 300KB cada
- [ ] Bundle JS total < 500KB
- [ ] CSS total < 100KB
- [ ] Fonts < 200KB total

---

## 🔌 Testes de Integração N8N

### 1. **Teste com N8N Configurado**

#### Verificação de Conexão
```bash
# Testar webhook manualmente
curl -X POST sua-url-n8n.com/webhook/reservei-chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_123",
    "message": "Teste de conexão",
    "messageType": "text",
    "userInfo": {
      "name": "Teste Manual",
      "email": "teste@exemplo.com"
    }
  }'
```

#### ✅ **Checklist N8N Ativo**
- [ ] Chat status mostra "online"
- [ ] Respostas vêm do N8N (não mock)
- [ ] Google Calendar cria eventos
- [ ] Email notifications funcionam
- [ ] Logs aparecem no N8N

### 2. **Teste Modo Mock (Sem N8N)**

#### Simulação Sem N8N
```
1. Remover/comentar variáveis N8N do .env.local
2. Reiniciar servidor (npm run dev)
3. Testar chat normalmente
```

#### ✅ **Checklist Modo Mock**
- [ ] Chat funciona normalmente
- [ ] Respostas inteligentes e contextuais
- [ ] Status mostra "online"
- [ ] Formulário de agendamento funciona
- [ ] Transfer WhatsApp funciona
- [ ] Console mostra "modo mock"

---

## ♿ Testes de Acessibilidade

### 1. **Navegação por Teclado**

#### Teste de Tab Navigation
```
1. Usar apenas a tecla Tab
2. Verificar se foca todos elementos interativos
3. Ordem lógica de navegação
4. Foco visível em todos elementos
```

#### ✅ **Checklist Teclado**
- [ ] Todos botões acessíveis via Tab
- [ ] Chat acessível via teclado
- [ ] Enter funciona para enviar mensagens
- [ ] Escape fecha modais/chat
- [ ] Foco visível e bem contrastado

### 2. **Leitores de Tela**

#### Teste com NVDA/JAWS
```
1. Ativar leitor de tela
2. Navegar pela página
3. Verificar se conteúdo é anunciado corretamente
4. Testar formulários e botões
```

#### ✅ **Checklist Screen Reader**
- [ ] Alt text em todas as imagens
- [ ] Headers hierárquicos (h1, h2, h3)
- [ ] Labels em campos de formulário
- [ ] Status do chat anunciado
- [ ] Botões com texto descritivo

### 3. **Contraste de Cores**

#### Ferramentas de Teste
```
- WebAIM Contrast Checker
- axe DevTools (extensão browser)
- WAVE Web Accessibility Evaluator
```

#### ✅ **Padrões WCAG**
- [ ] Contraste mínimo 4.5:1 (texto normal)
- [ ] Contraste mínimo 3:1 (texto grande)
- [ ] Cores não são única forma de informação
- [ ] Foco visível em todos elementos

---

## 🤖 Scripts de Teste Automatizados

### 1. **Script de Teste Completo**

```bash
#!/bin/bash
# scripts/test-complete.sh

echo "🧪 INICIANDO TESTES COMPLETOS - RESERVEI VIAGENS"
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Função para teste
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testando $test_name... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSOU${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Testes de ambiente
echo -e "\n${YELLOW}1. TESTES DE AMBIENTE${NC}"
run_test "Node.js versão" "node -v | grep -E 'v1[8-9]|v[2-9][0-9]'"
run_test "NPM disponível" "npm --version"
run_test "Dependências instaladas" "[ -d node_modules ]"

# Testes de build
echo -e "\n${YELLOW}2. TESTES DE BUILD${NC}"
run_test "Lint sem erros" "npm run lint"
run_test "Build de produção" "npm run build"
run_test "Arquivo .next gerado" "[ -d .next ]"

# Testes de servidor
echo -e "\n${YELLOW}3. TESTES DE SERVIDOR${NC}"
echo "Iniciando servidor de teste..."
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 5

run_test "Servidor respondendo" "curl -s http://localhost:3000 > /dev/null"
run_test "API N8N respondendo" "curl -s http://localhost:3000/api/n8n > /dev/null"
run_test "Páginas principais" "curl -s http://localhost:3000/hoteis > /dev/null"

# Parar servidor
kill $SERVER_PID > /dev/null 2>&1

# Testes de assets
echo -e "\n${YELLOW}4. TESTES DE ASSETS${NC}"
run_test "Imagens existem" "[ -d public/images ]"
run_test "Logo principal existe" "[ -f public/images/logo-reservei.png ] || [ -f public/logo-reservei.png ]"
run_test "Favicon existe" "[ -f public/favicon.ico ]"

# Relatório final
echo -e "\n${YELLOW}📊 RELATÓRIO FINAL${NC}"
echo "=========================="
echo "Total de testes: $TOTAL_TESTS"
echo -e "Testes passaram: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Testes falharam: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo "Sistema pronto para deploy 🚀"
    exit 0
else
    echo -e "\n${RED}💥 ALGUNS TESTES FALHARAM!${NC}"
    echo "Corrija os problemas antes de continuar ⚠️"
    exit 1
fi
```

### 2. **Script de Teste de Chat**

```bash
#!/bin/bash
# scripts/test-chat.sh

echo "💬 Testando Chat Agent..."

# Verificar se servidor está rodando
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Servidor não está rodando. Execute: npm run dev"
    exit 1
fi

# Teste 1: Mensagem básica
echo "1. Testando mensagem básica..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/n8n \
    -H "Content-Type: application/json" \
    -d '{
        "sessionId": "test_001", 
        "message": "Olá",
        "messageType": "text"
    }')

if echo "$RESPONSE" | grep -q "reply"; then
    echo "✅ Chat respondeu à mensagem básica"
else
    echo "❌ Chat não respondeu adequadamente"
    exit 1
fi

# Teste 2: Formulário de agendamento
echo "2. Testando trigger de agendamento..."
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:3000/api/n8n \
    -H "Content-Type: application/json" \
    -d '{
        "sessionId": "test_002",
        "message": "Quero fazer uma reserva", 
        "messageType": "text"
    }')

if echo "$BOOKING_RESPONSE" | grep -q -i "agendar\|reserva\|data"; then
    echo "✅ Trigger de agendamento funcionando"
else
    echo "❌ Trigger de agendamento falhou"
    exit 1
fi

# Teste 3: Dados de booking
echo "3. Testando processamento de dados..."
BOOKING_DATA_RESPONSE=$(curl -s -X POST http://localhost:3000/api/n8n \
    -H "Content-Type: application/json" \
    -d '{
        "sessionId": "test_003",
        "messageType": "booking_data",
        "userInfo": {
            "name": "Teste Automatico",
            "email": "teste@exemplo.com",
            "phone": "(64) 99999-9999"
        },
        "bookingData": {
            "checkIn": "2025-02-15",
            "checkOut": "2025-02-20",
            "adults": 2,
            "children": 1,
            "babies": 0,
            "totalDays": 5
        }
    }')

if echo "$BOOKING_DATA_RESPONSE" | grep -q -i "agendamento\|criado\|confirmado"; then
    echo "✅ Processamento de dados de booking OK"
else
    echo "❌ Processamento de dados falhou"
    exit 1
fi

echo ""
echo "🎉 Todos os testes do chat passaram!"
```

### 3. **Script de Monitoramento**

```bash
#!/bin/bash
# scripts/monitor.sh

echo "📊 Monitor do Sistema Reservei Viagens"
echo "======================================"

while true; do
    clear
    echo "📊 DASHBOARD - $(date '+%H:%M:%S')"
    echo "=================================="
    
    # Status do servidor
    if curl -s http://localhost:3000 > /dev/null; then
        echo "🟢 Servidor: ONLINE"
    else
        echo "🔴 Servidor: OFFLINE"
    fi
    
    # Status da API
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/n8n 2>/dev/null)
    if [ "$API_STATUS" = "200" ]; then
        echo "🟢 API Chat: FUNCIONANDO"
    else
        echo "🟡 API Chat: MOCK MODE ($API_STATUS)"
    fi
    
    # Uso de CPU e Memória
    echo ""
    echo "💻 RECURSOS:"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
    echo "Memória: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
    
    # Espaço em disco
    echo "Disco: $(df -h . | awk 'NR==2{print $5}')"
    
    echo ""
    echo "Pressione Ctrl+C para sair"
    sleep 5
done
```

---

## 📋 Checklist Final de Testes

### ✅ **Antes de Deploy**

#### Funcionalidade
- [ ] Todos os links funcionam
- [ ] Chat responde adequadamente
- [ ] Formulários validam corretamente
- [ ] WhatsApp transfer funciona
- [ ] Responsividade testada

#### Performance
- [ ] Lighthouse score > 90
- [ ] Imagens otimizadas
- [ ] Bundle size aceitável
- [ ] Carregamento < 3s

#### Acessibilidade  
- [ ] Navegação por teclado
- [ ] Alt text em imagens
- [ ] Contraste adequado
- [ ] Screen reader compatível

#### Compatibilidade
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅
- [ ] Mobile browsers ✅

#### Integração
- [ ] N8N configurado (se aplicável)
- [ ] Google Calendar funciona
- [ ] Email notifications OK
- [ ] Monitoramento ativo

---

**Última Atualização**: 2025-01-20  
**Ferramentas**: Chrome DevTools, Lighthouse, WAVE, axe  
**Próximo**: [Scripts de Deploy](./scripts/) 