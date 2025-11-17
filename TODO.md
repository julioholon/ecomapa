# EcoMapa - Product Backlog

## 🎯 Legenda

**Prioridade:**
- 🔴 P0 - Must Have (MVP)
- 🟡 P1 - Should Have (MVP)
- 🟢 P2 - Could Have (Pós-MVP)

**Complexidade:**
- S (Small) - 1-2 dias
- M (Medium) - 3-5 dias
- L (Large) - 1-2 semanas
- XL (Extra Large) - 2+ semanas

---

## ÉPICO 1: Setup e Infraestrutura

### 📦 [P0-INFRA-001] Setup inicial do projeto Next.js
**Complexidade:** S

**Como** desenvolvedor  
**Quero** ter o ambiente base configurado  
**Para** iniciar o desenvolvimento do EcoMapa

**Critérios de Aceitação:**
- [x] Projeto Next.js 14+ com App Router inicializado
- [x] TailwindCSS configurado e funcionando
- [x] ESLint + Prettier configurados
- [x] TypeScript strict mode habilitado
- [x] Estrutura de pastas criada (app/, components/, lib/)
- [x] Git repository inicializado com .gitignore adequado
- [ ] README.md básico com instruções de setup

**Definição de Pronto:**
- [x] `npm run dev` roda sem erros
- [x] Hot reload funcionando
- [ ] Build de produção bem-sucedida

---

### 📦 [P0-INFRA-002] Configuração Supabase
**Complexidade:** M  
**Dependências:** INFRA-001

**Como** desenvolvedor  
**Quero** ter o Supabase configurado com schema inicial  
**Para** armazenar dados dos ecopontos

**Critérios de Aceitação:**
- [x] Projeto Supabase criado (free tier)
- [x] Extensão PostGIS habilitada no banco
- [x] Schema inicial criado (migrations):
  - Tabelas: ecopoints, categories, donations, reviews, user_reputation
  - Índices geoespaciais em ecopoints.location
  - Foreign keys e constraints configurados
- [x] RLS (Row Level Security) configurado:
  - ecopoints: leitura pública, escrita owner
  - reviews: leitura pública, escrita autenticado
  - donations: leitura owner/admin
- [x] Variáveis de ambiente (.env.local) configuradas
- [x] Cliente Supabase instanciado em lib/supabase/client.ts
- [ ] Tipagem TypeScript gerada do schema

**Definição de Pronto:**
- [x] Conexão com banco funciona
- [x] Query simples retorna dados
- [ ] RLS bloqueia acessos não autorizados

---

### 📦 [P0-INFRA-003] Deploy Netlify
**Complexidade:** S
**Dependências:** INFRA-001, INFRA-002

**Como** desenvolvedor
**Quero** ter deploy automático funcionando
**Para** testar em produção desde cedo

**Critérios de Aceitação:**
- [x] Projeto conectado ao Netlify
- [x] Build settings configurados para Next.js
- [x] Variáveis de ambiente configuradas no Netlify
- [x] Deploy automático no push para main
- [x] Preview deploys em PRs funcionando
- [x] Custom domain configurado (ou Netlify domain)
- [x] HTTPS funcionando

**Definição de Pronto:**
- [x] Site acessível publicamente
- [x] Build passa sem erros
- [x] Variáveis de ambiente carregando corretamente

