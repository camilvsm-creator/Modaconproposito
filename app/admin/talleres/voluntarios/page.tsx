import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";

export default async function AdminVoluntariosPage() {
  await requireWorkshopAdminUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Voluntarios"
        description="Administra los voluntarios de la red de talleres."
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Inicio", currentLabel: "Voluntarios" }}
      />
      <EmptyState
        title="Voluntarios próximamente"
        description="El módulo de voluntarios estará disponible pronto."
      />
    </div>
  );
}
