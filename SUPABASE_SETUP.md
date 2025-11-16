# Configuração do Supabase

## 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Escolha nome: `ecomapa`
4. Defina uma senha forte para o banco
5. Selecione região mais próxima (São Paulo)
6. Aguarde o setup (~2 minutos)

## 2. Habilitar PostGIS

1. No dashboard, vá em **Database** → **Extensions**
2. Busque por `postgis`
3. Clique no toggle para habilitar
4. Confirme a instalação

## 3. Executar Migrations

No **SQL Editor** do Supabase, execute os arquivos na ordem:

```bash
supabase/migrations/
├── 001_initial_schema.sql    # Schema das tabelas
├── 002_rls_policies.sql      # Row Level Security
└── 003_seed_categories.sql   # Categorias iniciais

supabase/seed/
└── ecopoints.sql             # 22 ecopontos de exemplo (SP, RJ, BH)
```

### Ordem de execução:

1. Cole o conteúdo de `001_initial_schema.sql` e execute
2. Cole o conteúdo de `002_rls_policies.sql` e execute
3. Cole o conteúdo de `003_seed_categories.sql` e execute
4. (Opcional) Cole o conteúdo de `supabase/seed/ecopoints.sql` para dados de exemplo

## 4. Configurar Autenticação

1. Vá em **Authentication** → **Providers**
2. Habilite **Email** (já vem habilitado)
3. Para Google OAuth:
   - Habilite **Google**
   - Configure Client ID e Secret do Google Cloud Console
   - Adicione redirect URL fornecido pelo Supabase

## 5. Obter Credenciais

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 6. Configurar .env.local

```bash
cp .env.example .env.local
```

Edite o arquivo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 7. Verificar Instalação

```bash
npm run dev
```

O projeto deve iniciar sem erros de configuração.

## Estrutura do Banco

### Tabelas

- **categories**: Categorias de ecopontos (8 tipos)
- **ecopoints**: Pontos no mapa com localização PostGIS
- **donations**: Histórico de micro-doações
- **reviews**: Avaliações dos usuários
- **user_reputation**: Gamificação e badges

### Row Level Security (RLS)

- **Leitura pública**: categories, ecopoints (validated/pending), reviews, user_reputation
- **Escrita autenticada**: ecopoints (owner), reviews (autor), donations (doador)
- **Escrita restrita**: donations só leitura para owner do ecopoint

### Índices Otimizados

- `ecopoints_location_idx`: Busca geoespacial (GIST)
- `ecopoints_category_idx`: Filtro por categoria (GIN)
- `ecopoints_status_idx`: Filtro por status
- `ecopoints_email_idx`: Busca por email

## Queries Úteis

### Buscar ecopontos em raio

```sql
SELECT * FROM ecopoints
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(-46.6333, -23.5505), 4326)::geography,
  5000  -- 5km em metros
)
AND status = 'validated'
ORDER BY location <-> ST_SetSRID(ST_MakePoint(-46.6333, -23.5505), 4326);
```

### Contar ecopontos por categoria

```sql
SELECT unnest(category) as cat, count(*)
FROM ecopoints
WHERE status = 'validated'
GROUP BY cat;
```

## Troubleshooting

### Erro: PostGIS não encontrado

Verifique se a extensão foi habilitada corretamente em Database → Extensions.

### Erro: RLS blocking access

Verifique se as políticas foram criadas corretamente. Para debug:

```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'ecopoints';
```

### Erro: Foreign key violation

Certifique-se de que o auth.users existe (usuário logado no Supabase Auth).
