import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";

export default async function AdminMensajesPage() {
  await requireWorkshopAdminUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Mensajes"
        description="Centro de comunicación con aliados y voluntarios."
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Mensajes" }}
      />
      <EmptyState
        title="Mensajes próximamente"
        description="El centro de mensajes estará disponible pronto."
      />
    </div>
  );
}
