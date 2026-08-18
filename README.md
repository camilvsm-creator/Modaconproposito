# Promoda Talleres

Plataforma web para coordinar aliados textiles, tareas de producción, materia prima, entregas, voluntarios, colaboradores, solicitantes y mensajes.

La aplicación está construida con Next.js, React, TypeScript y Supabase.

## Desarrollo local

```bash
npm install
npm run dev
```

Validaciones disponibles:

```bash
npm run typecheck
npm run build
```

El build de producción debe ejecutarse como parte del proceso de entrega o despliegue.

## Módulos administrativos

- `/admin/aliados`: gestión de aliados y accesos.
- `/admin/tareas`: tareas asignadas, con detalle por pestañas y edición en `/admin/tareas/[id]?tab=produccion`.
- `/admin/materia-prima`: inventario, asignaciones y movimientos.
- `/admin/entregas`: entregas y recepción.
- `/admin/voluntarios`: red y asignaciones.
- `/admin/colaboradores`: colaboradores y ofertas.
- `/admin/solicitantes`: organizaciones solicitantes y accesos.
- `/admin/solicitudes`: solicitudes de ayuda.
- `/admin/mensajes`: conversaciones entre administración, aliados y solicitantes.
- `/marketplace`: catálogo público de productos de aliados.
- `/admin/marketplace`: productos, inventario, pedidos, pagos y entregas del marketplace.

El administrador tiene alcance global. Los roles `aliado` y `solicitante` solo pueden consultar y modificar los recursos que les corresponden.

## Mensajes y Realtime

El módulo de mensajes usa las tablas `message_threads`, `message_thread_participants` y `messages`.

- Los hilos se crean desde administración.
- Los mensajes se envían desde el detalle del hilo.
- Los mensajes nuevos se reciben con Supabase Realtime mediante Postgres Changes.
- El detalle muestra el estado de la conexión Realtime para facilitar las pruebas.
- El cuerpo de cada mensaje admite hasta 4.000 caracteres.
- El asunto admite hasta 160 caracteres.
- No se permiten archivos adjuntos en la versión actual.

Para probar Realtime, abre el mismo hilo con dos usuarios distintos —por ejemplo, administración y un aliado— en dos navegadores. Ambos deben mostrar `Tiempo real activo`; al enviar desde uno, el mensaje debe aparecer en el otro sin recargar.

Los límites de conexiones, eventos y payload dependen del plan de Supabase. Consulta la [referencia oficial de límites de Realtime](https://supabase.com/docs/guides/realtime/limits).

## Supabase

Las migraciones locales se encuentran en `supabase/migrations/`. Las tablas públicas usan RLS y las políticas deben autorizar por rol y pertenencia al recurso.

Variables principales:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` y `RESEND_FROM_EMAIL` para correos transaccionales

No exponer nunca la service role key en componentes del navegador ni en variables `NEXT_PUBLIC_*`.
