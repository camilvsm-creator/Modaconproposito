import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";

import { requireCurrentAlly } from "../../ally-scope";
import { CreateAssignedTaskForm } from "../components/create-assigned-task-form";
import { CreateNeedForm } from "../components/create-task-form";

export default async function CreateTaskPage() {
  const user = await requireWorkshopUser();
  const isAlly = user.app_metadata?.role === "aliado";

  if (isAlly) {
    const ally = await requireCurrentAlly();
    if (!ally) return null;

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Tareas"
          title="Nueva tarea"
          description="Registra una tarea propia para organizar tu producción y darle seguimiento desde el listado."
          navigation={{ baseHref: "/admin/tareas", baseLabel: "Tareas", currentLabel: "Nueva tarea" }}
          actions={<Link href="/admin/tareas" className="text-sm font-semibold text-primary hover:underline">Volver a tareas</Link>}
        />
        <section className="max-w-4xl">
          <CreateNeedForm workshopId={ally.id} />
        </section>
      </div>
    );
  }

  await requireWorkshopAdminUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Nueva tarea"
        description="Asigna una tarea a un aliado con la información necesaria para iniciar la producción."
        navigation={{ baseHref: "/admin/tareas", baseLabel: "Tareas", currentLabel: "Nueva tarea" }}
        actions={<Link href="/admin/tareas" className="text-sm font-semibold text-primary hover:underline">Volver a tareas</Link>}
      />
      <section className="max-w-4xl">
        <CreateAssignedTaskForm />
      </section>
    </div>
  );
}
