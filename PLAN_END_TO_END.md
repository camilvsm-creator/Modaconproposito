# Plan End To End De La Plataforma Promoda

## Objetivo

Completar la plataforma para que Promoda pueda operar de punta a punta su red de:

- solicitantes de ayuda
- aliados
- colaboradores
- voluntarios
- tareas
- materia prima
- entregas
- mensajes
- reportes

El sistema debe permitir registrar, coordinar, ejecutar, entregar, confirmar y medir el trabajo de la red con trazabilidad por usuario, organización y flujo operativo.

## Estado Actual Resumido

### Estable o bastante funcional

- aliados
- activación de aliados
- perfil del aliado
- solicitudes básicas
- activación de solicitantes
- tareas
- materia prima base
- entregas base

### Parcial

- colaboradores
- voluntarios
- patrones
- cartuchera

### Pendiente o placeholder

- mensajes
- reportes

## Flujo Operativo Objetivo

1. Un solicitante se registra o es creado por admin.
2. El solicitante crea una solicitud de ayuda.
3. Admin revisa la solicitud.
4. Admin la convierte en una o varias tareas para uno o varios aliados.
5. Admin asigna materia prima a cada tarea.
6. El aliado inicia la tarea, reporta avance y consumo real.
7. Admin crea la entrega desde la tarea completada.
8. El aliado marca la entrega como entregada.
9. El solicitante confirma recepción.
10. El sistema cierra tarea y solicitud cuando corresponde.
11. Reportes consolidan operación, inventario, tiempos e impacto.

## Principios De Implementación

- Mantener módulos por dominio, no por rol.
- El rol cambia alcance, no crea árboles nuevos de rutas.
- Toda operación sensible debe tener trazabilidad mínima.
- El estado de cada flujo debe ser visible desde admin.
- No agregar borrado permanente en flujos normales.
- Priorizar cambios pequeños y acumulativos verificables.

## Fase 1. Cerrar El Núcleo Operativo

### Objetivo

Dejar completamente sólido el flujo solicitud -> tarea -> materia prima -> entrega -> recepción.

### Alcance

#### Solicitudes

- editar solicitudes existentes
- editar solicitantes existentes
- desactivar/reactivar solicitantes
- filtros por estado, tipo, organización y fecha
- notas internas admin
- cierre manual y reapertura por admin
- mejor detalle de relación solicitud -> tareas -> entregas

#### Tareas

- detalle operativo más claro por tarea
- notas de bloqueo o incidencias
- historial visible de cambios de estado
- mejor distinción entre necesidad pública y tarea interna
- control más claro de estados válidos

#### Materia prima

- entradas manuales de stock
- ajustes manuales de inventario
- devoluciones al inventario
- merma o pérdida
- movimiento de inventario por tipo
- stock bajo / agotado visible

#### Entregas

- recepción con evidencia y notas
- entregas parciales
- reprogramación o cancelación
- mejor trazabilidad de entrega por solicitud
- estado logístico más claro

### Entregables

- módulo de solicitudes robusto para admin y solicitante
- inventario con movimientos básicos
- entregas con cierre más completo
- flujo de tarea con menos ambigüedad de estados

### Criterio de cierre

- una solicitud puede vivir todo el flujo sin apoyo manual fuera del sistema
- admin puede revisar todo el caso desde solicitudes, tareas o entregas
- solicitante puede crear, seguir y confirmar su ayuda
- aliado puede ejecutar y reportar sin intervención técnica

## Fase 2. Completar La Capa De Coordinación

### Objetivo

Agregar comunicación y seguimiento transversal entre actores.

### Alcance

#### Mensajes

- listado de hilos
- hilo por aliado
- hilo por solicitante
- mensajes admin <-> aliado
- mensajes admin <-> solicitante
- estados abierto/cerrado
- leído/no leído
- acceso por rol y contexto correcto

#### Auditoría visible

- usar `audit_events` para mostrar eventos clave
- historial de acciones por solicitud, tarea y entrega
- bitácora simple de quién hizo qué y cuándo

### Entregables

- módulo de mensajes funcional
- trazabilidad visible mínima en UI

### Criterio de cierre

- Promoda puede coordinar la operación dentro del sistema sin depender de WhatsApp para todo

## Fase 3. Completar La Gestión De Voluntarios

### Objetivo

Pasar de registro suelto a operación real de voluntariado.

### Alcance

- pipeline de voluntarios:
  - postulado
  - revisado
  - aprobado
  - asignado
  - inactivo
- revisión admin de postulaciones
- alta al padrón de voluntarios activos
- asignación a aliados o tareas
- disponibilidad y habilidades
- notas internas
- vista del aliado con sus voluntarios asignados

### Entregables

- módulo de voluntarios end-to-end

### Criterio de cierre

- un voluntario puede pasar de postulación pública a asignación operativa trazable

## Fase 4. Completar La Gestión De Colaboradores

### Objetivo

Transformar ofertas sueltas en red gestionable de colaboradores.

### Alcance

- ficha de colaborador como entidad propia
- historial de aportes
- clasificación por tipo
- estado del colaborador
- vinculación con solicitudes, tareas o materia prima
- matching entre necesidad y colaborador
- conversión de oferta en acción concreta

### Entregables

- módulo de colaboradores como CRM operativo básico

### Criterio de cierre

