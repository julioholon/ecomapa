# EcoMapa

Mapeamento colaborativo de iniciativas regenerativas no Brasil.

## Sobre

EcoMapa torna visível a rede de ecopontos (feiras ecológicas, hortas comunitárias, ONGs, coletivos) em um raio de 1-5km da localização do usuário.

## Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TailwindCSS
- **Mapa**: Leaflet + React-Leaflet
- **Backend**: Supabase (PostgreSQL + PostGIS)
- **Auth**: Supabase Auth
- **Pagamentos**: PIX (Mercado Pago)
- **Hosting**: Netlify

## Setup

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd ecomapa

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Rodar em desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificar código com ESLint

## Estrutura

```
src/
├── app/          # App Router (páginas e rotas)
├── components/   # Componentes React reutilizáveis
└── lib/          # Utilitários, clients, helpers
```

## Contribuição

Projeto desenvolvido por Julio (@Regen Crypto Commons).

## Licença

ISC
