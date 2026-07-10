import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";

export default function EntregasPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Entregas"
        description="Registro de productos entregados a Promoda o a beneficiarios."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Entregas" }}
      />
      <EmptyState
        title="Entregas próximamente"
        description="El módulo de entregas estará disponible pronto."
      />
    </div>
  );
}
