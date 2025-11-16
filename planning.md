# EcoMapa - Planejamento de Desenvolvimento

## 🎯 Propósito
Mapeamento colaborativo de iniciativas regenerativas no Brasil. Torna visível a rede de ecopontos (feiras ecológicas, hortas comunitárias, ONGs, coletivos) em um raio de 1-5km da localização do usuário.

## 🏗️ Stack Técnico

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+, TailwindCSS
- **Mapa**: Leaflet + React-Leaflet
- **Camadas**: OpenStreetMap (ruas) + Satellite tiles
- **Estado**: React Context/Zustand para estado global
- **Auth**: Supabase Auth (Google OAuth + Email/Password)

### Backend
- **BaaS**: Supabase (PostgreSQL + PostGIS)
- **Hosting**: Netlify (Free tier)
- **Pagamentos**: PIX (API Stripe ou Mercado Pago)
- **Storage**: Supabase Storage (ícones, imagens de pontos)

### Database Schema (PostGIS)
```sql
-- Tabela principal de ecopontos
ecopoints (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  location geography(POINT, 4326), -- PostGIS
  category text[], -- Array de categorias
  address jsonb,
  contact jsonb (email, phone, website),
  images text[],
  status enum('pending', 'validated', 'rejected'),
  owner_id uuid REFERENCES auth.users,
  validated_by uuid REFERENCES auth.users,
  validated_at timestamp,
  created_at timestamp,
  updated_at timestamp
)

-- Categorias
categories (
  id uuid PRIMARY KEY,
  name text,
  icon text, -- emoji ou nome do ícone
  color text,
  slug text UNIQUE
)

-- Micro-doações
donations (
  id uuid PRIMARY KEY,
  ecopoint_id uuid REFERENCES ecopoints,
  user_id uuid REFERENCES auth.users,
  amount decimal,
  payment_id text, -- ID do PIX/Stripe
  status enum('pending', 'completed', 'failed'),
  created_at timestamp
)

-- Avaliações
reviews (
  id uuid PRIMARY KEY,
  ecopoint_id uuid REFERENCES ecopoints,
  user_id uuid REFERENCES auth.users,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp
)

-- Reputação do usuário
user_reputation (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  points integer DEFAULT 0,
  donations_count integer DEFAULT 0,
  reviews_count integer DEFAULT 0,
  updated_at timestamp
)
```

## 🎨 Categorias de Ecopontos

| Emoji | Categoria | Slug |
|-------|-----------|------|
| 🥕 | Alimentação regenerativa | alimentacao-regenerativa |
| 🛍️ | Consumo consciente | consumo-consciente |
| 🔄 | Economia circular | economia-circular |
| 🌳 | Natureza e biodiversidade | natureza-biodiversidade |
| 🌱 | Agroecologia urbana | agroecologia-urbana |
| 🤝 | Comunidades e coletivos | comunidades-coletivos |
| 🛠️ | Oficinas e aprendizado | oficinas-aprendizado |
| 🏢 | ONGs e organizações | ongs-organizacoes |

## 📋 Features MVP (em ordem de prioridade)

### 1. Mapa + Visualização de Pontos
**Funcionalidades:**
- Mapa interativo com Leaflet
- Toggle entre camadas: Ruas (OSM) e Satélite
- Geolocalização do usuário (browser API)
- Raios de busca: 1km, 2km, 5km (círculos visuais)
- Clusters de marcadores quando zoom out
- Pins customizados por categoria (emojis)
- Popup ao clicar: nome, categoria, descrição resumida
- Modal detalhado: todas as informações do ecoponto

**Dados Iniciais:**
- Importação manual via interface admin
- Seeding com dados das fontes: Ekonavi, Feiras Orgânicas, etc.

### 2. Sistema de Importação do Google Maps
**Funcionalidades:**
- Campo de busca: "Sustentabilidade São Paulo"
- Integração com Google Places API
- Lista de resultados com checkbox
- Preview dos pontos selecionados
- Categorização manual pelo usuário
- Botão "Importar Selecionados"
- Status: "pending" até validação

**Fluxo:**
1. Usuário faz busca no Google Maps
2. Seleciona pontos relevantes
3. Categoriza cada ponto
4. Importa para o banco (status: pending)
5. Email automático enviado para contato do ponto

