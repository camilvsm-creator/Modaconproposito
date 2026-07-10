import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";

export default async function AdminMaterialesPage() {
  await requireWorkshopAdminUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Materiales"
        description="Vista consolidada de los materiales solicitados por los talleres."
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Inicio", currentLabel: "Materiales" }}
      />
      <EmptyState
        title="Materiales próximamente"
        description="El módulo de materiales consolidados estará disponible pronto."
      />
    </div>
  );
}
