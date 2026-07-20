import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopUser } from "@/lib/auth";

export default async function AdminEntregasPage() {
  await requireWorkshopUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Entregas"
        description="Registro de entregas realizadas a los beneficiarios."
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Entregas" }}
      />
      <EmptyState
        title="Entregas próximamente"
        description="El módulo de entregas estará disponible pronto."
      />
    </div>
  );
}
