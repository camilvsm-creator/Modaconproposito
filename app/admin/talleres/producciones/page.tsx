import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";

export default async function AdminProduccionesPage() {
  await requireWorkshopAdminUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Producciones"
        description="Administra toda la producción de la red de talleres."
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Inicio", currentLabel: "Producciones" }}
      />
      <EmptyState
        title="Producciones próximamente"
        description="El módulo de producciones estará disponible pronto."
      />
    </div>
  );
}
