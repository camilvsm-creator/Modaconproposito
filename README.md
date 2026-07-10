# promoda-talleres

Plataforma web de la Red de Talleres de Confeccion Promoda.
Conecta talleres de costura, voluntarios y aliados para confeccionar
productos textiles de apoyo a comunidades afectadas por el terremoto
en Venezuela (24 de junio de 2026).

## URLs

- **Produccion:** https://promoda.afectadosterremoto.com
- **Preview:** https://promoda-talleres.vercel.app
- **Admin:** https://promoda.afectadosterremoto.com/admin

## Stack

- **Framework:** Next.js 15 (App Router, React 19, TypeScript)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Email:** Resend
- **Estilos:** Tailwind CSS 3.4
- **Hosting:** Vercel

## Scripts

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run typecheck` | Verificacion de tipos (`tsc --noEmit`) |
| `npm run lint` | Linting con ESLint |

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

| Variable | Descripcion |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo server) |
| `RESEND_API_KEY` | API key de Resend (emails) |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio |
