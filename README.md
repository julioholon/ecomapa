# EcoMapa

Mapeamento colaborativo de iniciativas regenerativas no Brasil.

## Sobre

EcoMapa torna visível a rede de ecopontos (feiras ecológicas, hortas comunitárias, ONGs, coletivos) em um raio de 1-5km da localização do usuário.

## Stack

- **Frontend**: Next.js 16+ (App Router), React 18+, TailwindCSS
- **Mapa**: Leaflet + React-Leaflet + Markercluster
- **Backend**: Supabase (PostgreSQL + PostGIS)
- **Auth**: Supabase Auth (Email/Senha + Google OAuth)
- **Pagamentos**: MercadoPago (PIX + Cartão de Crédito)
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

# MercadoPago (obrigatório - para doações via PIX e cartão)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=sua_chave_secreta_webhook
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

#### Obter Chaves do MercadoPago (obrigatório)

Para aceitar doações via PIX e cartão de crédito:

1. **Criar conta no MercadoPago**:
   - Acesse [MercadoPago Developers](https://www.mercadopago.com.br/developers) e crie uma conta
   - Complete o processo de cadastro (conta grátis)

2. **Criar uma aplicação**:
   - No dashboard, vá em **Suas integrações > Criar aplicação**
   - Escolha um nome (ex: "EcoMapa")
   - Selecione **Pagamentos online** como solução
   - Clique em **Criar aplicação**

3. **Obter as credenciais**:
   - Na sua aplicação, vá em **Credenciais de produção** ou **Credenciais de teste**
   - Você verá duas chaves:
     - **Public key** (começa com `APP_USR-...`) → Copie para `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
     - **Access token** (começa com `APP_USR-...`) → Copie para `MERCADOPAGO_ACCESS_TOKEN`
   - ⚠️ **Nunca** exponha o Access token no código frontend!

4. **PIX está habilitado por padrão**:
   - O MercadoPago já vem com PIX ativado automaticamente
   - Não precisa fazer configuração adicional
   - Funciona imediatamente no modo teste e produção

5. **Configurar Webhook** (importante para confirmar pagamentos):
   - Na sua aplicação, vá em **Webhooks**
   - Clique em **Configurar notificações**
   - **URL de notificação**:
     - Desenvolvimento: Use [ngrok](https://ngrok.com) ou similar: `https://seu-id.ngrok.io/api/webhooks/mercadopago`
     - Produção: `https://seu-site.netlify.app/api/webhooks/mercadopago`
   - **Eventos**: Selecione **Pagamentos**
   - Copie uma string secreta qualquer e adicione ao `.env.local` como `MERCADOPAGO_WEBHOOK_SECRET`
   - Salve a configuração

6. **Testar pagamentos no modo teste**:
   - Use as [credenciais de teste do MercadoPago](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing)
   - Para PIX: Use o app do MercadoPago ou carteiras de teste
   - Para cartões: Use os números de teste fornecidos na documentação
   - **Cartão aprovado**: `5031 4332 1540 6351` - CVV: 123 - Validade: qualquer data futura

7. **Produção** (quando estiver pronto):
   - Troque as **Credenciais de teste** pelas **Credenciais de produção** no `.env.local`
   - Atualize o webhook endpoint para a URL de produção
   - Verificação da conta acontece automaticamente conforme você recebe pagamentos

**Notas importantes**:
- O MercadoPago cobra **2,49% + R$ 0,39** por transação com PIX (mais barato que Stripe!)
- Para cartões de crédito: 4,99% + R$ 0,39 por transação
- Modo teste é gratuito e ilimitado
- Webhooks são **essenciais** para o fluxo de doações funcionar corretamente
- PIX no MercadoPago funciona imediatamente, sem lista de espera

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
   - `MERCADOPAGO_ACCESS_TOKEN` (obrigatório - use credencial de produção)
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` (obrigatório - use credencial de produção)
   - `MERCADOPAGO_WEBHOOK_SECRET` (obrigatório)
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
│   ├── api/          # API Routes
│   │   ├── create-payment-intent/    # Criar pagamento (PIX/Cartão)
│   │   ├── payment-status/           # Polling de status de pagamento
│   │   ├── webhooks/mercadopago/     # Webhook MercadoPago (confirmação)
│   │   ├── send-validation-email/    # Enviar email de validação
│   │   ├── send-donation-email/      # Enviar email de doação recebida
│   │   ├── reviews/                  # CRUD de avaliações
│   │   ├── withdrawals/request/      # Solicitar saque de doações
│   │   └── verify-token/             # Verificar token HMAC
│   ├── login/        # Autenticação
│   ├── cadastro/     # Registro de usuários
│   ├── dashboard/    # Área logada
│   │   ├── importar/           # Importar do Google Maps
│   │   ├── meus-pontos/        # Gerenciar ecopontos
│   │   ├── perfil/             # Perfil do usuário
│   │   ├── doacoes/            # Doações recebidas
│   │   └── solicitar-saque/    # Solicitar saque
│   ├── auth/         # Callback OAuth
│   └── validar-ponto/[token]/  # Validação de ecopontos
├── components/
│   ├── Map/          # Mapa Leaflet e controles
│   ├── Filters/      # Filtros de categoria e raio
│   ├── Ecopoint/     # Modal de detalhes
│   ├── Donation/     # Modal de doação (PIX/Cartão)
│   ├── Review/       # Modal de avaliação
│   ├── Auth/         # Rotas protegidas
│   └── Layout/       # Header, Footer
├── contexts/         # React Context (Auth)
├── hooks/            # Custom hooks (geolocation, ecopoints)
└── lib/
    ├── supabase/     # Cliente e tipos Supabase
    ├── mercadopago/  # Configuração MercadoPago
    ├── resend/       # Templates de email (React Email)
    └── constants/    # Categorias e config

supabase/
├── migrations/       # Migrações do banco de dados
│   ├── 20241116170001_initial_schema.sql        # Schema inicial
│   ├── 20251128_add_reviews_system.sql          # Sistema de reviews
│   ├── 20251129_update_rpc_with_rating_fields.sql  # RPC com ratings
│   ├── 20251201_create_profiles_table.sql       # Tabela pública de perfis
│   ├── 20251202_fix_reviews_user_fk.sql         # FK de reviews para profiles
│   └── 20251203_add_updated_at_to_reviews.sql   # Coluna updated_at
└── seed/             # Dados de exemplo
```

## Funcionalidades

### Mapa e Navegação
- Mapa interativo com Leaflet
- Geolocalização do usuário
- Filtros por categoria e raio de distância
- Clustering de markers
- Alternância entre camadas (Ruas/Satélite)
- Círculos de raio dinâmicos
- Modal detalhado de ecopontos

### Autenticação e Usuários
- Autenticação com Email/Senha e Google OAuth
- Sistema de reputação e badges
- Pontos por doações (+10 pts) e avaliações (+5 pts)
- Badges: Apoiador Bronze/Prata/Ouro, Explorador
- Perfil público com histórico de atividades

### Doações
- Pagamentos via PIX (QR Code dinâmico)
- Pagamentos via Cartão de Crédito (em breve)
- Valores sugeridos: R$ 5, 10, 20 ou custom (R$ 2-1000)
- Confirmação automática via webhooks
- Sistema de reputação integrado
- Sistema de saques para proprietários (taxa 10%)

### Avaliações (Reviews)
- Sistema de avaliação com 1 a 5 estrelas
- Comentários opcionais (até 500 caracteres)
- Badge "Visitou este local" para reviews verificadas
- Rating médio atualizado automaticamente
- Edição de reviews existentes
- Reputação +5 pontos por avaliação
- Exibição de nomes dos autores via perfis públicos

### Administração
- Importação de lugares do Google Maps
- Sistema de validação de ecopontos via email
- Dashboard para gerenciar ecopontos
- Dashboard de doações recebidas
- Sistema de solicitação de saques
- Deploy contínuo no Netlify

## Contribuição

Projeto desenvolvido por Julio (@Regen Crypto Commons) em vibe coding com Claude Code!.

## Licença

ISC