### 3. Sistema de Validação (Administradores de Pontos)
**Funcionalidades:**
- Email de convite com token único
- Landing page de validação
- Administrador cria conta ou faz login
- Confirma/edita informações do ecoponto
- Adiciona fotos, redes sociais, horários
- Status muda de "pending" para "validated"
- Habilita recebimento de micro-doações

**Estados dos Pontos:**
- **Pending**: Pode receber reviews, não pode receber doações
- **Validated**: Pode receber reviews e doações
- **Rejected**: Não aparece no mapa

### 4. Sistema de Micro-doações
**Funcionalidades:**
- Botão "Apoiar" em pontos validados
- Modal com valores sugeridos (R$ 5, 10, 20, custom)
- Integração PIX via Mercado Pago ou Stripe
- QR Code para pagamento
- Confirmação de pagamento (webhook)
- User ganha +10 pontos de reputação
- Ecoponto ganha visibilidade (badge "Apoiado pela comunidade")
- Dashboard para administrador ver doações recebidas

**Gamificação:**
- Ranking de usuários mais engajados
- Badges: "Apoiador Bronze" (3 doações), "Prata" (10), "Ouro" (25)
- Ecopontos "Destaque do Mês" (mais apoiados)

## 🔐 Autenticação e Permissões

### Níveis de Acesso
1. **Anônimo**: Visualiza mapa, busca pontos
2. **Usuário Logado**: + Reviews, doações
3. **Admin de Ponto**: + Gerencia seus ecopontos
4. **Super Admin**: + Modera todos os pontos

### Supabase Auth
```typescript
// Providers
- Google OAuth
- Email/Password

// Row Level Security (RLS)
- ecopoints: Leitura pública, escrita apenas owner
- reviews: Leitura pública, escrita apenas user_id
- donations: Leitura apenas owner/admin
```

## 🗺️ Arquitetura de Componentes

```
app/
├── (public)/
│   ├── page.tsx              # Mapa principal
│   ├── ecoponto/[id]/        # Detalhes do ponto
│   └── sobre/                # Sobre o projeto
├── (auth)/
│   ├── login/
│   ├── cadastro/
│   └── validar-ponto/[token]/
├── dashboard/
│   ├── meus-pontos/          # Admin de pontos
│   ├── importar/             # Google Maps import
│   └── perfil/               # Reputação, histórico
└── admin/                    # Super admin

components/
├── Map/
│   ├── MapContainer.tsx      # Wrapper Leaflet
│   ├── EcopointMarker.tsx    # Pin customizado
│   ├── RadiusCircle.tsx      # Círculos 1-5km
│   ├── CategoryFilter.tsx    # Filtros laterais
│   └── LayerToggle.tsx       # Ruas/Satélite
├── Ecopoint/
│   ├── EcopointCard.tsx      # Preview card
│   ├── EcopointModal.tsx     # Detalhes completos
│   └── DonationButton.tsx    # Micro-doações
└── Import/
    ├── GooglePlacesSearch.tsx
    └── ImportPreview.tsx

lib/
├── supabase/
│   ├── client.ts
│   └── queries.ts
├── maps/
│   └── geocoding.ts
└── payments/
    └── pix.ts
```

## 🚀 Roadmap de Desenvolvimento

### Sprint 1: Setup + Mapa Básico (1 semana)
- [ ] Setup Next.js + Supabase + Netlify
- [ ] Database schema + migrations
- [ ] Componente de mapa Leaflet
- [ ] Geolocalização do usuário
- [ ] Toggle ruas/satélite
- [ ] Seed inicial de dados (10-20 pontos SP)

### Sprint 2: Visualização de Pontos (1 semana)
- [ ] Markers customizados por categoria
- [ ] Filtros por categoria (sidebar)
- [ ] Raios de busca (1km, 2km, 5km)
- [ ] Clustering de markers
- [ ] Popup básico ao clicar
- [ ] Modal detalhado do ecoponto

### Sprint 3: Importação Google Maps (1 semana)
- [ ] Integração Google Places API
- [ ] Interface de busca e seleção
- [ ] Categorização manual
- [ ] Importação para banco (pending)
- [ ] Email de convite (SendGrid/Resend)

