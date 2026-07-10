import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId, getWorkshopNeeds } from "@/lib/workshops";
import { AdminPageHeader } from "@/components/admin-page-header";
import { NeedsList } from "./needs-list";
import { CreateNeedForm } from "./create-need-form";

export default async function TalleresPanelNecesidadesPage() {
  const user = await requireWorkshopUser();
  const role = user.app_metadata?.role as string | undefined;
  if (role !== "taller") {
    return (
      <div>
        <p className="text-stone-600">Acceso solo para talleres.</p>
      </div>
    );
  }

  const workshop = await getWorkshopByUserId(user.id);
  if (!workshop) {
    return (
      <div>
        <p className="text-stone-600">No se encontró el taller asociado a tu cuenta.</p>
      </div>
    );
  }

  const needs = await getWorkshopNeeds(workshop.id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Necesidades"
        description="Registra lo que necesita tu taller y lleva el control de las necesidades activas."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Necesidades" }}
      />
      <div className="space-y-8">
        <CreateNeedForm workshopId={workshop.id} />
        <NeedsList needs={needs} workshopId={workshop.id} />
      </div>
    </div>
  );
}
