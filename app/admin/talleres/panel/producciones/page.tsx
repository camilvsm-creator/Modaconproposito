import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";

export default function ProduccionesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Tareas"
        description="Gestiona las confecciones activas del aliado."
        navigation={{ baseHref: "/admin/aliado", baseLabel: "Panel", currentLabel: "Tareas" }}
      />
      <EmptyState
        title="Tareas próximamente"
        description="El módulo de tareas estará disponible pronto."
      />
    </div>
  );
}
