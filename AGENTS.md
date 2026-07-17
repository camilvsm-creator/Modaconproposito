# promoda-talleres - Guia de desarrollo

## Estado actual

Proyecto web de Promoda para coordinar una red de aliados textiles, voluntarios, colaboradores, tareas, materia prima, entregas, solicitudes de ayuda, mensajes y patrones de confeccion.

El nucleo estable actual es el modulo de aliados:

- Crear aliados desde admin.
- Categorizar aliados como `academia`, `taller`, `escuela` u `otro`.
- Editar datos principales del aliado.
- Generar enlaces de activacion.
- Activar cuenta de aliado con rol `aliado`.
- Desactivar/reactivar aliados sin borrar datos.
- Mostrar y filtrar categorias en admin y publico.
- Directorio publico `/aliados` y detalle publico `/aliados/[slug]`.

No asumir que los modulos marcados como `Mock` o `UI pendiente` estan completos aunque exista tabla en DB.

## Comandos

- `npm run dev` - desarrollo local.
- `npm run build` - build de produccion. Debe pasar antes de considerar estable un cambio.
- `npx tsc --noEmit --pretty` - type check principal.
- `npm run typecheck` - alias de typecheck sin pretty.

`npm run lint` existe en `package.json`, pero Next 15 puede no incluir `next lint` segun version/configuracion. No usarlo como unica verificacion.

## Reglas de oro

1. **NUNCA hacer `DROP TABLE`, `DROP COLUMN` ni `DROP BUCKET`.** Usar migraciones seguras con `create table if not exists`, `alter table ... add column if not exists`, `create index if not exists`, `on conflict do nothing`, renombres controlados o soft-delete.
2. **Antes de crear tablas, columnas, indices, constraints o buckets, verificar si ya existen** con `supabase_list_tables`, `supabase_list_extensions` o queries de catalogo.
3. **Usar herramientas MCP de Supabase para cambios de DB remota**: `supabase_apply_migration` para DDL y `supabase_execute_sql` para queries/diagnostico.
4. **Cargar la skill `supabase` antes de tocar Supabase**.
5. **Cargar la skill `supabase-postgres-best-practices`** al escribir queries complejas, indices o RLS policies.
6. **Toda migracion aplicada por MCP debe tener archivo local en `supabase/migrations/`** con el mismo timestamp/version que registra Supabase.
7. **No imprimir secretos** de `.env`, service role keys, anon keys, tokens ni passwords. Si se crea una credencial pedida por el usuario, responder solo esa credencial especifica.
8. **No exponer operaciones destructivas en UI.** Para aliados, usar `status = 'desactivado'`; no borrar aliados ni usuarios Auth desde flujos normales.

## Supabase y migraciones

Las migraciones remotas actuales incluyen:

- `20260717155803_promoda_clean_schema`
- `20260717160440_promoda_security_advisor_fixes`
- `20260717165328_rotate_workshops_to_allies_model`
- `20260717170647_restrict_ally_photos_bucket_listing`
- `20260717170922_consolidate_admin_role_policies`
- `20260717174314_stabilize_allies_modules`
- `20260717174554_finish_legacy_name_cleanup`

Archivos locales relevantes:

- `supabase/migrations/20260717174314_stabilize_allies_modules.sql`
- `supabase/migrations/20260717174554_finish_legacy_name_cleanup.sql`

Si se aplica una nueva migracion via MCP, crear o actualizar el archivo local correspondiente. No dejar cambios remotos sin representacion local.

Despues de tocar DB:

- Ejecutar `supabase_get_advisors` tipo `security`.
- Ejecutar `supabase_get_advisors` tipo `performance` si se agregaron indices, FKs, policies o tablas.
- Reportar advisors residuales con criterio; `unused_index` en tablas nuevas/vacias no es bloqueo inmediato.

## Arquitectura del proyecto

### Dominio

- `aliados`: academias, talleres, escuelas u otros aliados textiles.
- `tareas`: necesidades o trabajos asignados/publicados.
- `voluntarios`: personas registradas por Promoda; no tienen login por ahora.
- `colaboradores`: donantes/proveedores/empresas gestionados por Promoda; no tienen login por ahora.
- `materia prima`: inventario y asignaciones a aliados.
- `entregas`: entregas asociadas a aliados y opcionalmente a tareas.
- `solicitudes`: solicitudes hechas por instituciones/comunidades/ONG.
- `mensajes`: hilos admin-aliado.
- `patrones`: patrones de costura publicados.

### Rutas publicas

