import { updateHelpOfferStatusAction } from "@/app/admin/talleres/actions";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui";
import { WorkshopStatusBadge } from "@/components/workshop-status-badge";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { HELP_AVAILABILITY_LABELS, HELP_TYPE_GROUPS } from "@/lib/constants";
import type { WorkshopHelpOfferWithRelations } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getAdminHelpOffersPage } from "@/lib/workshops";
import Link from "next/link";

const HELP_OFFERS_PER_PAGE = 20;

const HELP_STATUS_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "recibida", label: "Recibida" },
  { value: "gestionada", label: "Gestionada" },
  { value: "cerrada", label: "Cerrada" },
] as const;

const HELP_TIPO_OPTIONS = [
  { value: "all", label: "Todos los tipos" },
  ...HELP_TYPE_GROUPS.map((g) => ({ value: g.label.toLowerCase(), label: g.label })),
] as const;

async function handleUpdateHelpOfferStatus(formData: FormData) {
  "use server";
  await updateHelpOfferStatusAction(formData);
}

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const search = new URLSearchParams();
  const status = getStringParam(params, "status");
  const tipo = getStringParam(params, "tipo");
  if (status) search.set("status", status);
  if (tipo) search.set("tipo", tipo);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/talleres/ofertas?${query}` : "/admin/talleres/ofertas";
}

export default async function AdminWorkshopHelpOffersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireWorkshopAdminUser();
  const isPromoda = user.app_metadata?.role === "admin_talleres";
  const activeBg = isPromoda ? "bg-[#F74897]" : "bg-primary";

  const params = await searchParams;
  const status = getStringParam(params, "status") || "all";
  const tipo = getStringParam(params, "tipo") || "all";
  const result = await getAdminHelpOffersPage({
    page: getPageParam(params),
    limit: HELP_OFFERS_PER_PAGE,
    status: status === "all" ? undefined : status,
    tipo: tipo === "all" ? undefined : tipo,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Aliados"
          title="Ofertas de ayuda"
          description="Gestiona las ofertas de ayuda dirigidas a los talleres."
          meta={`${result.total} ofertas`}
          navigation={{ baseHref: "/admin/talleres", baseLabel: "Aliados", currentLabel: "Ofertas" }}
        />
        <div className="flex flex-wrap gap-3">
          {HELP_STATUS_OPTIONS.map((opt) => {
            const href = pageHref({ ...params, status: opt.value === "all" ? undefined : opt.value, page: undefined }, 1);
            const isActive = opt.value === "all" ? !status || status === "all" : status === opt.value;
            return (
              <Link
                key={opt.value}
                href={href}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? `${activeBg} text-white`
                    : "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          {HELP_TIPO_OPTIONS.map((opt) => {
            const href = pageHref({ ...params, tipo: opt.value === "all" ? undefined : opt.value, page: undefined }, 1);
            const isActive = opt.value === "all" ? !tipo || tipo === "all" : tipo === opt.value;
            return (
              <Link
                key={opt.value}
                href={href}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? `${activeBg} text-white`
                    : "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {result.items.length ? (
        <div className="space-y-4">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[1280px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-3">Donante</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Disponibilidad</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Taller / Necesidad</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Notas internas</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {result.items.map((offer: WorkshopHelpOfferWithRelations) => {
                  const formId = `help-offer-${offer.id}`;

                  return (
                    <tr key={offer.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 align-top leading-tight">
                        <form id={formId} action={handleUpdateHelpOfferStatus}>
                          <input type="hidden" name="id" value={offer.id} />
                        </form>
                        <p className="font-semibold text-ink">{offer.donor_name}</p>
                        <p className="mt-1 text-xs text-stone-500">{formatDate(offer.created_at)}</p>
                      </td>
                      <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                        <p>{offer.donor_contact}</p>
                        {offer.donor_email ? <p className="text-xs text-stone-500">{offer.donor_email}</p> : null}
                        {offer.donor_phone ? <p className="text-xs text-stone-500">{offer.donor_phone}</p> : null}
                      </td>
                      <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                        {offer.help_type}
                      </td>
                      <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                        {offer.quantity || <span className="text-stone-400">—</span>}
                      </td>
                      <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                        {offer.availability ? (
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                            {HELP_AVAILABILITY_LABELS[offer.availability] ?? offer.availability}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                        <p className="max-w-xs truncate">{offer.description}</p>
                      </td>
                      <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                        {offer.location || <span className="text-stone-400">—</span>}
                      </td>
                      <td className="px-4 py-3 align-top leading-tight">
                        {offer.workshop ? (
                          <Link
                            href={`/admin/talleres/listado/${offer.workshop.id}`}
                            className="text-primary hover:underline"
                          >
                            {offer.workshop.name}
                          </Link>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                        {offer.need ? (
                          <p className="text-xs text-stone-500">{offer.need.title}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top leading-tight">
                        <select
                          form={formId}
                          name="status"
                          defaultValue={offer.status}
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                        >
                          <option value="recibida">Recibida</option>
                          <option value="gestionada">Gestionada</option>
                          <option value="cerrada">Cerrada</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 align-top leading-tight">
                        <textarea
                          form={formId}
                          name="adminNotes"
                          defaultValue={offer.admin_notes || ""}
                          rows={3}
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                          placeholder="Notas internas"
                        />
                      </td>
                      <td className="px-4 py-3 align-top leading-tight">
                        <Button form={formId} type="submit" variant="secondary" className="w-full">
                          Guardar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {result.items.map((offer: WorkshopHelpOfferWithRelations) => (
              <form key={offer.id} action={handleUpdateHelpOfferStatus} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-4">
                <input type="hidden" name="id" value={offer.id} />
                <div className="space-y-1 text-sm text-stone-700">
                  <p className="font-semibold text-ink">{offer.donor_name}</p>
                  <p>{offer.donor_contact}</p>
                  <p className="font-medium">{offer.help_type}</p>
                  {offer.quantity ? <p className="text-sm text-stone-500">Cantidad: {offer.quantity}</p> : null}
                  {offer.availability ? <p className="text-sm text-stone-500">Disponibilidad: {HELP_AVAILABILITY_LABELS[offer.availability] ?? offer.availability}</p> : null}
                  <p className="text-stone-600">{offer.description}</p>
                  {offer.location ? <p className="text-sm text-stone-500">Ubicación: {offer.location}</p> : null}
                  {offer.workshop ? (
                    <Link href={`/admin/talleres/listado/${offer.workshop.id}`} className="text-primary hover:underline">
                      {offer.workshop.name}
                    </Link>
                  ) : null}
                  {offer.need ? <p className="text-xs text-stone-500">{offer.need.title}</p> : null}
                  <p className="text-xs text-stone-500">{formatDate(offer.created_at)}</p>
                </div>

                <div className="space-y-3">
                  <select name="status" defaultValue={offer.status} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
                    <option value="recibida">Recibida</option>
                    <option value="gestionada">Gestionada</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                  <textarea
                    name="adminNotes"
                    defaultValue={offer.admin_notes || ""}
                    rows={3}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                    placeholder="Notas internas"
                  />
                  <Button type="submit" variant="secondary" className="w-full">
                    Guardar
                  </Button>
                </div>
              </form>
            ))}
          </div>

          <AdminPagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            limit={result.limit}
            hrefForPage={(page) => pageHref(params, page)}
          />
        </div>
      ) : (
        <EmptyState title="No hay ofertas de ayuda registradas." />
      )}
    </div>
  );
}