### Sprint 4: Validação de Pontos (1 semana)
- [ ] Auth Supabase (Google + Email)
- [ ] Landing de validação com token
- [ ] Dashboard admin de ponto
- [ ] Edição de informações
- [ ] Upload de fotos (Supabase Storage)
- [ ] Mudança de status (pending → validated)

### Sprint 5: Micro-doações (1 semana)
- [ ] Integração Mercado Pago (PIX)
- [ ] Modal de doação
- [ ] QR Code geração
- [ ] Webhook confirmação
- [ ] Sistema de reputação
- [ ] Dashboard de doações recebidas

### Sprint 6: Reviews + Polimento (1 semana)
- [ ] Sistema de avaliações (1-5 estrelas)
- [ ] Comentários
- [ ] Perfil do usuário (reputação, badges)
- [ ] Ranking de ecopontos (mais apoiados)
- [ ] Mobile responsive
- [ ] SEO + meta tags

## 🌐 Fontes de Dados Iniciais

```typescript
// Script de seeding
const dataSources = [
  {
    name: 'Ekonavi',
    url: 'https://ekonavi.com/map',
    method: 'scraping' // ou API se disponível
  },
  {
    name: 'Feiras Orgânicas',
    url: 'https://feirasorganicas.org.br/',
    method: 'manual' // importação inicial
  },
  {
    name: 'Rede Pindorama',
    url: 'https://rede.pindorama.org.br/',
    method: 'manual'
  },
  {
    name: 'Transition Network',
    url: 'https://maps.transitionnetwork.org/',
    method: 'API' // verificar disponibilidade
  },
  {
    name: 'Karte von Morgen',
    url: 'https://www.kartevonmorgen.org/',
    method: 'API' // OpenFairDB API
  }
]
```

## 📱 Responsividade

### Desktop (>1024px)
- Mapa full screen com sidebar de filtros
- Lista de pontos em painel lateral (opcional)

### Mobile (<768px)
- Mapa full screen
- Filtros em bottom sheet
- Detalhes em modal bottom-to-top
- Geolocalização obrigatória

## 🔧 Pontos Técnicos Importantes

### Performance
- Lazy loading de markers (viewport-based)
- Clustering com Leaflet.markercluster
- Imagens otimizadas (Next.js Image)
- Caching de consultas geoespaciais

### Geolocalização
```typescript
// Browser Geolocation API
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords
    // Centralizar mapa + buscar pontos em raio
  },
  (error) => {
    // Fallback: São Paulo centro
    const fallbackCoords = [-23.5505, -46.6333]
  }
)
```

### Queries Geoespaciais (PostGIS)
```sql
-- Buscar pontos em raio de X km
SELECT * FROM ecopoints
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326)::geography,
  $radius * 1000  -- raio em metros
)
AND status = 'validated'
ORDER BY location <-> ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326);
```

### Email Templates
- Convite para validação de ponto
- Confirmação de doação
- Notificação de nova review

## 💰 Modelo de Receita (Futuro)

Embora o MVP seja focado em micro-doações, potenciais evoluções:
- % pequeno das doações (5-10%) para manutenção
- Perfis premium para ONGs (destaque no mapa)
- API paga para empresas/governos
- Parcerias com marcas regenerativas

## 🎯 Métricas de Sucesso

- **Adoção**: 100 ecopontos cadastrados (3 meses)
- **Engajamento**: 50 usuários ativos mensais
- **Validação**: 60% dos pontos importados validados
- **Doações**: R$ 1000 em micro-doações (6 meses)
- **Geografia**: Presença em 3 cidades brasileiras

## 📚 Referências Técnicas

- [Leaflet Docs](https://leafletjs.com/)
- [React-Leaflet](https://react-leaflet.js.org/)
- [Supabase PostGIS](https://supabase.com/docs/guides/database/extensions/postgis)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Mercado Pago PIX](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/pix)

---

**Última atualização**: 2025-11-16
**Desenvolvedor**: Julio (@Regen Crypto Commons)
**Status**: Planejamento → Desenvolvimento