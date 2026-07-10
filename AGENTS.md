# promoda-talleres — Guia de desarrollo

## Comandos

- `npm run dev` — desarrollo
- `npm run build` — build de produccion
- `npx tsc --noEmit --pretty` — type check

## Reglas de oro

1. **NUNCA hacer DROP TABLE, DROP COLUMN, DROP BUCKET.** Siempre usar `alter table ... add column if not exists`, `on conflict do nothing`, etc.
2. **Antes de crear una tabla o bucket, verificar si ya existe** con `supabase list_tables` o `supabase_list_extensions` (MCP). Usar `on conflict do nothing` en inserts de buckets.
3. **Usar siempre las herramientas MCP de Supabase** para cambios en la DB (`apply_migration` para DDL, `execute_sql` para queries) y cargar la skill `supabase` antes de tocar la DB.
4. **Cargar la skill `supabase-postgres-best-practices`** al escribir queries complejas o RLS policies.

## Arquitectura del proyecto

Plataforma web para la Red de Talleres de Confeccion Promoda. Conecta talleres de costura, voluntarios y aliados para confeccionar productos textiles de apoyo.

### Rutas publicas

| Ruta | Descripcion | Datos |
|------|-------------|-------|
| `/` | Landing: "Nuestra Mision", como funciona, CTAs | Estatico |
| `/[slug]` | Detalle publico de taller | ISR 300s |
| `/ver-talleres` | Directorio de talleres (paginado, busquedable) | ISR 300s |
| `/necesidades` | Necesidades publicadas por talleres | ISR 300s |
| `/patrones` | Catalogo de patrones de costura (por categoria) | ISR 300s |
| `/registro` | Formulario de registro de taller | Estatico |
| `/adopta-una-cartuchera` | Formulario de donacion "Cartuchera" | Client |

Layout: `app/layout.tsx` — header con nav, footer, Analytics + SpeedInsights.

### Panel admin (`/admin/*`)

Layout: `app/admin/layout.tsx` con `AdminShell` (sidebar desktop + tabs mobile).
Protegido por middleware (solo `/admin/:path*`) + guards en layouts con `lib/auth.ts`.

#### Rutas admin

| Ruta | Descripcion | Datos |
|------|-------------|-------|
| `/admin` | Login o redirect segun rol | Auth |
| `/admin/logout` | Cerrar sesion (POST) | Auth |
| `/admin/activar-taller` | Activacion por token | DB real |
| `/admin/talleres/talleres` | Lista de talleres | Mock |
| `/admin/talleres/talleres/[id]` | Detalle de taller | Mock |
| `/admin/talleres/necesidades` | Gestion de necesidades | Mock |
| `/admin/talleres/ofertas` | Ofertas de ayuda | DB real |
| `/admin/talleres/fotos` → `/evidencias` | Redirect a evidencias | Redirect |
| `/admin/talleres/evidencias` | Galeria de evidencias | Mock |
| `/admin/talleres/cartuchera` | Donaciones cartuchera | DB real |
| `/admin/talleres/patrones` | Gestion de patrones | DB real |
| `/admin/talleres/aliados` | Aliados | Mock |
| `/admin/talleres/configuracion` | Configuracion | Mock |
| `/admin/talleres/entregas` | Entregas | Mock |
| `/admin/talleres/materiales` | Materiales consolidados | Mock |
| `/admin/talleres/mensajes` | Anuncios/mensajes | Mock |
| `/admin/talleres/producciones` | Seguimiento produccion | Mock |
| `/admin/talleres/reportes` | Estadisticas | Mock |
| `/admin/talleres/voluntarios` | Voluntarios | Mock |
| `/admin/talleres/vista-nacional` | Vista nacional con progreso | Mock |

#### Panel del taller (`/admin/talleres/panel/*`)

Accesible solo por rol `taller` (y `admin`/`admin_talleres`).
Layout: `app/admin/talleres/panel/layout.tsx` con `WorkshopProvider` (React context).

| Ruta | Descripcion | Datos |
|------|-------------|-------|
| `/admin/talleres/panel` | Dashboard del taller | DB real |
| `/admin/talleres/panel/perfil` | Editar perfil | DB real |
| `/admin/talleres/panel/necesidades` | Necesidades del taller | DB real |
| `/admin/talleres/panel/fotos` | Fotos del taller | DB real |
| `/admin/talleres/panel/producciones` | Producciones | Mock |
| `/admin/talleres/panel/materiales` | Materiales | Mock |
| `/admin/talleres/panel/voluntarios` | Voluntarios | Mock |
| `/admin/talleres/panel/entregas` | Entregas | Mock |
| `/admin/talleres/panel/mensajes` | Mensajes/chat | Mock |

## Roles de usuario

| Rol | Acceso | Se usa en |
|-----|--------|-----------|
| `admin` | Todo el sistema | `/admin/*` completo |
| `admin_talleres` | Gestion de talleres | `/admin/talleres/*` |
| `taller` | Solo su propio taller | `/admin/talleres/panel/*` |

