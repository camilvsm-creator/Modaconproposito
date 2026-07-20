import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin-page-header";
import { requireWorkshopUser } from "@/lib/auth";

import { requireCurrentAlly } from "../ally-scope";
import { WorkshopProfileForm } from "./ally-profile-form";

export default async function ProfilePage() {
  const user = await requireWorkshopUser();
  if (user.app_metadata?.role !== "aliado") {
    redirect("/admin/aliados");
  }

  const ally = await requireCurrentAlly();
  if (!ally) return null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cuenta"
        title="Perfil"
        description="Actualiza la información y foto de perfil de tu aliado."
        navigation={{ baseHref: "/admin/tareas", baseLabel: "Tareas", currentLabel: "Perfil" }}
      />
      <WorkshopProfileForm workshop={ally} />
    </div>
  );
}
