import Link from "next/link";
import { headers } from "next/headers";

import { AdminPageHeader } from "@/components/admin-page-header";
import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId, getWorkshopById, getWorkshopNeeds, getWorkshopPhotos } from "@/lib/workshops";
import {
  WORKSHOP_STATUS_LABELS,
  WORKSHOP_STATUS_TONES,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Button, SectionCard } from "@/components/ui";
import { getContextFromHeaders } from "@/lib/context";

export default async function TalleresPanelDashboardPage() {
  const user = await requireWorkshopUser();
  const role = user.app_metadata?.role as string | undefined;
  const hdrs = await headers();
  const context = getContextFromHeaders(hdrs);

  let workshop = null;
  if (context.type === "aliado") {
    workshop = await getWorkshopById(context.workshopId);
  } else if (role === "aliado") {
    workshop = await getWorkshopByUserId(user.id);
  }
  if (!workshop) {
    return (
      <div className="rounded-xl border border-stone-200/80 bg-white/75 p-8 text-center shadow-card">
        <p className="text-stone-600">No se encontró el aliado asociado a tu cuenta.</p>
      </div>
    );
  }

  const needs = await getWorkshopNeeds(workshop.id);
  const activeNeedsCount = needs.filter((n) => n.status === "pendiente" || n.status === "publicada").length;
  const photos = await getWorkshopPhotos(workshop.id);
  const photosCount = photos.length;

  const statusLabel = WORKSHOP_STATUS_LABELS[workshop.status] ?? workshop.status;
  const statusTone = WORKSHOP_STATUS_TONES[workshop.status] ?? "bg-stone-100 text-stone-700";

  const statusDot = workshop.status === "activo"
    ? "bg-green-500"
    : workshop.status === "pendiente"
      ? "bg-amber-500"
      : workshop.status === "pausado"
        ? "bg-stone-400"
        : "bg-red-500";

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-stone-200/80 bg-white/75 p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className={"flex h-12 w-12 shrink-0 items-center justify-center rounded-full " + (workshop.avatar_path ? "" : "bg-[#FFE4EC]")}>
            {workshop.avatar_path ? (
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workshop-photos/${workshop.avatar_path}`}
                alt={workshop.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-[#F74897]">{workshop.name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={"inline-block h-2.5 w-2.5 shrink-0 rounded-full " + statusDot} />
              <h1 className="truncate text-2xl font-bold sm:text-[2rem] text-ink">{workshop.name}</h1>
            </div>
            <p className="mt-0.5 text-sm text-stone-500">
              {workshop.state}{workshop.city ? `, ${workshop.city}` : ""}
            </p>
          </div>
          <span className={statusTone + " shrink-0 inline-flex rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide"}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">{activeNeedsCount}</p>
          <p className="mt-1 text-sm text-stone-500">Necesidades activas</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">0</p>
          <p className="mt-1 text-sm text-stone-500">Producciones activas</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">0</p>
          <p className="mt-1 text-sm text-stone-500">Voluntarios asignados</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">0</p>
          <p className="mt-1 text-sm text-stone-500">Materiales pendientes</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">{photosCount}</p>
          <p className="mt-1 text-sm text-stone-500">Fotos subidas</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">0</p>
          <p className="mt-1 text-sm text-stone-500">Productos entregados</p>
        </SectionCard>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/talleres/panel/producciones">
          <Button variant="primary">Reportar avances</Button>
        </Link>
        <Link href="/admin/talleres/panel/necesidades">
          <Button variant="secondary">Gestionar necesidades</Button>
        </Link>

      </div>

      <p className="text-sm text-stone-400">
        Última actualización: {formatDateTime(workshop.updated_at)}
      </p>
    </div>
  );
}
