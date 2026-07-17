import { headers } from "next/headers";
import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId, getWorkshopById, getWorkshopNeeds } from "@/lib/workshops";
import { AdminPageHeader } from "@/components/admin-page-header";
import { NeedsList } from "./needs-list";
import { CreateNeedForm } from "./create-need-form";
import { getContextFromHeaders } from "@/lib/context";

export default async function TalleresPanelNecesidadesPage() {
  const user = await requireWorkshopUser();
  const role = user.app_metadata?.role as string | undefined;
  const hdrs = await headers();
  const context = getContextFromHeaders(hdrs);

  if (role !== "aliado" && context.type !== "aliado") {
    return (
      <div>
        <p className="text-stone-600">Acceso solo para aliados.</p>
      </div>
    );
  }

  let workshop = null;
  if (context.type === "aliado") {
    workshop = await getWorkshopById(context.workshopId);
  } else {
    workshop = await getWorkshopByUserId(user.id);
  }

  if (!workshop) {
    return (
      <div>
        <p className="text-stone-600">No se encontró el aliado asociado a tu cuenta.</p>
      </div>
    );
  }

  const needs = await getWorkshopNeeds(workshop.id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Necesidades"
        description="Registra lo que necesita tu aliado y lleva el control de las necesidades activas."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Necesidades" }}
      />
      <div className="space-y-8">
        <CreateNeedForm workshopId={workshop.id} />
        <NeedsList needs={needs} workshopId={workshop.id} />
      </div>
    </div>
  );
}
