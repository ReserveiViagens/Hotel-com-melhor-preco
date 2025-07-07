# Reservei Viagens - App Mobile

## 📱 Sobre o App

App mobile nativo para iOS e Android desenvolvido com React Native, oferecendo todas as funcionalidades da plataforma web com experiência otimizada para dispositivos móveis.

## 🚀 Funcionalidades Principais

### 🏨 Reservas de Hotéis
- Busca avançada com filtros
- Comparação de preços em tempo real
- Reserva com pagamento integrado
- Histórico de reservas
- Notificações de status

### 🎡 Atrações e Ingressos
- Catálogo completo de atrações
- Compra de ingressos
- QR Code para entrada
- Avaliações e reviews
- Recomendações personalizadas

### 🎮 Gamificação Mobile
- Missões diárias
- Sistema de pontos
- Leaderboards
- Achievements
- Recompensas exclusivas

### 💬 Chat IA Integrado
- Assistente virtual 24/7
- Suporte em tempo real
- Recomendações inteligentes
- Integração com reservas

## 🛠️ Tecnologias

- **React Native** - Framework principal
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **Redux Toolkit** - Gerenciamento de estado
- **React Navigation** - Navegação
- **React Native Elements** - UI Components
- **Expo Notifications** - Push notifications
- **Expo Camera** - QR Code scanner
- **React Native Maps** - Mapas e localização

## 📱 Estrutura do Projeto

```
mobile-app/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── screens/            # Telas do app
│   ├── navigation/         # Configuração de navegação
│   ├── services/           # Serviços e APIs
│   ├── store/              # Redux store
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utilitários
│   └── types/              # Tipos TypeScript
├── assets/                 # Imagens, fontes, etc.
├── app.json               # Configuração Expo
├── package.json           # Dependências
└── tsconfig.json          # Configuração TypeScript
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Expo CLI
- iOS Simulator (para iOS)
- Android Studio (para Android)

### Instalação
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/reservei-viagens.git
cd mobile-app

# Instalar dependências
npm install

# Executar app
npm start
```

### Build para Produção
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## 📱 Telas Principais

### 1. Home
- Banner de promoções
- Hotéis em destaque
- Atrações populares
- Missões diárias
- Notificações

### 2. Busca de Hotéis
- Filtros avançados
- Mapa interativo
- Lista de resultados
- Comparação de preços

### 3. Detalhes do Hotel
- Galeria de fotos
- Avaliações
- Comodidades
- Preços e disponibilidade
- Botão de reserva

### 4. Perfil do Usuário
- Informações pessoais
- Histórico de reservas
- Pontos e achievements
- Configurações

### 5. Chat IA
- Interface de chat
- Histórico de conversas
- Integração com reservas
- Suporte 24/7

## 🔧 Configurações

### Variáveis de Ambiente
```bash
# .env
API_URL=https://api.reservei-viagens.com
GOOGLE_MAPS_API_KEY=sua_chave_aqui
EXPO_PUBLIC_GA_ID=seu_ga_id
```

### Push Notifications
- Configurado para iOS e Android
- Notificações de reservas
- Promoções personalizadas
- Lembretes de viagem

### Integração com APIs
- Autenticação JWT
- Refresh token automático
- Cache offline
- Sincronização em background

## 📊 Analytics e Métricas

### Google Analytics 4
- Tracking de eventos
- Conversões
- Comportamento do usuário
- Performance do app

### Crashlytics
- Relatórios de crash
- Performance monitoring
- User journey tracking

## 🔒 Segurança

### Autenticação
- Biometria (Touch ID/Face ID)
- 2FA opcional
- Sessões seguras
- Logout automático

### Dados
- Criptografia local
- Transmissão HTTPS
- GDPR compliance
- LGPD compliance

## 🚀 Roadmap

### Versão 1.0 (Atual)
- ✅ Reservas de hotéis
- ✅ Compra de ingressos
- ✅ Gamificação básica
- ✅ Chat IA básico

### Versão 2.0 (Próxima)
- 🔄 Reservas de voos
- 🔄 Aluguel de carros
- 🔄 Gamificação avançada
- 🔄 Chat IA avançado

### Versão 3.0 (Futura)
- 🔄 Realidade aumentada
- 🔄 Inteligência artificial avançada
- 🔄 Integração com wearables
- 🔄 Experiência imersiva

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o app:
- Email: suporte@reservei-viagens.com
- WhatsApp: (11) 99999-9999
- Chat: Disponível no app

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes. 