Roles asignados via `app_metadata.role` en JWT. El rol `taller` se asigna al activar un taller mediante token.

## Supabase Clients

| Cliente | Key | RLS | Uso |
|---------|-----|-----|-----|
| `lib/supabase/admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Bypass (sin RLS) | Server actions, queries admin |
| `lib/supabase/server.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Respeta RLS | SSR con cookie session, layouts |
| `lib/supabase/public.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Respeta RLS | Paginas publicas, solo lectura |
| `lib/supabase/browser.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Respeta RLS | Componentes client-side |

## Esquema de tablas

### `workshops` — Talleres registrados
- `id` (uuid PK), `user_id`, `name`, `slug` (unique), `status` (pendiente|approved_pending_activation|activo|pausado|rechazado)
- `responsible_name`, `email`, `phone`, `whatsapp`, `instagram`
- `state`, `city`, `municipality`, `public_location`
- `description`, `what_they_do`, `initial_photo_path`, `identity_document`
- `public_name_allowed`, `public_location_allowed`, `public_instagram_allowed`, `public_whatsapp_allowed`
- `admin_notes`, `approved_by`, `approved_at`, `rejected_at`
- `created_at`, `updated_at`

### `workshop_needs` — Necesidades de un taller
- `id`, `workshop_id` (FK workshops), `title`, `description`, `requested_items`, `urgency`
- `status` (pendiente|publicada|cubierta|cerrada), `admin_notes`
- `published_at`, `closed_at`

### `workshop_photos` — Fotos de un taller
- `id`, `workshop_id` (FK workshops), `title`, `description`, `storage_path`
- `status` (pendiente|aprobada|rechazada), `uploaded_by`, `reviewed_by`, `reviewed_at`

### `workshop_help_offers` — Ofertas de ayuda
- `id`, `workshop_id`, `need_id`, `donor_name`, `donor_contact`
- `help_type`, `description`, `location`, `status` (recibida|gestionada|cerrada)

### `workshop_activation_tokens` — Tokens de activacion
- `id`, `workshop_id`, `token_hash`, `expires_at`, `used_at`

### `sewing_patterns` — Patrones de costura
- `id`, `title`, `description`, `difficulty`, `category`, `file_path`
- `file_size_bytes`, `image_path`, `status` (pendiente|publicado|archivado)

### `cartuchera_submissions` — Donaciones Cartuchera
- Campos del formulario de donacion (ver `lib/cartuchera-submissions.ts`)

## Storage Buckets

| Bucket | Visibilidad | Contenido |
|--------|-------------|-----------|
| `workshop-photos` | Publico | Fotos subidas por talleres |
| `sewing-patterns` | Publico | Archivos PDF/imagen de patrones |

## Server Actions

| Archivo | Acciones |
|---------|----------|
| `app/admin/talleres/actions.ts` | `updateWorkshopStatusAction`, `approveWorkshopAction`, `sendWorkshopActivationEmailAction`, `generateWorkshopActivationLinkAction`, `updateWorkshopAction`, `updateNeedStatusAction`, `updateNeedAdminNotesAction`, `updatePhotoStatusAction`, `updateHelpOfferStatusAction` |
| `app/admin/talleres/patrones/actions.ts` | `updatePatternStatusAction`, `updatePatternAction`, `createPatternAction` |
| `app/admin/talleres/panel/actions.ts` | `updateWorkshopProfileAction`, `createWorkshopNeedAction`, `closeWorkshopNeedAction`, `uploadWorkshopPhotoAction`, `uploadWorkshopAvatarAction` |
| `app/admin/activar-taller/actions.ts` | `activateWorkshopFromTokenAction` |
| `lib/workshop-submissions.ts` | `submitWorkshopRegistration`, `submitWorkshopHelpOffer` |
| `lib/cartuchera-submissions.ts` | `submitCartucheraDonation` |

## Convenciones de codigo

- **Tailwind**: valores arbitrarios `text-[#FF0B55]` para Promoda; no modificar `tailwind.config.ts` para colores del taller
- **Iconos**: lucide-react
- **Paginacion**: tipo `PagedResult<T>` con `page`, `limit`, `pageCount`, `items`, `total`
- **Server Actions**: usar `"use server"`, retornar `{ error?: string }`, llamar `revalidatePath()`
- **Modales**: usar `components/modal.tsx` (portal-based, focus trap, escape-to-close)
- **Al eliminar componentes o rutas**: verificar imports huerfanos con `npx tsc --noEmit --pretty`
- **Minimo `text-sm`**: no usar `text-xs` en ningun componente

## Theme switching

El admin shell aplica `data-theme="promoda"` cuando el rol es `admin_talleres`, `taller` o `admin`.
Esto cambia las CSS variables a los colores hot pink (#FF0B55) en vez del rojo earthquake (#B42318).

## Codigo heredado

Algunos archivos en `lib/` contienen tipos y constantes del sistema original de reportes de danos por terremoto (`lib/types.ts`, `lib/constants.ts`). Estos se mantienen por compatibilidad pero las rutas y tablas asociadas no existen en este proyecto.
