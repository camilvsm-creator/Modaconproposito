import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin-page-header";
import { SectionCard } from "@/components/ui";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { getHelpRequestById, STATUS_LABELS, STATUS_BADGES, URGENCY_LABELS, URGENCY_BADGES, REQUESTER_TYPE_LABELS } from "@/lib/help-requests";

export default async function AdminSolicitudAyudaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWorkshopAdminUser();
  const { id } = await params;

  const request = await getHelpRequestById(id);
  if (!request) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Aliados"
        title={`Solicitud #${request.sequentialNumber}`}
        meta={STATUS_LABELS[request.status]}
        navigation={{ baseHref: "/admin/talleres/solicitudes-ayuda", baseLabel: "Solicitudes", currentLabel: `#${request.sequentialNumber}` }}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard>
            <div className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-ink">Información del solicitante</h3>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-stone-500">Nombre</p>
                  <p className="font-medium text-ink">{request.fullName}</p>
                </div>
                <div>
                  <p className="text-stone-500">Organización</p>
                  <p className="font-medium text-ink">{request.organization || "—"}</p>
                </div>
                <div>
                  <p className="text-stone-500">Teléfono</p>
                  <p className="font-medium text-ink">{request.phone}</p>
                </div>
                <div>
                  <p className="text-stone-500">Email</p>
                  <p className="font-medium text-ink">{request.email}</p>
                </div>
                <div>
                  <p className="text-stone-500">Tipo de solicitante</p>
                  <p className="font-medium text-ink">{REQUESTER_TYPE_LABELS[request.requesterType]}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-ink">Dirección de entrega</h3>
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-stone-500">Estado</p>
                  <p className="font-medium text-ink">{request.state}</p>
                </div>
                <div>
                  <p className="text-stone-500">Ciudad</p>
                  <p className="font-medium text-ink">{request.city}</p>
                </div>
                <div>
                  <p className="text-stone-500">Dirección</p>
                  <p className="font-medium text-ink">{request.deliveryAddress}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-ink">Productos solicitados</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-200 text-xs font-semibold text-stone-500">
                    <tr>
                      <th className="pb-2 pr-4">Producto</th>
                      <th className="pb-2 pr-4">Cantidad</th>
                      <th className="pb-2">Tallas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {request.products.map((p, i) => (
                      <tr key={i}>
                        <td className="py-3 pr-4 font-medium text-ink">{p.name}</td>
                        <td className="py-3 pr-4 text-stone-600">{p.quantity}</td>
                        <td className="py-3 text-stone-600">
                          {p.sizes.length > 0
                            ? p.sizes.map((s) => `${s.name}: ${s.quantity}`).join(", ")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-ink">Descripción</h3>
              <p className="text-sm leading-6 text-stone-700">{request.description}</p>
            </div>
          </SectionCard>

          {request.evidenceFiles.length > 0 ? (
            <SectionCard>
              <div className="p-5 space-y-4">
                <h3 className="text-lg font-semibold text-ink">Evidencias</h3>
                <ul className="list-disc pl-5 text-sm text-stone-600 space-y-1">
                  {request.evidenceFiles.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </SectionCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <SectionCard>
            <div className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-ink">Resumen</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Estado</span>
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGES[request.status]}`}>
                    {STATUS_LABELS[request.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Urgencia</span>
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${URGENCY_BADGES[request.urgency]}`}>
                    {URGENCY_LABELS[request.urgency]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Fecha</span>
                  <span className="font-medium text-ink">{new Date(request.createdAt).toLocaleDateString("es-VE")}</span>
                </div>
                <div>
                  <span className="text-stone-500">Productos</span>
                  <p className="mt-1 font-medium text-ink">{request.products.length} producto(s), {request.products.reduce((acc, p) => acc + p.quantity, 0)} unidades</p>
                </div>
              </div>
            </div>
          </SectionCard>

          {request.assignedWorkshops.length > 0 ? (
            <SectionCard>
              <div className="p-5 space-y-4">
                <h3 className="text-lg font-semibold text-ink">Aliados asignados</h3>
                <ul className="space-y-2 text-sm">
                  {request.assignedWorkshops.map((w, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#F74897]" />
                      <span className="font-medium text-ink">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/talleres/solicitudes-ayuda" className="text-sm font-medium text-[#F74897] hover:underline">
          ← Volver al listado
        </Link>
      </div>
    </div>
  );
}
