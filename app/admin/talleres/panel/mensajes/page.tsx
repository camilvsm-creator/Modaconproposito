import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";

export default function MensajesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Mensajes"
        description="Centro de comunicación con Promoda."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Mensajes" }}
      />
      <EmptyState
        title="Mensajes próximamente"
        description="El centro de mensajes estará disponible pronto."
      />
    </div>
  );
}