**Configuração Netlify:**
```
netlify.toml criado com:
- Build command: npm run build
- Publish: .next
- Node 20
- Plugin: @netlify/plugin-nextjs

Variáveis de ambiente necessárias no Netlify Dashboard:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## ÉPICO 2: Visualização de Mapa

### 🗺️ [P0-MAP-001] Componente de mapa básico com Leaflet
**Complexidade:** M  
**Dependências:** INFRA-001

**Como** usuário anônimo  
**Quero** ver um mapa interativo do Brasil  
**Para** explorar iniciativas regenerativas

**Critérios de Aceitação:**
- [x] Leaflet e react-leaflet instalados
- [x] MapContainer component criado e renderizando
- [x] Camada base OpenStreetMap carregando
- [x] Mapa centralizado no Brasil (lat: -15.7801, lng: -47.9292)
- [x] Zoom inicial em 4 (visão país inteiro)
- [x] Controles de zoom funcionando
- [x] Pan (arrastar mapa) funcionando
- [x] Mapa responsivo (mobile e desktop)
- [x] Loading state durante carregamento dos tiles

**Definição de Pronto:**
- [x] Mapa visível sem console errors
- [x] Interações funcionando suavemente
- [x] Performance aceitável em mobile (< 3s load)

---

### 🗺️ [P0-MAP-002] Geolocalização do usuário
**Complexidade:** S  
**Dependências:** MAP-001

**Como** usuário  
**Quero** que o mapa centralize na minha localização  
**Para** ver ecopontos perto de mim

**Critérios de Aceitação:**
- [x] Browser Geolocation API implementada
- [x] Botão "Minha Localização" visível no mapa
- [x] Ao clicar, solicita permissão de localização
- [x] Se permitido: centraliza mapa na localização atual
- [x] Se negado: mostra mensagem e usa fallback (São Paulo centro)
- [x] Marcador azul indica posição do usuário
- [x] Círculo semi-transparente ao redor (precisão ~100m)
- [x] Loading state durante obtenção da localização
- [x] Timeout de 10s (fallback se demorar muito)

**Definição de Pronto:**
- [x] Geolocalização funciona em Chrome, Firefox, Safari
- [ ] Funciona em mobile (iOS e Android)
- [x] Erros tratados com mensagens amigáveis
- [x] Não trava se permissão negada

---

### 🗺️ [P0-MAP-003] Toggle camadas (Ruas/Satélite)
**Complexidade:** S  
**Dependências:** MAP-001

**Como** usuário  
**Quero** alternar entre visão de ruas e satélite  
**Para** ter diferentes perspectivas do território

**Critérios de Aceitação:**
- [x] Componente LayerToggle criado
- [x] Botão toggle posicionado (canto superior direito)
- [x] Duas opções: "Ruas" e "Satélite"
- [x] Camada Ruas: OpenStreetMap tiles
- [x] Camada Satélite: Esri WorldImagery ou similar (free)
- [ ] Transição suave entre camadas (fade)
- [x] Estado da camada persiste durante a sessão
- [x] Ícones visuais para cada opção (🗺️ / 🛰️)

**Definição de Pronto:**
- [x] Toggle funciona sem reload da página
- [x] Ambas camadas carregam corretamente
- [x] Performance não degrada ao trocar
- [ ] Funciona em mobile

---

### 🗺️ [P0-MAP-004] Círculos de raio de busca
**Complexidade:** S  
**Dependências:** MAP-002

**Como** usuário  
**Quero** ver círculos de 1km, 2km e 5km da minha posição  
**Para** entender a distância dos ecopontos

**Critérios de Aceitação:**
- [x] Componente RadiusCircle criado
- [x] Três círculos concêntricos ao redor do usuário:
  - 1km (verde claro, opacity 0.1)
  - 2km (verde médio, opacity 0.08)
  - 5km (verde escuro, opacity 0.05)
- [x] Bordas dos círculos com stroke sutil
- [ ] Labels mostrando "1km", "2km", "5km" (removido por solicitação)
- [x] Círculos se movem ao reposicionar usuário
- [x] Toggle para mostrar/esconder círculos
- [x] Não interferem com interação do mapa

**Definição de Pronto:**
- [x] Círculos visíveis mas não intrusivos
- [x] Escala correta (verificar com Google Maps)
- [x] Performance OK (não lag ao arrastar)

---

## ÉPICO 3: Visualização de Ecopontos

### 📍 [P0-POINT-001] Seed de dados iniciais
**Complexidade:** M  
**Dependências:** INFRA-002

**Como** desenvolvedor  
**Quero** ter dados de exemplo no banco  
**Para** testar a visualização de ecopontos

**Critérios de Aceitação:**
- [x] Script seed.ts criado (SQL seed file)
- [x] Tabela categories populada com 8 categorias:
  - 🥕 Alimentação regenerativa
  - 🛍️ Consumo consciente
  - 🔄 Economia circular
  - 🌳 Natureza e biodiversidade
  - 🌱 Agroecologia urbana
  - 🤝 Comunidades e coletivos
  - 🛠️ Oficinas e aprendizado
  - 🏢 ONGs e organizações
- [x] Mínimo 20 ecopontos cadastrados (SP + RJ + BH)
- [x] Dados realistas: nome, descrição, lat/lng, categoria
- [x] Mix de status: validated (70%), pending (30%)
- [ ] Alguns com reviews e ratings
- [ ] Script rodável via `npm run seed`

**Definição de Pronto:**
- [x] Query retorna 20+ ecopontos
- [x] Dados geograficamente distribuídos
- [x] Categorias balanceadas

---

### 📍 [P0-POINT-002] Markers customizados por categoria
**Complexidade:** M  
**Dependências:** POINT-001, MAP-001

**Como** usuário  
**Quero** ver pins no mapa com ícones de categoria  
**Para** identificar rapidamente o tipo de ecoponto

**Critérios de Aceitação:**
- [x] Componente EcopointMarker criado
- [x] Query busca ecopontos em viewport atual
- [x] Markers renderizados com emoji da categoria
- [x] Tamanho do marker: 40x40px
- [x] Background circular colorido (cor da categoria)
- [x] Emoji centralizado no marker
- [x] Markers clicáveis (cursor pointer)
- [x] Hover effect (scale 1.1)
- [x] Z-index correto (não sobrepõem incorretamente)

**Definição de Pronto:**
- [x] Todos os 20+ pontos visíveis no mapa
- [x] Emojis renderizando corretamente
- [x] Performance OK com 50+ markers

---

### 📍 [P0-POINT-003] Clustering de markers
**Complexidade:** M  
**Dependências:** POINT-002

**Como** usuário  
**Quero** que markers próximos se agrupem  
**Para** não sobrecarregar o mapa visualmente

**Critérios de Aceitação:**
- [x] Leaflet.markercluster instalado
- [x] Markers agrupam quando próximos (< 80px)
- [x] Cluster mostra número de pontos
- [ ] Cluster colorido por categoria predominante
- [x] Ao clicar cluster: zoom in para expandir
- [x] Zoom suficiente: mostra markers individuais
- [x] Animação suave ao agrupar/desagrupar
- [x] Performance OK com 100+ markers

**Definição de Pronto:**
- [x] Clustering funciona em todos zoom levels
- [x] Smooth UX ao interagir
- [ ] Mobile friendly

---

### 📍 [P0-POINT-004] Popup ao clicar em marker
**Complexidade:** S  
**Dependências:** POINT-002

**Como** usuário  
**Quero** ver informações resumidas ao clicar em um pin  
**Para** decidir se quero saber mais

**Critérios de Aceitação:**
- [x] Popup Leaflet customizado
- [x] Exibe:
  - Nome do ecoponto
  - Categoria (emoji + texto)
  - Rating (estrelas) se disponível
  - Descrição curta (max 100 caracteres)
  - Badge "Validado" se status validated
  - Botão "Ver Detalhes"
- [x] Estilo consistente com design system
- [x] Close button funcionando
- [x] Auto-fecha ao clicar outro marker
- [ ] Responsivo (mobile adapta)

**Definição de Pronto:**
- [x] Popup abre sem delay
- [x] Informações corretas
- [ ] Botão leva para modal detalhado

---

### 📍 [P0-POINT-005] Modal detalhado do ecoponto
**Complexidade:** M  
**Dependências:** POINT-004

**Como** usuário  
**Quero** ver todas informações de um ecoponto  
**Para** decidir visitar ou apoiar

**Critérios de Aceitação:**
- [ ] Modal fullscreen (mobile) ou centered (desktop)
- [ ] Exibe:
  - Galeria de fotos (carousel)
  - Nome e categoria
  - Rating médio e número de reviews
  - Descrição completa
  - Endereço formatado
  - Contato: email, telefone, website, redes sociais
  - Horário de funcionamento (se disponível)
  - Botão "Como Chegar" (abre Google Maps)
  - Botão "Apoiar" (se validated)
  - Seção de reviews (últimas 5)
- [ ] Animação de entrada/saída
- [ ] Scroll dentro do modal
- [ ] Close via X, ESC ou backdrop
- [ ] Share button (copiar link do ecoponto)

**Definição de Pronto:**
- Modal funciona em mobile e desktop
- Todas informações carregam
- Links externos abrem corretamente
- Performance OK (< 500ms para abrir)

---

## ÉPICO 4: Filtros e Busca

### 🔍 [P0-FILTER-001] Sidebar de filtros por categoria
**Complexidade:** M  
**Dependências:** POINT-002

**Como** usuário  
**Quero** filtrar ecopontos por categoria  
**Para** encontrar o que me interessa

**Critérios de Aceitação:**
- [x] Sidebar esquerda (desktop) ou bottom sheet (mobile)
- [x] Lista das 8 categorias com checkboxes
- [ ] Contador de pontos por categoria
- [x] Multi-seleção permitida
- [x] "Selecionar Todos" / "Limpar Filtros"
- [x] Markers atualizam em tempo real ao filtrar
- [ ] Estado do filtro persiste na sessão
- [ ] Animação suave ao filtrar
- [ ] Badge no mapa mostrando "X filtros ativos"

**Definição de Pronto:**
- [x] Filtros funcionam instantaneamente
- [ ] Contadores corretos
- [x] UX fluida
- [ ] Mobile friendly

---

### 🔍 [P0-FILTER-002] Filtro por raio de distância
**Complexidade:** S  
**Dependências:** MAP-004, FILTER-001

**Como** usuário  
**Quero** escolher o raio de busca (1km, 2km, 5km)  
**Para** controlar quantos pontos visualizo

**Critérios de Aceitação:**
- [x] Radio buttons ou slider na sidebar
- [x] Opções: 1km, 2km, 5km, "Sem limite"
- [ ] Query PostGIS filtra por ST_DWithin (usando JavaScript local)
- [ ] Círculo visual atualiza junto
- [ ] Contador mostra "X pontos em Ykm"
- [ ] Padrão: 5km (padrão: sem limite)
- [ ] Preferência salva em localStorage

**Definição de Pronto:**
- [x] Filtro geoespacial correto
- [x] Performance OK (query < 200ms)
- [x] UX clara

---

### 🔍 [P1-FILTER-003] Busca por nome/endereço
**Complexidade:** M  
**Dependências:** POINT-002

**Como** usuário  
**Quero** buscar ecopontos por nome ou endereço  
**Para** encontrar locais específicos rapidamente

**Critérios de Aceitação:**
- [ ] Input de busca no topo do mapa
- [ ] Busca full-text no Supabase (nome + descrição)
- [ ] Autocomplete mostra resultados ao digitar (debounce 300ms)
- [ ] Resultados ordenados por relevância e proximidade
- [ ] Ao selecionar: centraliza mapa e abre modal
- [ ] Histórico de buscas (últimas 5)
- [ ] Ícone de loading durante busca
- [ ] Mensagem "Nenhum resultado" se vazio

**Definição de Pronto:**
- Busca retorna resultados relevantes
- Autocomplete responsivo
- UX rápida (< 500ms)

---

## ÉPICO 5: Importação Google Maps

### 📥 [P0-IMPORT-001] Interface de busca Google Places
**Complexidade:** L  
**Dependências:** INFRA-002, AUTH-001

**Como** usuário logado  
**Quero** buscar lugares no Google Maps  
**Para** importar ecopontos para o EcoMapa

**Critérios de Aceitação:**
- [ ] Google Places API configurada (API key)
- [ ] Página /dashboard/importar criada
- [ ] Input de busca estilo Google Maps
- [ ] Query exemplo: "Sustentabilidade São Paulo"
- [ ] Limite de raio: 50km (configurable)
- [ ] Retorna até 20 resultados
- [ ] Cada resultado mostra:
  - Nome
  - Endereço
  - Rating Google
  - Foto (thumbnail)
  - Checkbox para seleção
- [ ] Preview no mini-map lateral
- [ ] Multi-seleção com Shift+Click
- [ ] "Selecionar Todos Visíveis"

**Definição de Pronto:**
- API funciona sem erros de quota
- Resultados precisos
- UX fluida
- Limite de 100 importações/dia por usuário

---

### 📥 [P0-IMPORT-002] Categorização manual dos pontos
**Complexidade:** M  
**Dependências:** IMPORT-001

**Como** usuário importando  
**Quero** categorizar cada ponto selecionado  
**Para** que fiquem organizados no EcoMapa

**Critérios de Aceitação:**
- [ ] Modal "Categorizar Selecionados"
- [ ] Tabela com pontos selecionados
- [ ] Dropdown de categoria por ponto
- [ ] Sugestão automática baseada em keywords:
  - "feira" → Alimentação regenerativa
  - "horta" → Agroecologia urbana
  - "ONG" → ONGs e organizações
- [ ] Opção "Aplicar categoria a todos"
- [ ] Campo opcional: descrição personalizada
- [ ] Preview da categorização
- [ ] Validação: todos devem ter categoria

**Definição de Pronto:**
- Sugestões corretas em 70% dos casos
- UX rápida para categorizar 10+ pontos
- Validação funciona

---

### 📥 [P0-IMPORT-003] Salvar pontos como "pending"
**Complexidade:** M  
**Dependências:** IMPORT-002

**Como** sistema  
**Quero** salvar pontos importados com status pending  
**Para** aguardar validação do administrador

**Critérios de Aceitação:**
- [ ] Botão "Importar Selecionados"
- [ ] Insere em ecopoints com:
  - status: 'pending'
  - name, location, address (do Google)
  - category (do dropdown)
  - description (se preenchida)
  - imported_from: 'google_maps'
  - imported_by: user_id
- [ ] Extrai lat/lng correto do Google
- [ ] Valida se ponto já existe (duplicatas)
- [ ] Se já existe: mostra warning, permite skip
- [ ] Loading state durante import
- [ ] Mensagem sucesso: "X pontos importados"
- [ ] Log de importação salvo

**Definição de Pronto:**
- Import bulk funciona (10+ pontos)
- Dados corretos no banco
- Sem duplicatas acidentais
- Performance OK (< 5s para 20 pontos)

---

### 📥 [P0-IMPORT-004] Email automático de convite
**Complexidade:** M  
**Dependências:** IMPORT-003

**Como** sistema  
**Quero** enviar email ao contato do ecoponto  
**Para** convidá-lo a validar seu cadastro

**Critérios de Aceitação:**
- [ ] Resend ou SendGrid configurado
- [ ] Template de email criado:
  - Assunto: "Seu negócio foi adicionado ao EcoMapa!"
  - Corpo: explicação do EcoMapa
  - Link único de validação (token)
  - CTA: "Validar Meu Ponto"
  - Opção "Não é meu negócio" (report)
- [ ] Email enviado em background (queue)
- [ ] Token JWT com 30 dias de validade
- [ ] Retry em caso de falha (3x)
- [ ] Log de emails enviados
- [ ] Respects rate limit (100/hora)

**Definição de Pronto:**
- Email chega na caixa de entrada (não spam)
- Link funciona
- Template mobile-friendly
- Tracking de abertura (opcional)

---

## ÉPICO 6: Autenticação

### 🔐 [P0-AUTH-001] Login com Google e Email/Senha
**Complexidade:** M  
**Dependências:** INFRA-002

**Como** usuário  
**Quero** fazer login no EcoMapa  
**Para** avaliar pontos e fazer doações

**Critérios de Aceitação:**
- [ ] Supabase Auth configurado
- [ ] Página /login criada
- [ ] Botão "Entrar com Google" (OAuth)
- [ ] Formulário Email + Senha
- [ ] Link "Esqueci minha senha"
- [ ] Link "Criar conta"
- [ ] Redirect após login: página anterior ou /dashboard
- [ ] Session persiste (cookies httpOnly)
- [ ] Logout funcionando
- [ ] Estado de auth global (Context/Zustand)
- [ ] Protected routes redirecionam para /login

**Definição de Pronto:**
- Login Google funciona
- Login Email funciona
- Session persiste após refresh
- Security best practices

---

### 🔐 [P0-AUTH-002] Página de cadastro
**Complexidade:** S  
**Dependências:** AUTH-001

**Como** novo usuário  
**Quero** criar uma conta  
**Para** começar a usar o EcoMapa

**Critérios de Aceitação:**
- [ ] Página /cadastro
- [ ] Campos:
  - Nome completo
  - Email
  - Senha (min 8 caracteres)
  - Confirmar senha
  - Aceite termos de uso (checkbox obrigatório)
- [ ] Validação client-side (Zod ou similar)
- [ ] Feedback de erros inline
- [ ] Email de confirmação enviado
- [ ] Redirect para /verificar-email
- [ ] Link para /login se já tem conta

**Definição de Pronto:**
- Cadastro cria usuário no Supabase
- Email verificação enviado
- Validações funcionam
- UX clara

---

### 🔐 [P1-AUTH-003] Perfil do usuário
**Complexidade:** M  
**Dependências:** AUTH-001

**Como** usuário logado  
**Quero** ver e editar meu perfil  
**Para** gerenciar minha conta

**Critérios de Aceitação:**
- [ ] Página /dashboard/perfil
- [ ] Exibe:
  - Avatar (upload ou Gravatar)
  - Nome
  - Email (não editável)
  - Bio (opcional)
  - Reputação: pontos, badges
  - Histórico: doações, reviews
- [ ] Edit mode para atualizar dados
- [ ] Upload de avatar (Supabase Storage)
- [ ] Validação de formulário
- [ ] Botão "Deletar Conta" (com confirmação)
- [ ] Lista de pontos que administra

**Definição de Pronto:**
- Edição funciona
- Avatar upload OK
- Reputação calculada corretamente

---

## ÉPICO 7: Validação de Pontos

### ✅ [P0-VALIDATE-001] Landing page de validação
**Complexidade:** M  
**Dependências:** AUTH-001, IMPORT-004

**Como** administrador de ponto  
**Quero** validar meu ecoponto via link do email  
**Para** começar a receber doações

**Critérios de Aceitação:**
- [ ] Página /validar-ponto/[token]
- [ ] Valida token JWT
- [ ] Se token inválido/expirado: mensagem erro
- [ ] Se válido: mostra preview do ecoponto
- [ ] Botão "Este é meu negócio" → prossegue
- [ ] Botão "Não é meu negócio" → reporta erro
- [ ] Se não logado: redirect para login (preserva token)
- [ ] Após login: retorna para validação
- [ ] Marca token como usado

**Definição de Pronto:**
- Token validation segura
- Fluxo completo sem erros
- UX clara

---

### ✅ [P0-VALIDATE-002] Formulário de validação
**Complexidade:** M  
**Dependências:** VALIDATE-001

**Como** administrador validando  
**Quero** confirmar/editar informações do ecoponto  
**Para** garantir dados corretos

**Critérios de Aceitação:**
- [ ] Formulário pré-preenchido com dados do Google
- [ ] Campos editáveis:
  - Nome
  - Descrição (rich text básico)
  - Categorias (multi-select)
  - Endereço (com autocomplete)
  - Horário de funcionamento
  - Contatos: email, telefone, website, Instagram, Facebook
- [ ] Upload múltiplo de fotos (max 5, 2MB cada)
- [ ] Preview das fotos
- [ ] Crop/resize automático
- [ ] Validação de URLs e emails
- [ ] Checkbox "Aceito receber doações"
- [ ] Botão "Validar e Publicar"

**Definição de Pronto:**
- Formulário salva corretamente
- Fotos fazem upload
- Validações funcionam
- UX intuitiva

---

### ✅ [P0-VALIDATE-003] Mudança de status para "validated"
**Complexidade:** S  
**Dependências:** VALIDATE-002

**Como** sistema  
**Quero** ativar o ecoponto após validação  
**Para** exibi-lo corretamente no mapa

**Critérios de Aceitação:**
- [ ] Ao submeter formulário:
  - status → 'validated'
  - validated_at → now()
  - validated_by → user_id
  - owner_id → user_id
- [ ] RLS permite owner editar seu ponto
- [ ] Ponto aparece imediatamente no mapa
- [ ] Badge "Validado" visível
- [ ] Email confirmação enviado ao owner
- [ ] Notificação ao usuário que importou
- [ ] Reputação +50 pontos ao importador

**Definição de Pronto:**
- Status muda atomicamente
- Permissões corretas
- Notificações enviadas

---

### ✅ [P1-VALIDATE-004] Dashboard do administrador
**Complexidade:** L  
**Dependências:** VALIDATE-003

**Como** administrador de ponto  
**Quero** gerenciar meus ecopontos  
**Para** manter informações atualizadas

**Critérios de Aceitação:**
- [ ] Página /dashboard/meus-pontos
- [ ] Lista de pontos que administra
- [ ] Cards com:
  - Foto, nome, categoria
  - Status (validated/pending)
  - Rating médio
  - Total de doações recebidas
  - Botão "Editar"
  - Botão "Desativar"
- [ ] Modal de edição (mesmo form de validação)
- [ ] Gráfico de doações por mês
- [ ] Lista de últimos doadores (anônimos)
- [ ] Últimas reviews
- [ ] Estatísticas: views, favoritos

**Definição de Pronto:**
- CRUD completo funciona
- Estatísticas corretas
- Gráficos renderizam
- UX profissional

---

## ÉPICO 8: Sistema de Reviews

### ⭐ [P1-REVIEW-001] Adicionar avaliação
**Complexidade:** M  
**Dependências:** AUTH-001, POINT-005

**Como** usuário logado  
**Quero** avaliar um ecoponto  
**Para** compartilhar minha experiência

**Critérios de Aceitação:**
- [ ] Botão "Avaliar" no modal do ecoponto
- [ ] Modal de review com:
  - Seletor de estrelas (1-5)
  - Campo de comentário (opcional, max 500 chars)
  - Checkbox "Visitei este local"
  - Botão "Publicar Avaliação"
- [ ] Validação: apenas 1 review por usuário/ponto
- [ ] Se já avaliou: permite editar
- [ ] Insere em tabela reviews
- [ ] Atualiza rating médio do ecoponto (trigger)
- [ ] Reputação +5 pontos ao reviewer
- [ ] Notificação ao owner do ponto

**Definição de Pronto:**
- Review salva corretamente
- Rating médio atualiza
- Duplicatas bloqueadas
- UX rápida

---

### ⭐ [P1-REVIEW-002] Listagem de reviews
**Complexidade:** S  
**Dependências:** REVIEW-001

**Como** usuário  
**Quero** ver reviews de um ecoponto  
**Para** conhecer opiniões de outros

**Critérios de Aceitação:**
- [ ] Seção "Avaliações" no modal
- [ ] Mostra rating médio (estrelas + número)
- [ ] Distribuição de estrelas (gráfico barras)
- [ ] Lista de reviews:
  - Avatar e nome do reviewer
  - Rating (estrelas)
  - Comentário
  - Data relativa ("2 dias atrás")
  - Badge "Visitou" se checkbox marcado
- [ ] Paginação ou scroll infinito
- [ ] Ordenação: Mais recentes / Mais úteis
- [ ] Botão "Denunciar" (abuse)

**Definição de Pronto:**
- Reviews carregam corretamente
- Paginação funciona
- UX agradável

---

## ÉPICO 9: Micro-doações

### 💰 [P0-DONATION-001] Integração Mercado Pago PIX
**Complexidade:** L  
**Dependências:** INFRA-002

**Como** desenvolvedor  
**Quero** integrar pagamentos PIX  
**Para** permitir micro-doações

**Critérios de Aceitação:**
- [ ] Conta Mercado Pago criada (modo produção)
- [ ] SDK Mercado Pago instalado
- [ ] API de pagamentos configurada
- [ ] Geração de QR Code PIX funcionando
- [ ] Webhook para confirmação de pagamento
- [ ] Tabela donations com campos:
  - payment_id (MP reference)
  - status (pending/completed/failed)
  - amount, ecopoint_id, user_id
- [ ] Tratamento de erros e timeouts
- [ ] Logs de transações
- [ ] Testes em sandbox

**Definição de Pronto:**
- Pagamento PIX completo funciona
- Webhook recebe confirmação
- Status atualiza corretamente
- Segurança OK

---

### 💰 [P0-DONATION-002] Modal de doação
**Complexidade:** M  
**Dependências:** DONATION-001, AUTH-001

**Como** usuário logado  
**Quero** apoiar um ecoponto com doação  
**Para** contribuir com a iniciativa

**Critérios de Aceitação:**
- [ ] Botão "Apoiar" no modal do ponto (apenas validated)
- [ ] Modal com:
  - Foto e nome do ecoponto
  - Valores sugeridos: R$ 5, 10, 20
  - Input custom (min R$ 2)
  - Total + taxas visíveis
  - Botão "Gerar QR Code PIX"
- [ ] Após clicar: chama API MP
- [ ] Exibe QR Code e código PIX (copiar)
- [ ] Timer de expiração (5 minutos)
- [ ] Polling para verificar pagamento (5s interval)
- [ ] Ao confirmar: animação + mensagem sucesso
- [ ] Link "Comprovante" (download PDF)

**Definição de Pronto:**
- Fluxo completo funciona
- QR Code renderiza
- Confirmação automática
- UX clara e confiável

---

### 💰 [P0-DONATION-003] Sistema de reputação
**Complexidade:** M  
**Dependências:** DONATION-002, REVIEW-001

**Como** usuário engajado  
**Quero** ganhar pontos e badges  
**Para** ser reconhecido na comunidade

**Critérios de Aceitação:**
- [ ] Tabela user_reputation com:
  - points (total de pontos)
  - donations_count, reviews_count
  - badges (json array)
- [ ] Regras de pontos:
  - +10 pontos por doação
  - +5 pontos por review
  - +50 pontos por importar ponto validado
  - +100 pontos por validar próprio ponto
- [ ] Badges automáticos:
  - "Apoiador Bronze" (3 doações)
  - "Apoiador Prata" (10 doações)
  - "Apoiador Ouro" (25 doações)
  - "Explorador" (5 reviews)
  - "Curador" (10 importações validadas)
- [ ] Atualização via database trigger ou função
- [ ] Leaderboard: /ranking
- [ ] Badge visível no perfil e comentários

**Definição de Pronto:**
- Pontos calculados corretamente
- Badges atribuídos automaticamente
- Leaderboard funciona
- Gamificação engaja

---

### 💰 [P1-DONATION-004] Dashboard de doações recebidas
**Complexidade:** M  
**Dependências:** DONATION-002, VALIDATE-004

**Como** administrador de ponto  
**Quero** ver doações que recebi  
**Para** acompanhar o apoio da comunidade

**Critérios de Aceitação:**
- [ ] Seção em /dashboard/meus-pontos
- [ ] Por ponto, exibe:
  - Total arrecadado (mês/total)
  - Número de apoiadores únicos
  - Doação média
  - Gráfico de doações por dia (últimos 30d)
  - Lista de doações:
    * Data, valor, apoiador (anônimo ou nome)
    * Status da doação
- [ ] Filtros: período, status
- [ ] Export CSV de doações
- [ ] Projeção: "Se continuar assim, R$ X/mês"

**Definição de Pronto:**
- Dados precisos
- Gráficos informativos
- Export funciona
- UX motivadora

---

## ÉPICO 10: Polimento e Extras

### 🎨 [P1-UI-001] Design system e componentes
**Complexidade:** L  
**Dependências:** INFRA-001

**Como** desenvolvedor  
**Quero** componentes reutilizáveis consistentes  
**Para** manter qualidade visual

**Critérios de Aceitação:**
- [ ] Paleta de cores definida (tema verde/regenerativo)
- [ ] Tipografia (Google Fonts)
- [ ] Componentes base:
  - Button (variants: primary, secondary, ghost)
  - Input, Textarea, Select
  - Modal, Drawer, Toast
  - Card, Badge, Avatar
  - Loading states, Skeleton
- [ ] Tailwind configurado com theme custom
- [ ] Storybook ou similar (opcional)
- [ ] Dark mode (opcional para MVP)
- [ ] Acessibilidade (ARIA labels, keyboard nav)

**Definição de Pronto:**
- Visual consistente em todo app
- Componentes documentados
- Acessibilidade básica

---

### 🎨 [P1-UI-002] Responsividade completa
**Complexidade:** M  
**Dependências:** Todas features

**Como** usuário mobile  
**Quero** usar o app confortavelmente no celular  
**Para** encontrar ecopontos em movimento

**Critérios de Aceitação:**
- [ ] Breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- [ ] Mapa full-height em mobile
- [ ] Filtros em bottom sheet (mobile)
- [ ] Modais em full-screen (mobile)
- [ ] Touch gestures funcionando
- [ ] Botões com target size >44px
- [ ] Testado em:
  - iPhone Safari
  - Android Chrome
  - iPad Safari
- [ ] Performance OK (Lighthouse >80)

**Definição de Pronto:**
- App usável em todos devices
- Sem scroll horizontal
- Lighthouse mobile >80

---

### 🚀 [P1-SEO-001] SEO e meta tags
**Complexidade:** S  
**Dependências:** UI-002

**Como** visitante do Google  
**Quero** encontrar o EcoMapa em buscas  
**Para** descobrir ecopontos

**Critérios de Aceitação:**
- [ ] Meta tags dinâmicas por página (Next.js Metadata API)
- [ ] Open Graph tags (Facebook, WhatsApp)
- [ ] Twitter Cards
- [ ] Sitemap.xml gerado automaticamente
- [ ] Robots.txt configurado
- [ ] Páginas de ecopontos com URLs amigáveis: /ecoponto/[slug]
- [ ] Structured Data (JSON-LD):
  - LocalBusiness schema para ecopontos
  - Organization para EcoMapa
- [ ] Canonical URLs
- [ ] Alt texts em imagens

**Definição de Pronto:**
- Google Search Console sem erros
- Preview cards bonitas
- Indexação funcionando

---

### 📱 [P2-PWA-001] Progressive Web App
**Complexidade:** M  
**Dependências:** UI-002

**Como** usuário mobile  
**Quero** instalar o EcoMapa como app  
**Para** acesso rápido sem abrir navegador

**Critérios de Aceitação:**
- [ ] manifest.json configurado
- [ ] Service Worker para cache
- [ ] Ícones em múltiplos tamanhos (192x192, 512x512)
- [ ] Splash screen
- [ ] Funciona offline (básico):
  - Mapa em cache
  - Últimos pontos visitados
  - Mensagem "Sem conexão"
- [ ] Prompt de instalação (A2HS)
- [ ] Lighthouse PWA score >80

**Definição de Pronto:**
- Instalável no iOS e Android
- Funciona offline (leitura)
- UX nativa

---

### 📊 [P2-ANALYTICS-001] Analytics e métricas
**Complexidade:** S  
**Dependências:** INFRA-003

**Como** administrador do EcoMapa  
**Quero** ver métricas de uso  
**Para** entender crescimento

**Critérios de Aceitação:**
- [ ] Google Analytics 4 ou Plausible instalado
- [ ] Eventos customizados:
  - ecopoint_view (id, categoria)
  - ecopoint_donate (id, amount)
  - ecopoint_review (id, rating)
  - import_start, import_complete
  - filter_used (categoria)
  - geolocation_enabled
- [ ] Dashboard interno (/admin/analytics) com:
  - DAU/MAU
  - Ecopontos por categoria
  - Doações totais
  - Conversão importação → validação
  - Mapa de calor de acessos
- [ ] Privacy-friendly (LGPD compliant)
- [ ] Cookie consent banner

**Definição de Pronto:**
- Eventos rastreiam corretamente
- Dashboard funciona
- LGPD OK

---

## 🎯 Métricas de Sucesso (KPIs)

### MVP Launch (3 meses)
- [ ] 100+ ecopontos cadastrados
- [ ] 50+ ecopontos validados
- [ ] 30 usuários ativos mensais
- [ ] 10 doações realizadas
- [ ] 3 cidades brasileiras representadas
- [ ] 0 bugs críticos em produção

### Crescimento (6 meses)
- [ ] 500+ ecopontos
- [ ] 200 usuários ativos mensais
- [ ] R$ 1.000 em doações
- [ ] 10 cidades
- [ ] 50% taxa de validação
- [ ] Menções em redes sociais/imprensa

---

**Última atualização:** 2025-11-16 (atualizado com progresso)
**Desenvolvedor:** Julio
**Contexto:** Vibe Coding com Regen Crypto Commons

## ✅ Resumo do Progresso

**Completados:**
- ✅ P0-INFRA-001 - Setup Next.js 16
- ✅ P0-INFRA-002 - Configuração Supabase com PostGIS
- ✅ P0-INFRA-003 - Deploy Netlify configurado
- ✅ P0-MAP-001 - Mapa básico Leaflet
- ✅ P0-MAP-002 - Geolocalização do usuário
- ✅ P0-MAP-003 - Toggle camadas (Ruas/Satélite)
- ✅ P0-MAP-004 - Círculos de raio de busca
- ✅ P0-POINT-001 - Seed de dados (22 ecopontos)
- ✅ P0-POINT-002 - Markers customizados com emojis
- ✅ P0-POINT-003 - Clustering de markers
- ✅ P0-POINT-004 - Popup ao clicar
- ✅ P0-FILTER-001 - Filtro por categoria
- ✅ P0-FILTER-002 - Filtro por raio de distância

**Próximos:**
- P0-POINT-005 - Modal detalhado do ecoponto
- P0-AUTH-001 - Autenticação
- P0-IMPORT-001 - Importação Google Maps