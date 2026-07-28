import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { requireOperationsUser, requireWorkshopAdminUser } from "@/lib/auth";

import { requireCurrentAlly } from "../../ally-scope";
import { CreateDeliveryForm } from "../components/create-delivery-form";

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export default async function CreateDeliveryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireOperationsUser();
  const isAlly = user.app_metadata?.role === "aliado";
  let allyId: string | undefined;

  if (isAlly) {
    const ally = await requireCurrentAlly();
    if (!ally) return null;
    allyId = ally.id;
  } else {
    await requireWorkshopAdminUser();
  }

  const params = await searchParams;
  const defaultTaskId = getStringParam(params, "taskId");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Entregas"
        title="Nueva entrega"
        description="Registra una entrega asociada a una tarea completada y deja organizada su información logística."
        navigation={{ baseHref: "/admin/entregas", baseLabel: "Entregas", currentLabel: "Nueva entrega" }}
        actions={<Link href="/admin/entregas" className="text-sm font-semibold text-primary hover:underline">Volver a entregas</Link>}
      />
      <section className="max-w-4xl">
        <CreateDeliveryForm allyId={allyId} defaultTaskId={defaultTaskId} />
      </section>
    </div>
  );
}
