import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";

export default function ProduccionesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Producciones"
        description="Gestiona las confecciones activas del taller."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Producciones" }}
      />
      <EmptyState
        title="Producciones próximamente"
        description="El módulo de producciones estará disponible pronto."
      />
    </div>
  );
}
