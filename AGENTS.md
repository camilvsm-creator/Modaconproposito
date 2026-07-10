# AfectadosTerremotoVE — Guía de desarrollo

## Comandos

- `npm run dev` — desarrollo (NO usar `npm run build`)
- `npx tsc --noEmit --pretty` — type check

## Reglas de oro

1. **NUNCA hacer DROP TABLE, DROP COLUMN, DROP BUCKET.** Siempre usar `alter table ... add column if not exists`, `on conflict do nothing`, etc.
2. **Antes de crear una tabla o bucket, verificar si ya existe** con `supabase list_tables` o `supabase_list_extensions` (MCP). Usar `on conflict do nothing` en inserts de buckets.
3. **Usar siempre las herramientas MCP de Supabase** para cambios en la DB (`apply_migration` para DDL, `execute_sql` para queries) y cargar la skill `supabase` antes de tocar la DB.
4. **Cargar la skill `supabase-postgres-best-practices`** al escribir queries complejas o RLS policies.

## Arquitectura del proyecto

El proyecto contiene **dos subsitios públicos** y un **panel admin unificado**:

### Subsitio principal (`/`)
Rutas públicas del sistema de reportes de daños:
- `/`, `/casos/*`, `/mapa`, `/reportar`, `/ofrecer-ayuda`, `/contacto`, etc.
- Layout: `app/layout.tsx` (global) — header y footer del sitio principal
- Colores: `primary` (#B42318, rojo), `primary-soft` (#FEE4E2)

### Subsitio Talleres / Promoda (`/talleres/*`)
Sección de talleres de confección con identidad propia:
- `/talleres`, `/talleres/[slug]`, `/talleres/necesidades`, `/talleres/patrones`, `/talleres/registro`
- Layout: `app/talleres/layout.tsx` — header y footer propios (reemplazan los globales)
- Colores: `#FF0B55` (hot pink), `#FFE4EC` (soft), `#D6003F` (dark)
- Icono: `Scissors` de lucide-react
- Subdominio: `promoda.afectadosterremotove.com` → `/talleres/*` (rewrite en `next.config.ts`)
- Queries públicas con `createSupabasePublicClient()` (anon key, filtra `status = 'publicado'`/`'activo'`)
- ISR: `revalidate = 300`

### Panel admin (`/admin/*`)
Panel unificado que sirve a ambos subsitios:
- Layout: `app/admin/layout.tsx` con `AdminShell` (sidebar + mobile tabs)
- Queries admin con `createSupabaseAdminClient()` (service_role, bypass RLS)
- Las páginas se protegen con `require*` de `lib/auth.ts`

## Roles de usuario

| Rol | Acceso | Se usa en |
|-----|--------|-----------|
| `admin` | Todo el sistema | `/admin/*` completo |
| `admin_talleres` | Solo gestión de talleres | `/admin/talleres/*` |
| `taller` | Solo su propio taller | `/admin/talleres/panel/*` |
| `volunteers_editor` | Gestión de voluntarios | `/admin/voluntarios/*` |
| `inspector` | Inspecciones | `/admin/inspecciones/*` |
| `admin_inspector` | Admin de inspecciones | `/admin/inspecciones/*`, usuarios |

Roles asignados via `app_metadata.role` en JWT. El rol `taller` se asigna al activar un taller mediante token.

## Supabase Clients

| Cliente | Key | RLS | Uso |
|---------|-----|-----|-----|
| `lib/supabase/admin.ts` → `createSupabaseAdminClient()` | `SUPABASE_SERVICE_ROLE_KEY` | Bypass (sin RLS) | Server actions, queries admin |
| `lib/supabase/server.ts` → `createSupabaseServerClient()` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Respeta RLS | SSR con cookie session, layouts |
| `lib/supabase/public.ts` → `createSupabasePublicClient()` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Respeta RLS | Páginas públicas, solo lectura |
| `lib/supabase/browser.ts` → `createSupabaseBrowserClient()` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Respeta RLS | Componentes client-side |

## Esquema de tablas (Talleres)

### `workshops` — Talleres registrados
- `id` (uuid PK), `user_id`, `name`, `slug` (unique), `status` (pendiente\|approved_pending_activation\|activo\|pausado\|rechazado)
- `responsible_name`, `email`, `phone`, `whatsapp`, `instagram`
- `state`, `city`, `municipality`, `public_location`
- `description`, `what_they_do`, `initial_photo_path`, `identity_document`
- `public_name_allowed`, `public_location_allowed`, `public_instagram_allowed`, `public_whatsapp_allowed`
- `admin_notes`, `approved_by`, `approved_at`, `rejected_at`
- `created_at`, `updated_at`

### `workshop_needs` — Necesidades de un taller
- `id`, `workshop_id` (FK workshops), `title`, `description`, `requested_items`, `urgency`
- `status` (pendiente\|publicada\|cubierta\|cerrada), `admin_notes`
- `published_at`, `closed_at`

### `workshop_photos` — Fotos de un taller
- `id`, `workshop_id` (FK workshops), `title`, `description`, `storage_path`
- `status` (pendiente\|aprobada\|rechazada), `uploaded_by`, `reviewed_by`, `reviewed_at`

### `workshop_help_offers` — Ofertas de ayuda
- `id`, `workshop_id`, `need_id`, `donor_name`, `donor_contact`
- `help_type`, `description`, `location`, `status` (recibida\|gestionada\|cerrada)

### `workshop_activation_tokens` — Tokens de activación
- `id`, `workshop_id`, `token_hash`, `expires_at`, `used_at`

### `sewing_patterns` — Patrones de costura
- `id`, `title`, `description`, `difficulty`, `category`, `file_path`
- `file_size_bytes`, `image_path`, `status` (pendiente\|publicado\|archivado)

## Storage Buckets (Talleres)

| Bucket | Visibilidad | Contenido |
|--------|-------------|-----------|
| `workshop-photos` | Público | Fotos subidas por talleres |
| `sewing-patterns` | Público | Archivos PDF/imagen de patrones |

## Convenciones de código

- **Tailwind**: valores arbitrarios `text-[#FF0B55]` para el subsitio talleres; no modificar `tailwind.config.ts` para colores del taller
- **Iconos**: lucide-react. Para talleres usar `Scissors` como icono principal
- **Layouts**: el root layout (`app/layout.tsx`) oculta `SiteHeader`/`SiteFooter` global en rutas `/talleres` (basado en header `x-pathname` seteado por middleware)
- **Paginación**: tipo `PagedResult<T>` con `page`, `limit`, `pageCount`, `items`, `total`
- **Server Actions**: usar `"use server"`, retornar `{ error?: string }`, llamar `revalidatePath()`
- **Formularios**: deben funcionar como página standalone y como modal embebido. No romper esa dualidad.
- **Modales**: usar `components/modal.tsx` (portal-based, focus trap, escape-to-close).
- **Botones de acción en detalle de caso** (`CaseActions`): abren modales, no navegan.
- **Rutas `/eliminar` y `/actualizar`**: redirigen a `/contacto?type=removal` e `/contacto?type=info` (config en `next.config.ts` redirects).
- **Al eliminar componentes o rutas**: verificar imports huérfanos con `npx tsc --noEmit --pretty`.
- **Mínimo `text-sm`**: no usar `text-xs` en ningún componente.