| Ruta | Descripcion | Datos |
|------|-------------|-------|
| `/` | Landing: mision, categorias, como funciona, CTAs | Estatico |
| `/aliados` | Directorio publico de aliados con filtro por categoria | ISR 300s |
| `/aliados/[slug]` | Detalle publico de aliado | ISR 300s |
| `/necesidades` | Tareas y necesidades publicadas | ISR 300s |
| `/patrones` | Catalogo de patrones de costura | ISR 300s |
| `/registro` | Formulario publico de registro de aliado | Estatico |
| `/voluntarios` | Registro publico de voluntarios | Client/Server action |
| `/adopta-una-cartuchera` | Formulario de donacion Cartuchera | Client/Server action |

Rutas legacy mantenidas por compatibilidad:

| Ruta | Comportamiento |
|------|----------------|
| `/ver-talleres` | Redirige a `/aliados` |
| `/[slug]` | Wrapper temporal del detalle publico |

### Admin (`/admin/*`)

Layout: `app/admin/layout.tsx` con `AdminShell`.
Protegido por middleware y guards en layouts con `lib/auth.ts`.

| Ruta | Descripcion | Estado |
|------|-------------|--------|
| `/admin` | Login o redirect segun rol | Estable |
| `/admin/logout` | Cerrar sesion | Estable |
| `/admin/activar-aliado` | Activacion por token | Estable |
| `/admin/aliados` | Resumen, listado, filtros, desactivar/reactivar, generar acceso | Estable |
| `/admin/aliados/[id]` | Detalle, edicion, generar acceso, desactivar/reactivar | Estable |
| `/admin/aliados/crear` | Crear aliado, categoria y link de activacion | Estable |
| `/admin/tareas` | Gestion de tareas asignadas | Parcial |
| `/admin/voluntarios` | Voluntarios y asignaciones existentes | Parcial/DB real |
| `/admin/colaboradores` | Ofertas de colaboradores | Parcial/DB real |
| `/admin/patrones` | Gestion de patrones | DB real |
| `/admin/cartuchera` | Donaciones Cartuchera | DB real |
| `/admin/solicitudes` | Solicitudes de ayuda | UI pendiente, DB existe |
| `/admin/materia-prima` | Materia prima consolidada | UI pendiente, DB existe |
| `/admin/entregas` | Entregas | UI pendiente, DB existe |
| `/admin/mensajes` | Mensajes admin-aliado | UI pendiente, DB existe |
| `/admin/reportes` | Estadisticas | UI pendiente |

### Panel del aliado (`/admin/aliado/*`)

Accesible por rol `aliado`; `admin` puede gestionar desde rutas admin.
El codigo mantiene wrappers temporales hacia `app/admin/talleres/panel/*` mientras se completa el renombrado interno.

| Ruta | Descripcion | Estado |
|------|-------------|--------|
| `/admin/aliado` | Dashboard del aliado | Parcial/DB real |
| `/admin/aliado/perfil` | Editar perfil | DB real |
| `/admin/aliado/tareas` | Tareas asignadas | DB real/parcial |
| `/admin/aliado/voluntarios` | Voluntarios asignados | UI pendiente, DB existe |
| `/admin/aliado/entregas` | Entregas propias | UI pendiente, DB existe |
| `/admin/aliado/materia-prima` | Materia prima asignada | UI pendiente, DB existe |
| `/admin/aliado/mensajes` | Mensajes con admin | UI pendiente, DB existe |

## Roles de usuario

| Rol | Acceso | Se usa en |
|-----|--------|-----------|
| `admin` | Todo el sistema | `/admin/*` completo |
| `aliado` | Solo su propio aliado | `/admin/aliado/*` |

Roles asignados via `app_metadata.role` en JWT. Nunca usar `user_metadata` para autorizacion.

El rol `aliado` se asigna al activar un aliado mediante token. El flujo crea un usuario Auth, marca `email_confirm: true`, asigna `app_metadata.role = 'aliado'`, vincula `allies.user_id` e inserta en `user_allies`.

## Flujos estables

### Crear aliado

Ruta: `/admin/aliados/crear`.

Debe:

- Validar nombre, categoria, responsable, email, estado, ciudad, ubicacion publica y `what_they_do`.
- Insertar en `allies` con `status = 'approved_pending_activation'`.
- Generar slug unico.
- Generar token en `ally_activation_tokens`.
- Enviar email si Resend esta configurado.
- Si falla email, mostrar error y conservar link para copiar.
- Redirigir al detalle si todo sale bien.

### Generar acceso

Disponible si el aliado no tiene `user_id` y no esta `pendiente`, `rechazado` ni `desactivado`.

Debe:

- Invalidar tokens anteriores marcando `used_at`.
- Crear token nuevo con expiracion de 7 dias.
- Mostrar link para copiar.
- No borrar aliados ni usuarios.

### Activar aliado

Ruta canonica: `/admin/activar-aliado?token=...`.
Wrapper legacy: `/admin/activar-taller`.

