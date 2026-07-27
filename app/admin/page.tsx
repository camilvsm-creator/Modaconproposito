import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <AdminLoginForm />;
  }

  if (user.app_metadata?.role === "aliado") redirect("/admin/tareas");
  if (user.app_metadata?.role === "admin") redirect("/admin/aliados");
  if (user.app_metadata?.role === "solicitante") redirect("/admin/solicitudes");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-xl bg-[#FCFCFC] p-8 text-center ring-1 ring-gray-200/70">
        <h1 className="text-xl font-semibold text-ink">Acceso restringido</h1>
        <p className="mt-2 text-sm text-gray-600">Tu cuenta no tiene permisos para entrar al panel.</p>
      </div>
    </div>
  );
}
