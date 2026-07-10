import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";

export default async function AdminAliadosPage() {
  await requireWorkshopAdminUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Aliados"
        description="Empresas y organizaciones colaboradoras."
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Inicio", currentLabel: "Aliados" }}
      />
      <EmptyState
        title="Aliados próximamente"
        description="El módulo de aliados estará disponible pronto."
      />
    </div>
  );
}
