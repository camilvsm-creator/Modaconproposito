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
        description="Vista consolidada de la materia prima asignada a aliados."
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Materia prima" }}
      />
      <EmptyState
        title="Materiales próximamente"
        description="El módulo de materiales consolidados estará disponible pronto."
      />
    </div>
  );
}
