import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";

export default function MaterialesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Materiales"
        description="Control de insumos disponibles para cada producción."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Materiales" }}
      />
      <EmptyState
        title="Materiales próximamente"
        description="El módulo de materiales estará disponible pronto."
      />
    </div>
  );
}