- Promoda puede saber quién aporta, qué aporta, a quién ayuda y con qué resultado

## Fase 5. Completar Inventario Y Logística

### Objetivo

Cerrar trazabilidad real de recursos físicos y entregas.

### Alcance

- ledger simple de inventario
- entradas, salidas, ajustes, devoluciones y mermas
- origen de materia prima:
  - compra
  - donación
  - devolución
- asignación y consumo consolidado por tarea y aliado
- programación de entregas
- recepción parcial o total
- incidencias logísticas

### Entregables

- materia prima y entregas con gestión logística suficiente para operación diaria

### Criterio de cierre

- el stock y las entregas reflejan el estado real de campo con mínima ambigüedad

## Fase 6. Reportes Y Gestión Ejecutiva

### Objetivo

Permitir dirección operativa y medición de impacto.

### Alcance

#### Reportes operativos

- solicitudes abiertas, convertidas y cerradas
- tareas por estado
- tiempos promedio por etapa
- entregas pendientes y recibidas
- inventario actual y consumo

#### Reportes de red

- aliados activos
- solicitantes activos
- colaboradores activos
- voluntarios activos

#### Reportes de impacto

- solicitudes atendidas por periodo
- unidades entregadas
- organizaciones beneficiadas
- producción por aliado

#### Exportación

- CSV básico para solicitudes, tareas, entregas e inventario

### Entregables

- módulo `/admin/reportes` funcional

### Criterio de cierre

- Promoda puede gestionar y presentar resultados sin exportes manuales improvisados

## Fase 7. Cerrar Módulos Complementarios

### Patrones

- edición admin completa
- mejor clasificación y búsqueda
- relación opcional con tipos de tarea

### Cartuchera

- seguimiento posterior a la donación
- trazabilidad de asignación y cierre

## Cambios Técnicos Transversales Necesarios

### Modelo de datos

- revisar si hace falta tabla de movimientos de inventario
- revisar si hace falta soporte explícito para entregas parciales
- revisar si hace falta soporte para múltiples usuarios por solicitante a futuro

### Estados y vocabulario

- normalizar estados de tareas
- documentar transiciones válidas
- separar claramente:
  - necesidad pública
  - tarea interna

### UI/UX

- páginas de detalle por entidad
- filtros consistentes
- tablas y cards alineadas entre módulos
- mensajes de error y éxito más claros

### Seguridad y acceso

- revisar RLS final de todos los módulos nuevos
- consolidar permisos por rol
- evitar lecturas innecesarias con service role en SSR cuando no haga falta

## Orden De Ejecución Recomendado

1. cerrar núcleo operativo
2. mensajes
3. voluntarios
4. colaboradores
5. inventario y logística avanzada
6. reportes
7. patrones y cartuchera

## Dependencias Entre Fases

- mensajes depende poco y se puede avanzar pronto
- reportes depende de que los flujos operativos estén estables
- inventario avanzado depende de cerrar primero el flujo básico de materia prima
- colaboradores y voluntarios dependen de definir bien su relación con tareas y solicitudes

## Criterios De “Listo Para Build”

Antes de considerar el módulo end-to-end terminado:

1. todos los roles principales funcionan:
- admin
- aliado
- solicitante

2. el flujo completo se puede probar:
- crear solicitante
- activar solicitante
- crear solicitud
- convertir a tarea
- asignar materia prima
- ejecutar tarea
- registrar entrega
- confirmar recepción
- cerrar solicitud

3. los módulos no core críticos tienen al menos cobertura mínima:
- mensajes
- voluntarios
- colaboradores
- reportes

4. validaciones y restricciones de negocio están en server actions y DB

5. QA técnico completo:
- `npx tsc --noEmit --pretty`
- `npm run build`
- advisors de Supabase `security`
- advisors de Supabase `performance` revisados con criterio

## QA Funcional Recomendado

### Solicitudes

- crear solicitante desde admin
- generar acceso
- activar cuenta
- crear solicitud como solicitante
- editar solicitud abierta

### Tareas

- convertir solicitud en tarea
- asignar aliado
- iniciar tarea como aliado
- completar tarea

### Materia prima

- cargar inventario
- asignar material a tarea
- reportar consumo real
- probar ajuste o devolución

### Entregas

- crear entrega desde tarea completada
- marcar entregada como aliado
- marcar recibida como solicitante
- confirmar cierre automático de solicitud

### Voluntarios

- registrar voluntario
- aprobarlo
- asignarlo a aliado o tarea

### Colaboradores

- registrar oferta
- convertirla en relación operativa

### Mensajes

- abrir hilo
- responder como admin
- responder como aliado o solicitante

### Reportes

- validar conteos y estados contra datos reales

## Riesgos Principales

- mezcla de estados legacy y nuevos en tareas
- duplicidad entre “necesidad pública” y “tarea interna”
- falta de inventario transaccional más robusto si la operación crece
- módulos parciales pueden generar datos útiles pero no suficientes para reportes confiables

## Resultado Esperado Final

Al terminar este plan, la plataforma debe permitir que Promoda:

- gestione su red de aliados, solicitantes, colaboradores y voluntarios
- convierta necesidades en operación productiva trazable
- controle materia prima y entregas
- coordine a los actores desde el sistema
- mida ejecución e impacto

Ese es el punto correcto para considerar el producto listo para build final, QA integral y estabilización.
