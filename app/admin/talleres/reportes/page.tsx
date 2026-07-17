import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";

export default async function AdminReportesPage() {
  await requireWorkshopAdminUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Reportes"
        description="Estadísticas generales de la plataforma."
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Reportes" }}
      />
      <EmptyState
        title="Reportes próximamente"
        description="El módulo de reportes estará disponible pronto."
      />
    </div>
  );
}
