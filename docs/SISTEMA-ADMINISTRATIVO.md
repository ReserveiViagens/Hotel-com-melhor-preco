# Sistema Administrativo - CMS Reservei Viagens

## Visão Geral

O sistema administrativo é um **CMS (Content Management System)** completo que permite gerenciar todo o conteúdo do site sem conhecimento técnico. Ele inclui gerenciamento de hotéis, ingressos, atrações, promoções, imagens, vídeos e configurações.

**URL de Acesso:** `http://localhost:3000/admin`

## Funcionalidades Principais

### 🏨 Gerenciamento de Hotéis
**Localização:** Aba "Hotéis"

#### Recursos Disponíveis:
- **Adicionar/Editar Hotéis:**
  - Nome e descrição
  - Preços (com preço original e desconto)
  - Avaliação por estrelas (1-5)
  - Capacidade de hospedagem
  - Localização e contatos
  - Upload de imagens principais
  - Seleção de características (Wi-Fi, piscinas, restaurante, etc.)

- **Ações nos Hotéis:**
  - ✏️ **Editar:** Modificar todas as informações
  - 🗑️ **Excluir:** Remover hotel do sistema
  - 👁️ **Visualizar:** Ver como aparece no site

#### Como Usar:
1. Clique em "Adicionar Hotel"
2. Preencha as informações obrigatórias (*)
3. Faça upload da imagem principal
4. Selecione as características disponíveis
5. Clique em "Salvar Hotel"

### 🎫 Gerenciamento de Ingressos
**Localização:** Aba "Ingressos"

#### Recursos Disponíveis:
- **Tipos de Ingresso:**
  - Parque Aquático
  - Parque Temático
  - Atração Turística
  - Show/Evento

- **Campos Editáveis:**
  - Nome e descrição do ingresso
  - Preço atual e original
  - Desconto percentual
  - Categoria do ingresso
  - Validade do ingresso
  - URL da imagem

#### Exemplo de Configuração:
```
Nome: Hot Park - Dia Inteiro
Preço: R$ 85
Preço Original: R$ 110
Desconto: 23% OFF
Categoria: Parque Aquático
Validade: Válido por 6 meses
```

### 🏞️ Gerenciamento de Atrações
**Localização:** Aba "Atrações"

*Funcionalidade em desenvolvimento - será expandida para incluir:*
- Pontos turísticos de Caldas Novas
- Atividades e passeios
- Informações sobre cada atração
- Preços e horários de funcionamento

### 🎁 Gerenciamento de Promoções
**Localização:** Aba "Promoções"

*Funcionalidade em desenvolvimento - incluirá:*
- Pacotes especiais
- Ofertas sazonais
- Promoções relâmpago
- Combos hotel + ingresso

### 📞 Informações de Contato
**Localização:** Aba "Contato"

*Sistema para gerenciar:*
- Telefones e WhatsApp
- Endereços da agência
- Emails de contato
- Redes sociais
- Horários de funcionamento

### 📸 Gerenciamento de Fotos & Vídeos
**Localização:** Aba "Fotos & Vídeos"

#### Recursos Completos:
- **Upload Multi-Arquivo:**
  - Suporte a imagens (JPG, PNG, WebP)
  - Suporte a vídeos (MP4, WebM)
  - Upload em lote
  - Preview instantâneo

- **Organização por Categorias:**
  - 🏨 Hotéis
  - 🎡 Parques
  - 🏞️ Atrações
  - 🎁 Promoções

- **Ferramentas de Gestão:**
  - 🔍 Busca por nome
  - 👁️ Preview em tela cheia
  - ⬇️ Download individual
  - 🗑️ Exclusão com confirmação

- **Informações Detalhadas:**
  - Dimensões do arquivo
  - Tamanho em KB/MB
  - Data de upload
  - Categoria associada

#### Especificações Recomendadas:
```
📷 IMAGENS
- Resolução: 1200x800px
- Formato: JPG, PNG, WebP
- Tamanho máximo: 300KB
- Otimização automática

🎥 VÍDEOS
- Resolução: 1280x720px (16:9)
- Formato: MP4, WebM
- Tamanho máximo: 5MB
- Duração recomendada: 30-60s
```

### ⚙️ Configurações do Sistema
**Localização:** Aba "Configurações"

*Funcionalidade em desenvolvimento - incluirá:*
- Configurações de SEO
- Integrações de terceiros
- Configurações de email
- Backup e restore
- Analytics e relatórios

## Interface do Sistema

