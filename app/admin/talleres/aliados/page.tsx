import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";

export default async function AdminAyudaPage() {
  await requireWorkshopAdminUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Ayuda"
        description="Empresas y organizaciones colaboradoras."
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Inicio", currentLabel: "Ayuda" }}
      />
      <EmptyState
        title="Ayuda próximamente"
        description="El módulo de ayuda estará disponible pronto."
      />
    </div>
  );
}
