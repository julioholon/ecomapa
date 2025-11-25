# EcoMapa

Mapeamento colaborativo de iniciativas regenerativas no Brasil.

## Sobre

EcoMapa torna visível a rede de ecopontos (feiras ecológicas, hortas comunitárias, ONGs, coletivos) em um raio de 1-5km da localização do usuário.

## Stack

- **Frontend**: Next.js 16+ (App Router), React 18+, TailwindCSS
- **Mapa**: Leaflet + React-Leaflet + Markercluster
- **Backend**: Supabase (PostgreSQL + PostGIS)
- **Auth**: Supabase Auth (Email/Senha + Google OAuth)
- **Pagamentos**: PIX (em desenvolvimento)
- **Hosting**: Netlify

## Setup

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no [Supabase](https://supabase.com)
- (Opcional) API Key do Google Maps para importação

### 1. Clonar e Instalar

```bash
# Clonar repositório
git clone https://github.com/julioholon/ecomapa.git
cd ecomapa

# Instalar dependências
npm install
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings > Database** e copie o Connection String
3. Vá em **Settings > API** e copie:
   - Project URL
   - anon public key

4. Habilite PostGIS:
   - Vá em **Database > Extensions**
   - Procure por `postgis` e habilite

5. Execute as migrations:
   ```bash
   # Instalar Supabase CLI
   npm install -g supabase

   # Login no Supabase
   npx supabase login

   # Linkar com seu projeto
   npx supabase link --project-ref SEU_PROJECT_REF

   # Aplicar migrations
   npm run db:push
   ```

6. (Opcional) Carregar dados de exemplo:
   - Execute o SQL em `supabase/seed/ecopoints.sql` no SQL Editor do Supabase

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local`:

```bash
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Google Places API (opcional - para importação)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_google_aqui

# Resend (obrigatório - para emails de validação)
RESEND_API_KEY=re_sua_chave_aqui
EMAIL_FROM=EcoMapa <seu-email@dominio.com>
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Tokens de validação (opcional - gerado automaticamente se não configurado)
VALIDATION_TOKEN_SECRET=sua_string_secreta_aqui
VALIDATION_TOKEN_EXPIRATION_DAYS=90

# Stripe PIX (futuro)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```


#### Obter API Key do Google Maps (opcional)

Para usar a funcionalidade de importação do Google Maps:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services > Library**
4. Ative as seguintes APIs:
   - **Places API**
   - **Maps JavaScript API**
5. Vá em **APIs & Services > Credentials**
6. Clique em **Create Credentials > API Key**
7. (Recomendado) Restrinja a chave:
   - **Application restrictions**: HTTP referrers
   - Adicione seus domínios (ex: `localhost:3000/*`, `seusite.netlify.app/*`)
   - **API restrictions**: Selecione apenas Places API e Maps JavaScript API
8. Copie a chave e adicione ao `.env.local`

**Nota**: O Google oferece $200/mês de créditos gratuitos, suficiente para ~40.000 requisições de Places API.

#### Obter API Key do Resend (obrigatório)

Para enviar emails de validação aos ecopontos importados:

1. Acesse [Resend](https://resend.com) e crie uma conta
2. No dashboard, vá em **API Keys**
3. Clique em **Create API Key**
4. Dê um nome (ex: "EcoMapa Production") e copie a chave
5. Adicione ao `.env.local` como `RESEND_API_KEY`
6. Configure o domínio de envio:
   - **Desenvolvimento**: Use o domínio padrão `onboarding@resend.dev` (limite de 100 emails/dia)
   - **Produção**: Adicione e verifique seu próprio domínio em **Domains**
7. Atualize `EMAIL_FROM` no `.env.local` com seu email verificado

**Nota**: Resend oferece 3.000 emails/mês no plano gratuito. Perfeito para começar!

### 4. Rodar em Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### 5. Deploy no Netlify

1. Conecte o repositório no [Netlify](https://app.netlify.com)
2. O arquivo `netlify.toml` já está configurado
3. Adicione as variáveis de ambiente no Netlify Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (opcional)
   - `RESEND_API_KEY` (obrigatório)
   - `EMAIL_FROM` (obrigatório)
   - `NEXT_PUBLIC_SITE_URL` (use sua URL do Netlify, ex: https://ecomapa.netlify.app)
   - `VALIDATION_TOKEN_SECRET` (recomendado para produção)
4. Deploy automático acontece a cada push para `main`

### 6. Fazer Deploy (Push para Netlify)

Sempre que você fizer alterações e quiser fazer deploy:

```bash
# 1. Adicionar arquivos modificados
git add .

# 2. Criar commit
git commit -m "Descrição das mudanças"

# 3. Fazer push para GitHub (dispara deploy automático no Netlify)
git push origin main
```

O Netlify detectará o push e iniciará o build automaticamente. Você pode acompanhar o progresso em:
- [Netlify Dashboard](https://app.netlify.com) → Seu projeto → Deploys

**Importante**: Antes do primeiro deploy, não esqueça de:
- Aplicar as migrations no Supabase (via SQL Editor ou `npm run db:push`)
- Configurar todas as variáveis de ambiente no Netlify

## Scripts

- `npm run dev` - Servidor de desenvolvimento (Turbopack)
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificar código com ESLint
- `npm run db:push` - Aplicar migrations no Supabase
- `npm run db:pull` - Puxar schema do Supabase
- `npm run db:reset` - Reset banco (cuidado!)

## Estrutura

```
src/
├── app/              # App Router (páginas e rotas)
│   ├── login/        # Autenticação
│   ├── cadastro/     # Registro de usuários
│   ├── dashboard/    # Área logada
│   └── auth/         # Callback OAuth
├── components/
│   ├── Map/          # Mapa Leaflet e controles
│   ├── Filters/      # Filtros de categoria e raio
│   ├── Ecopoint/     # Modal de detalhes
│   ├── Auth/         # Rotas protegidas
│   └── Layout/       # Header, Footer
├── contexts/         # React Context (Auth)
├── hooks/            # Custom hooks (geolocation, ecopoints)
└── lib/
    ├── supabase/     # Cliente e tipos
    └── constants/    # Categorias e config
```

## Funcionalidades

- Mapa interativo com Leaflet
- Geolocalização do usuário
- Filtros por categoria e raio de distância
- Clustering de markers
- Alternância entre camadas (Ruas/Satélite)
- Círculos de raio dinâmicos
- Modal detalhado de ecopontos
- Autenticação (Email/Google)
- Importação de lugares do Google Maps (mock)
- Deploy contínuo no Netlify

## Contribuição

Projeto desenvolvido por Julio (@Regen Crypto Commons) em vibe coding com Claude Code!.

## Licença

ISC