### Header Administrativo
- **Logo e Título:** Identificação do painel
- **Contador de Alterações:** Mostra mudanças pendentes
- **Botão Salvar Global:** Aplica todas as alterações
- **Visualizar Site:** Abre o site em nova aba

### Grid de Navegação
Cards visuais para cada seção com:
- Ícone da categoria
- Nome da seção
- Descrição da funcionalidade
- Indicador de seleção ativa

### Área de Conteúdo
- **Formulários Responsivos:** Adaptam-se a qualquer tela
- **Upload Drag & Drop:** Arraste arquivos diretamente
- **Preview em Tempo Real:** Veja mudanças instantaneamente
- **Validação de Campos:** Evita erros de preenchimento

## Controle de Alterações

### Sistema de Tracking
- **Contador Dinâmico:** Mostra quantas alterações foram feitas
- **Badge de Alerta:** Indica alterações não salvas
- **Salvamento Global:** Um clique salva tudo
- **Confirmações:** Diálogos para ações destrutivas

### Estados dos Dados
```javascript
🟢 Salvo - Dados sincronizados
🟡 Pendente - Alterações não salvas  
🔄 Salvando - Processando alterações
❌ Erro - Falha no salvamento
```

## Segurança e Permissions

### Acesso ao Painel
*Sistema de autenticação será implementado com:*
- Login obrigatório
- Sessões com timeout
- Controle de permissões por usuário
- Log de atividades

### Proteção de Dados
- **Backup Automático:** Antes de alterações
- **Versionamento:** Histórico de mudanças
- **Rollback:** Desfazer alterações se necessário
- **Validação:** Impede dados corrompidos

## Integração com o Site

### Sincronização Automática
- Alterações no admin refletem imediatamente no site
- Cache inteligente para performance
- Otimização de imagens automática
- SEO automático para novos conteúdos

### Preview em Tempo Real
- Botão "Ver Site" para validação
- Preview responsivo no próprio admin
- Modo de desenvolvimento com hot-reload

## Melhores Práticas

### Para Hotéis
1. **Imagens de Qualidade:**
   - Use fotos profissionais
   - Mantenha proporção 3:2 (1200x800px)
   - Optimize para web antes do upload

2. **Informações Completas:**
   - Preencha todos os campos
   - Use descrições atrativas
   - Mantenha contatos atualizados

3. **Características Relevantes:**
   - Selecione apenas o que realmente existe
   - Priorize diferenciais do hotel
   - Use linguagem consistente

### Para Imagens e Vídeos
1. **Organização:**
   - Use categorias corretas
   - Nomes de arquivo descritivos
   - Mantenha biblioteca organizada

2. **Qualidade:**
   - Teste em diferentes dispositivos
   - Verifique carregamento rápido
   - Use formatos otimizados

3. **Gestão:**
   - Remova arquivos não utilizados
   - Faça backup regularmente
   - Monitore uso de espaço

## Solução de Problemas

### Problemas Comuns

**Upload não funciona:**
- Verifique o tamanho do arquivo
- Confirme o formato suportado
- Teste com arquivo menor

**Imagens não aparecem:**
- Confirme o upload completo
- Verifique o caminho da imagem
- Limpe o cache do navegador

**Alterações não salvam:**
- Verifique conexão com internet
- Tente salvar campos individuais
- Recarregue a página se necessário

### Logs e Debug
```javascript
// Console do navegador (F12)
localStorage.getItem('admin-debug') // Ver logs
localStorage.setItem('admin-debug', 'true') // Ativar debug
```

## Roadmap - Próximas Funcionalidades

### Fase 2 (Em Desenvolvimento)
- **Autenticação completa**
- **Sistema de permissões**
- **Relatórios e analytics**
- **Backup/restore automático**

### Fase 3 (Planejado)
- **Editor WYSIWYG avançado**
- **Multi-idioma**
- **API REST completa**
- **Mobile app admin**

### Fase 4 (Futuro)
- **IA para otimização de conteúdo**
- **Integração com redes sociais**
- **Sistema de reviews**
- **CRM integrado**

## Suporte Técnico

Para problemas técnicos ou dúvidas:
1. Consulte esta documentação
2. Verifique os logs no console
3. Entre em contato com o suporte técnico
4. Inclua screenshots do problema

**Email:** suporte@reserveiviagens.com.br
**WhatsApp:** (64) 9 9999-9999
**Horário:** Segunda a Sexta, 8h às 18h

---

*Documentação atualizada em: Janeiro 2025*
*Versão do Sistema: 2.0* 