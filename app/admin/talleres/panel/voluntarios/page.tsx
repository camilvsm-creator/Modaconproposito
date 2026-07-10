import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";

export default function VoluntariosPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Voluntarios"
        description="Voluntarios asignados al taller por el equipo de Promoda."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Voluntarios" }}
      />
      <EmptyState
        title="Voluntarios próximamente"
        description="El módulo de voluntarios estará disponible pronto."
      />
    </div>
  );
}