Debe:

- Validar token, expiracion y uso previo.
- Crear usuario Auth con rol `aliado`.
- Vincular `allies.user_id`.
- Insertar `user_allies`.
- Marcar token como usado.
- Pasar a `status = 'activo'` si estaba `approved_pending_activation`.

### Editar aliado

Ruta: `/admin/aliados/[id]?tab=editar`.

Debe permitir actualizar datos principales, categoria, visibilidad publica y notas admin. Debe revalidar rutas canonicas y legacy.

### Desactivar/reactivar aliado

Desactivar usa `status = 'desactivado'`. Reactivar usa `status = 'activo'`.

No borrar aliados, relaciones, fotos, tareas, tokens ni usuarios Auth desde la UI normal.

## Supabase Clients

| Cliente | Key | RLS | Uso |
|---------|-----|-----|-----|
| `lib/supabase/admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Bypass | Server actions admin, Auth Admin y migraciones puntuales desde backend |
| `lib/supabase/server.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` o publishable | Respeta RLS | SSR con cookie session |
| `lib/supabase/public.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Respeta RLS | Paginas publicas de solo lectura |
| `lib/supabase/browser.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` o publishable | Respeta RLS | Componentes client-side |

No usar service role en componentes client ni exponerlo via `NEXT_PUBLIC_*`.

## Esquema principal

### `allies` - Aliados registrados

- `id` (uuid PK), `user_id`, `name`, `slug`, `category`, `status`
- `responsible_name`, `email`, `phone`, `whatsapp`, `instagram`
- `state`, `city`, `municipality`, `public_location`
- `description`, `what_they_do`, `initial_photo_path`, `avatar_path`, `identity_document`
- flags de visibilidad publica, notas admin y timestamps

Categorias oficiales: `academia`, `taller`, `escuela`, `otro`.

Estados principales: `pendiente`, `approved_pending_activation`, `activo`, `pausado`, `rechazado`, `desactivado`.

### Tablas relacionadas

| Tabla | Proposito |
|-------|-----------|
| `user_allies` | Relacion entre usuarios Auth y aliados |
| `ally_activation_tokens` | Tokens de activacion |
| `assigned_tasks` | Tareas o necesidades asignadas/publicadas |
| `ally_photos` | Fotos de aliados |
| `collaborator_offers` | Ofertas de colaboradores |
| `volunteers` | Voluntarios registrados por Promoda |
| `ally_volunteer_assignments` | Asignacion de voluntarios a aliados |
| `collaborators` | Colaboradores gestionados por Promoda |
| `aid_requesters` | Solicitantes de ayuda |
| `aid_requests` | Solicitudes de ayuda |
| `raw_materials` | Inventario de materia prima |
| `ally_raw_material_assignments` | Materia prima asignada a aliados |
| `ally_deliveries` | Entregas de aliados |
| `message_threads` | Hilos de mensajes entre admin y aliados |
| `message_thread_participants` | Participantes de hilos de mensajes |
| `messages` | Mensajes enviados en cada hilo |
| `sewing_patterns` | Patrones de costura |
| `cartuchera_donations` | Donaciones Cartuchera |
| `audit_events` | Auditoria interna |

## Storage Buckets

| Bucket | Visibilidad | Contenido |
|--------|-------------|-----------|
| `ally-photos` | Publico controlado por policies | Fotos subidas por aliados |
| `sewing-patterns` | Publico | Archivos PDF/imagen de patrones |

No crear buckets nuevos sin verificar existencia. No hacer `DROP BUCKET`.

## Server Actions y data layer

| Archivo | Uso |
|---------|-----|
| `app/admin/talleres/actions.ts` | Acciones admin de aliados, tareas, fotos, colaboradores y activacion. Mantiene nombres `Workshop*` por compatibilidad interna. |
| `app/admin/talleres/panel/actions.ts` | Acciones del panel del aliado. Mantiene nombres `Workshop*` temporalmente. |
| `app/admin/talleres/patrones/actions.ts` | Acciones de patrones. |
| `app/admin/activar-taller/actions.ts` | Activacion de aliado por token. Wrapper temporal para `/admin/activar-aliado`. |
| `lib/workshops.ts` | Data layer principal de aliados y compatibilidad legacy. Queries nuevas deben apuntar a tablas `allies` y relacionadas. |
| `lib/workshop-submissions.ts` | Registro publico de aliados y ofertas de ayuda. Nombre legacy temporal. |
| `lib/cartuchera-submissions.ts` | Donaciones Cartuchera. |

Reglas para Server Actions:

