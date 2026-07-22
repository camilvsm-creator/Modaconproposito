import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { GenerateRequesterAccessButton } from "@/components/generate-requester-access-button";
import { Modal } from "@/components/modal";
import { Button, SectionCard, compactInputClassName } from "@/components/ui";
import {
  AID_REQUEST_STATUSES,
  AID_REQUEST_STATUS_LABELS,
  AID_REQUEST_STATUS_TONES,
  AID_REQUESTER_STATUS_LABELS,
  AID_REQUESTER_STATUS_TONES,
  AID_REQUESTER_TYPE_LABELS,
  AID_REQUESTER_TYPES,
  URGENCY_LABELS,
  URGENCY_LEVELS,
} from "@/lib/constants";
import { requireRequestsUser, requireWorkshopAdminUser } from "@/lib/auth";
import { getActiveAlliesForSelect } from "@/lib/production";
import {
  getAdminAidRequestersFiltered,
  getAdminAidRequestsFiltered,
  getRequesterAidRequests,
} from "@/lib/requesters";
import { cn, formatDate } from "@/lib/utils";

import { requireCurrentRequester } from "../requester-scope";
import {
  createAidRequestAction,
  createAidRequesterAction,
  createTaskFromAidRequestAction,
  updateAidRequestAction,
  updateAidRequesterAction,
  updateAidRequesterStatusAction,
} from "./actions";

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export default async function AdminSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRequestsUser();
  const params = await searchParams;
  const q = getStringParam(params, "q");
  const status = getStringParam(params, "status");

  if (user.app_metadata?.role === "solicitante") {
    const requester = await requireCurrentRequester();
    const requests = await getRequesterAidRequests(requester.id, {
      q,
      status,
    });

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Solicitudes"
          title="Solicitudes de ayuda"
          description="Registra necesidades de tu organización y sigue el estado de producción y entrega."
          navigation={{ baseHref: "/admin/entregas", baseLabel: "Entregas", currentLabel: "Solicitudes" }}
        />

        <div className="flex flex-wrap justify-end gap-3">
          <Modal triggerLabel="Editar organizacion" title="Organización" description="Actualiza los datos principales de tu organización.">
            <form action={updateAidRequesterAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="requesterId" value={requester.id} />
              <input className={compactInputClassName} name="name" defaultValue={requester.name} required />
              <select className={compactInputClassName} name="type" defaultValue={requester.type}>
                {AID_REQUESTER_TYPES.map((type) => (
                  <option key={type} value={type}>{AID_REQUESTER_TYPE_LABELS[type]}</option>
                ))}
              </select>
              <input className={compactInputClassName} name="contactName" defaultValue={requester.contact_name ?? ""} required />
              <input className={compactInputClassName} name="email" type="email" defaultValue={requester.email ?? ""} />
              <input className={compactInputClassName} name="phone" defaultValue={requester.phone ?? ""} />
              <input className={compactInputClassName} name="location" defaultValue={requester.location ?? ""} />
              <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="notes" defaultValue={requester.notes ?? ""} />
              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <Button type="submit" variant="secondary">Actualizar organización</Button>
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", AID_REQUESTER_STATUS_TONES[requester.status] ?? "bg-stone-100 text-stone-600")}>{AID_REQUESTER_STATUS_LABELS[requester.status] ?? requester.status}</span>
              </div>
            </form>
          </Modal>

          <Modal triggerLabel="Nueva solicitud" title="Nueva solicitud" description="Registra una nueva necesidad para tu organización.">
            <form action={createAidRequestAction} className="grid gap-4 md:grid-cols-2">
              <input className={compactInputClassName} name="title" required placeholder="Título" />
              <select className={compactInputClassName} name="urgency" defaultValue="">
                <option value="">Urgencia</option>
                {URGENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>{URGENCY_LABELS[level]}</option>
                ))}
              </select>
              <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" placeholder="Describe la necesidad" />
              <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="requestedItems" placeholder="Ej. 10 franelas talla mixta para refugio temporal" />
              <div className="md:col-span-2">
                <Button type="submit">Registrar solicitud</Button>
              </div>
            </form>
          </Modal>
        </div>

        <form action="/admin/solicitudes" method="get" className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar por título o descripción" />
          <select className={compactInputClassName} name="status" defaultValue={status ?? "all"}>
            <option value="all">Todos los estados</option>
            {AID_REQUEST_STATUSES.map((item) => (
              <option key={item} value={item}>{AID_REQUEST_STATUS_LABELS[item]}</option>
            ))}
          </select>
          <Button type="submit">Filtrar</Button>
        </form>

        {requests.length ? (
          <div className="space-y-4">
            {requests.map((request) => {
              const canEdit = ["recibida", "en_revision"].includes(request.status);

              return (
                <SectionCard key={request.id} className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-ink">{request.title}</h2>
                      <span className={cn("rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", AID_REQUEST_STATUS_TONES[request.status] ?? "bg-stone-100 text-stone-700")}>{AID_REQUEST_STATUS_LABELS[request.status] ?? request.status}</span>
                    </div>
                    {request.description ? <p className="text-sm text-stone-600">{request.description}</p> : null}
                    {request.requested_items ? <p className="text-sm text-stone-500"><span className="font-medium text-stone-700">Solicitado:</span> {request.requested_items}</p> : null}
                    <p className="text-sm text-stone-500">Registrada: {formatDate(request.created_at)}</p>
                  </div>

                  {canEdit ? (
                    <Modal triggerLabel="Editar solicitud" title={request.title} description="Actualiza esta solicitud mientras siga abierta o en revisión.">
                      <form action={updateAidRequestAction} className="grid gap-3 md:grid-cols-2">
                        <input type="hidden" name="requestId" value={request.id} />
                        <input className={compactInputClassName} name="title" defaultValue={request.title} required />
                        <select className={compactInputClassName} name="urgency" defaultValue={request.urgency ?? ""}>
                          <option value="">Urgencia</option>
                          {URGENCY_LEVELS.map((level) => (
                            <option key={level} value={level}>{URGENCY_LABELS[level]}</option>
                          ))}
                        </select>
                        <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" defaultValue={request.description ?? ""} />
                        <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="requestedItems" defaultValue={request.requested_items ?? ""} />
                        <div className="md:col-span-2">
                          <Button type="submit" variant="secondary">Actualizar solicitud</Button>
                        </div>
                      </form>
                    </Modal>
                  ) : null}

                  {request.tasks?.length ? (
                    <div className="space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-4">
                      <h3 className="text-sm font-semibold text-ink">Tareas asociadas</h3>
                      {request.tasks.map((task) => (
                        <div key={task.id} className="text-sm text-stone-600">
                          {task.title} {task.ally?.name ? `- ${task.ally.name}` : ""} ({task.status})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-500">Promoda aún no ha convertido esta solicitud en tarea.</p>
                  )}
                </SectionCard>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Sin solicitudes registradas" description="Cuando registres tu primera solicitud aparecerá aquí junto a su estado de producción." />
        )}
      </div>
    );
  }

  await requireWorkshopAdminUser();
  const requesterStatus = getStringParam(params, "requesterStatus");
  const requesterType = getStringParam(params, "requesterType");
  const requesterId = getStringParam(params, "requesterId");

  const [requesters, requests, allies] = await Promise.all([
    getAdminAidRequestersFiltered({ q, status: requesterStatus, type: requesterType }),
    getAdminAidRequestsFiltered({ q, status, requesterId }),
    getActiveAlliesForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Solicitudes"
        title="Solicitudes de ayuda"
        description="Registra solicitantes, genera accesos, revisa solicitudes y conviértelas en tareas para los aliados."
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Solicitudes" }}
      />

      <div className="flex flex-wrap justify-end gap-3">
        <Modal triggerLabel="Nuevo solicitante" title="Crear solicitante" description="Registra una nueva organización solicitante.">
        <form action={createAidRequesterAction} className="grid gap-4 md:grid-cols-2">
          <input className={compactInputClassName} name="name" required placeholder="Nombre de la organización" />
          <select className={compactInputClassName} name="type" defaultValue="institucion">
            {AID_REQUESTER_TYPES.map((type) => (
              <option key={type} value={type}>{AID_REQUESTER_TYPE_LABELS[type]}</option>
            ))}
          </select>
          <input className={compactInputClassName} name="contactName" required placeholder="Persona responsable" />
          <input className={compactInputClassName} name="email" type="email" placeholder="Correo de contacto" />
          <input className={compactInputClassName} name="phone" placeholder="Teléfono" />
          <input className={compactInputClassName} name="location" placeholder="Ubicación" />
          <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="notes" placeholder="Notas" />
          <div className="md:col-span-2">
            <Button type="submit">Guardar solicitante</Button>
          </div>
        </form>
        </Modal>

        <Modal triggerLabel="Nueva solicitud" title="Crear solicitud desde admin" description="Registra una solicitud en nombre de un solicitante existente.">
        <form action={createAidRequestAction} className="grid gap-4 md:grid-cols-2">
          <select className={compactInputClassName} name="requesterId" required defaultValue="">
            <option value="" disabled>Selecciona solicitante</option>
            {requesters.map((requester) => (
              <option key={requester.id} value={requester.id}>{requester.name}</option>
            ))}
          </select>
          <input className={compactInputClassName} name="title" required placeholder="Título" />
          <select className={compactInputClassName} name="urgency" defaultValue="">
            <option value="">Urgencia</option>
            {URGENCY_LEVELS.map((level) => (
              <option key={level} value={level}>{URGENCY_LABELS[level]}</option>
            ))}
          </select>
          <div className="hidden md:block" />
          <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" placeholder="Describe la necesidad" />
          <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="requestedItems" placeholder="Resultado esperado o cantidades solicitadas" />
          <div className="md:col-span-2">
            <Button type="submit">Registrar solicitud</Button>
          </div>
        </form>
        </Modal>
      </div>

      <SectionCard className="p-6">
        <h2 className="text-lg font-semibold text-ink">Filtros</h2>
        <form action="/admin/solicitudes" method="get" className="mt-4 grid gap-3 md:grid-cols-5">
          <input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar texto" />
          <select className={compactInputClassName} name="status" defaultValue={status ?? "all"}>
            <option value="all">Estado solicitud</option>
            {AID_REQUEST_STATUSES.map((item) => (
              <option key={item} value={item}>{AID_REQUEST_STATUS_LABELS[item]}</option>
            ))}
          </select>
          <select className={compactInputClassName} name="requesterStatus" defaultValue={requesterStatus ?? "all"}>
            <option value="all">Estado solicitante</option>
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <select className={compactInputClassName} name="requesterType" defaultValue={requesterType ?? "all"}>
            <option value="all">Tipo solicitante</option>
            {AID_REQUESTER_TYPES.map((type) => (
              <option key={type} value={type}>{AID_REQUESTER_TYPE_LABELS[type]}</option>
            ))}
          </select>
          <Button type="submit">Aplicar filtros</Button>
        </form>
      </SectionCard>

      {requesters.length ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Solicitantes</h2>
          {requesters.map((requester) => (
            <SectionCard key={requester.id} className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-ink">{requester.name}</h3>
                <span className={cn("rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", AID_REQUESTER_STATUS_TONES[requester.status] ?? "bg-stone-100 text-stone-700")}>{AID_REQUESTER_STATUS_LABELS[requester.status] ?? requester.status}</span>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-sm font-semibold uppercase tracking-wide text-stone-700">{AID_REQUESTER_TYPE_LABELS[requester.type] ?? requester.type}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Modal triggerLabel="Editar solicitante" title={requester.name} description="Actualiza los datos del solicitante.">
                  <form action={updateAidRequesterAction} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="requesterId" value={requester.id} />
                    <input className={compactInputClassName} name="name" defaultValue={requester.name} required />
                    <select className={compactInputClassName} name="type" defaultValue={requester.type}>
                      {AID_REQUESTER_TYPES.map((type) => (
                        <option key={type} value={type}>{AID_REQUESTER_TYPE_LABELS[type]}</option>
                      ))}
                    </select>
                    <input className={compactInputClassName} name="contactName" defaultValue={requester.contact_name ?? ""} required />
                    <input className={compactInputClassName} name="email" type="email" defaultValue={requester.email ?? ""} />
                    <input className={compactInputClassName} name="phone" defaultValue={requester.phone ?? ""} />
                    <input className={compactInputClassName} name="location" defaultValue={requester.location ?? ""} />
                    <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="notes" defaultValue={requester.notes ?? ""} />
                    <div className="md:col-span-2">
                      <Button type="submit" variant="secondary">Actualizar solicitante</Button>
                    </div>
                  </form>
                </Modal>
                {!requester.user_id ? <GenerateRequesterAccessButton requesterId={requester.id} requesterName={requester.name} /> : <span className="text-sm text-stone-500">Cuenta vinculada</span>}
              </div>

              <div className="flex flex-wrap gap-2">
                {(["activo", "pausado", "inactivo"] as const).map((nextStatus) => (
                  <form key={nextStatus} action={updateAidRequesterStatusAction}>
                    <input type="hidden" name="requesterId" value={requester.id} />
                    <input type="hidden" name="status" value={nextStatus} />
                    <Button type="submit" variant={requester.status === nextStatus ? "secondary" : "ghost"}>{AID_REQUESTER_STATUS_LABELS[nextStatus]}</Button>
                  </form>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : null}

      {requests.length ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Solicitudes</h2>
          {requests.map((request) => (
            <SectionCard key={request.id} className="space-y-4 p-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-ink">{request.title}</h2>
                  <span className={cn("rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", AID_REQUEST_STATUS_TONES[request.status] ?? "bg-stone-100 text-stone-700")}>{AID_REQUEST_STATUS_LABELS[request.status] ?? request.status}</span>
                </div>
                <p className="text-sm text-stone-600">Solicitante: {request.requester?.name ?? "-"}</p>
                {request.description ? <p className="text-sm text-stone-600">{request.description}</p> : null}
                {request.requested_items ? <p className="text-sm text-stone-500"><span className="font-medium text-stone-700">Solicitado:</span> {request.requested_items}</p> : null}
                <p className="text-sm text-stone-500">Registrada: {formatDate(request.created_at)}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Modal triggerLabel="Editar solicitud" title={request.title} description="Actualiza la solicitud y sus notas internas.">
                  <form action={updateAidRequestAction} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="requestId" value={request.id} />
                    <input className={compactInputClassName} name="title" defaultValue={request.title} required />
                    <select className={compactInputClassName} name="status" defaultValue={request.status}>
                      {AID_REQUEST_STATUSES.map((item) => (
                        <option key={item} value={item}>{AID_REQUEST_STATUS_LABELS[item]}</option>
                      ))}
                    </select>
                    <select className={compactInputClassName} name="urgency" defaultValue={request.urgency ?? ""}>
                      <option value="">Urgencia</option>
                      {URGENCY_LEVELS.map((level) => (
                        <option key={level} value={level}>{URGENCY_LABELS[level]}</option>
                      ))}
                    </select>
                    <div className="hidden md:block" />
                    <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" defaultValue={request.description ?? ""} />
                    <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="requestedItems" defaultValue={request.requested_items ?? ""} />
                    <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="adminNotes" defaultValue={request.admin_notes ?? ""} placeholder="Notas internas de revisión" />
                    <div className="md:col-span-2">
                      <Button type="submit" variant="secondary">Actualizar solicitud</Button>
                    </div>
                  </form>
                </Modal>

              {request.tasks?.length ? (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <h3 className="text-sm font-semibold text-ink">Tareas creadas</h3>
                  <div className="mt-2 space-y-1">
                    {request.tasks.map((task) => (
                      <p key={task.id} className="text-sm text-stone-600">{task.title} {task.ally?.name ? `- ${task.ally.name}` : ""} ({task.status})</p>
                    ))}
                  </div>
                </div>
              ) : null}

                {request.status !== "cerrada" ? (
                  <Modal triggerLabel="Crear tarea" title="Crear tarea desde solicitud" description="Convierte esta solicitud en una tarea para un aliado.">
                    <form action={createTaskFromAidRequestAction} className="grid gap-3 md:grid-cols-2">
                      <input type="hidden" name="requestId" value={request.id} />
                      <select className={compactInputClassName} name="allyId" required defaultValue="">
                        <option value="" disabled>Selecciona aliado</option>
                        {allies.map((ally) => (
                          <option key={ally.id} value={ally.id}>{ally.name}</option>
                        ))}
                      </select>
                      <input className={compactInputClassName} name="title" required defaultValue={request.title} placeholder="Título de la tarea" />
                      <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" defaultValue={request.description ?? ""} placeholder="Descripción de la tarea" />
                      <input className={compactInputClassName} name="expectedOutput" defaultValue={request.requested_items ?? ""} placeholder="Resultado esperado" />
                      <input className={compactInputClassName} name="dueDate" type="date" />
                      <select className={compactInputClassName} name="urgency" defaultValue={request.urgency ?? ""}>
                        <option value="">Urgencia</option>
                        {URGENCY_LEVELS.map((level) => (
                          <option key={level} value={level}>{URGENCY_LABELS[level]}</option>
                        ))}
                      </select>
                      <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="adminNotes" defaultValue={request.admin_notes ?? ""} placeholder="Notas internas para la tarea" />
                      <div className="md:col-span-2">
                        <Button type="submit">Crear tarea desde solicitud</Button>
                      </div>
                    </form>
                  </Modal>
                ) : null}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Sin solicitudes registradas" description="Las solicitudes aparecerán aquí para convertirlas en tareas y luego en entregas." />
      )}
    </div>
  );
}
