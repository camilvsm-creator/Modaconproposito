import { AdminPageHeader } from "@/components/admin-page-header";
import { SectionCard } from "@/components/ui";

export default function AdminSolicitudesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Solicitudes"
        title="Solicitudes de ayuda"
        description="Aquí el admin podrá registrar y revisar solicitudes de ONG, fundaciones, instituciones o comunidades."
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Solicitudes" }}
      />
      <SectionCard className="p-8">
        <p className="text-sm text-stone-600">Módulo en preparación para el nuevo modelo de solicitudes.</p>
      </SectionCard>
    </div>
  );
}
