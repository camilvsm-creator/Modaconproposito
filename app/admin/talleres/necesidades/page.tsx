import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { getAdminNeedsPage } from "@/lib/workshops";

const STATUS_BADGES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  publicada: "bg-blue-100 text-blue-700",
  cubierta: "bg-green-100 text-green-700",
  cerrada: "bg-stone-100 text-stone-600",
};

export default async function AdminNecesidadesPage() {
  await requireWorkshopAdminUser();

  const result = await getAdminNeedsPage({ limit: 100 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Tareas"
        description="Administra tareas asignadas a aliados."
        meta={`${result.total} tareas`}
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Tareas" }}
      />

      {result.items.length ? (
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
              <tr>
                <th className="px-4 py-3">Aliado</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Urgencia</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
                {result.items.map((n) => (
                  <tr key={n.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                      {n.workshop ? (
                        <Link href={`/admin/aliados/${n.workshop_id}`} className="font-semibold text-[#F74897] hover:underline">{n.workshop.name}</Link>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{n.title}</td>
                  <td className="px-4 py-3">
                    {n.urgency ? (
                      <span className="rounded bg-[#FFE4EC] px-2 py-0.5 text-sm font-medium text-[#D6003F]">{n.urgency}</span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600 max-w-xs truncate">{n.description || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${STATUS_BADGES[n.status] || "bg-stone-100 text-stone-600"}`}>{n.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-12 text-center">
          <p className="text-stone-500 font-medium">No hay tareas registradas.</p>
        </div>
      )}

      <div className="grid gap-3 md:hidden">
        {result.items.map((n) => (
          <div key={n.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-3">
            <div className="flex items-center justify-between">
              {n.workshop ? (
                <Link href={`/admin/aliados/${n.workshop_id}`} className="font-semibold text-[#F74897] hover:underline text-sm">{n.workshop.name}</Link>
              ) : (
                <span className="text-stone-400 text-sm">Sin aliado</span>
              )}
              <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${STATUS_BADGES[n.status] || "bg-stone-100 text-stone-600"}`}>{n.status}</span>
            </div>
            <p className="font-semibold text-ink">{n.title}</p>
            {n.description ? <p className="text-sm text-stone-600">{n.description}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