- Usar `"use server"`.
- Retornar `{ error?: string }` y campos adicionales necesarios.
- Validar entradas en servidor aunque el formulario tenga `required`.
- Llamar `revalidatePath()` para rutas canonicas y wrappers legacy cuando aplique.
- No hacer operaciones destructivas salvo que el usuario lo pida explicitamente y haya confirmacion clara.

## Convenciones de codigo

- **Dominio nuevo**: UI, rutas y docs deben hablar de `aliados`, `tareas`, `colaboradores`, `voluntarios`, `materia prima`, `entregas`, `solicitudes` y `mensajes`.
- **Compatibilidad temporal**: algunos archivos, exports y componentes usan `Workshop*` o rutas bajo `app/admin/talleres/*`. No crear nuevas dependencias a esos nombres salvo wrappers temporales o para tocar codigo existente.
- **Queries nuevas**: usar `allies`, `assigned_tasks`, `ally_photos`, `collaborator_offers`, `volunteers`, `ally_volunteer_assignments`, `raw_materials`, `ally_raw_material_assignments`, `ally_deliveries`, `aid_requests`, `message_threads`, `messages`.
- **No usar tablas legacy**: no consultar `workshops`, `workshop_needs`, `workshop_photos`, `workshop_help_offers`, `workshop_volunteers`, `user_workshops` ni `workshop_activation_tokens`.
- **Tailwind**: usar valores arbitrarios como `text-[#FF0B55]` o `bg-[#F74897]` para Promoda; no modificar `tailwind.config.ts` para colores del dominio salvo necesidad clara.
- **Texto minimo**: no usar `text-xs`; minimo `text-sm`.
- **Iconos**: usar `lucide-react`.
- **Paginacion**: tipo `PagedResult<T>` con `page`, `limit`, `pageCount`, `items`, `total`.
- **Modales**: preferir `components/modal.tsx` si se agrega UI modal nueva.
- **Rojo**: reservar para acciones destructivas, estados de error o rechazo. Evitar usar rojo para acciones primarias.
- **Al eliminar componentes o rutas**: verificar imports huerfanos con `npx tsc --noEmit --pretty`.

## RLS y seguridad

- Toda tabla en `public` debe tener RLS habilitado.
- `admin` puede gestionar datos por policies basadas en `app_metadata.role`.
- `aliado` solo puede leer/modificar lo suyo segun `allies.user_id = auth.uid()` o participacion explicita.
- Publico anonimo solo debe poder leer datos publicados/aprobados y crear registros publicos permitidos.
- No usar `user_metadata` para autorizacion.
- No usar `auth.role()` en policies nuevas; usar `to authenticated`/`to anon` y predicados explicitos.
- Para `UPDATE`, incluir `USING` y `WITH CHECK` cuando se escriban policies nuevas.
- Evitar `SECURITY DEFINER` salvo necesidad fuerte y con revision de seguridad.

## Variables de entorno

Requeridas por la app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_SITE_URL` o `PROMODA_SITE_URL`

No imprimir valores. Si una variable falta, reportar el nombre faltante, no su contenido.

## QA obligatorio antes de declarar estable

Ejecutar:

- `npx tsc --noEmit --pretty`
- `npm run build`
- Supabase security advisors si se tocaron DB/Auth/RLS/Storage.

QA manual minimo para aliados:

- Crear aliado categoria `academia`.
- Crear aliado categoria `taller`.
- Editar categoria y datos.
- Generar link de acceso.
- Activar usuario con contraseña.
- Login como aliado.
- Ver `/admin/aliado`.
- Desactivar aliado.
- Confirmar que no aparece en `/aliados`.
- Reactivar aliado.
- Confirmar que vuelve a aparecer si esta publico/activo.
- Simular fallo de email y confirmar que el link queda visible para copiar.

## Modulos pendientes y prioridad

Antes de expandir funcionalidades nuevas, estabilizar lo existente.

Prioridad recomendada:

1. Aliados y activacion de usuarios.
2. Perfil del aliado.
3. Tareas asignadas.
4. Voluntarios asignados.
5. Materia prima.
6. Entregas.
7. Solicitudes.
8. Mensajes.
9. Reportes.

Reportes no requiere tabla propia inicialmente; debe salir de agregados sobre tablas existentes.

## Codigo heredado

El proyecto conserva wrappers y nombres internos heredados de `workshops/talleres` para reducir riesgo durante el refactor.

Permitido temporalmente:

- Imports existentes desde `app/admin/talleres/*`.
- Exports `Workshop*` que son aliases de `Ally*`.
- Wrappers de rutas legacy.

No permitido en codigo nuevo:

- Crear tablas `workshop_*`.
- Crear rutas nuevas bajo `/admin/talleres` salvo wrapper temporal.
- Escribir UI nueva hablando de `talleres` cuando el dominio correcto es `aliados`.
- Agregar borrado permanente de aliados en UI.
