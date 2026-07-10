import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AdminLoginForm />;
  }

  if (user.app_metadata?.role === "taller") redirect("/admin/talleres/panel");
  if (user.app_metadata?.role === "admin" || user.app_metadata?.role === "admin_talleres") redirect("/admin/talleres");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-stone-200 bg-paper p-8 text-center shadow-card">
        <h1 className="text-xl font-semibold text-ink">Acceso restringido</h1>
        <p className="mt-2 text-sm text-stone-600">Tu cuenta no tiene permisos para entrar al panel.</p>
      </div>
    </div>
  );
}
