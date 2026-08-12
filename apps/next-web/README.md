# Sanfran Next-Web

Este projeto é o front-end do catálogo Sanfran.md, construído com Next.js e Supabase.

## Segurança e Gestão de Segredos

Para garantir a segurança em produção, siga estas diretrizes:

1.  **Variáveis de Ambiente**:
    *   `NEXT_PUBLIC_SUPABASE_URL`: Pública.
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Pública.
    *   `SUPABASE_SERVICE_ROLE_KEY`: **SEGREDO CRÍTICO**. Nunca adicione o prefixo `NEXT_PUBLIC_`. Esta chave deve ser configurada apenas no painel do Netlify/Vercel.

2.  **Operações de Escrita**:
    *   Todas as operações de escrita (criação de skills, alteração de cargos) são realizadas via **Route Handlers** protegidos em `src/app/api`.
    *   O cliente Supabase do browser (`src/lib/supabase.ts`) deve ser usado apenas para autenticação e leituras permitidas por RLS.

3.  **Row Level Security (RLS)**:
    *   Certifique-se de que todas as tabelas no Supabase tenham RLS ativado via `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.

## Getting Started

Primeiro, instale as dependências e configure o arquivo `.env`:

```bash
npm install
cp .env.example .env
```

Depois, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.
