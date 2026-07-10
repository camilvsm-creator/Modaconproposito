import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUserRoles(roles: string[]) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.app_metadata?.role;

  if (!user || !role || !roles.includes(role)) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    const redirectTo = pathname ? `?redirectTo=${encodeURIComponent(pathname)}` : "";
    redirect(`/admin${redirectTo}`);
  }

  return user;
}

export async function requireAdminUser() {
  return requireUserRoles(["admin"]);
}

export async function requireVolunteerManagerUser() {
  return requireUserRoles(["admin", "volunteers_editor"]);
}

export async function requireInspectionManagerUser() {
  return requireUserRoles(["admin", "inspector", "admin_inspector"]);
}

export async function requireUserManagerUser() {
  return requireUserRoles(["admin", "admin_inspector"]);
}

export async function requireVerdictManagerUser() {
  return requireUserRoles(["admin", "admin_inspector"]);
}

export async function requireReportManagerUser() {
  return requireUserRoles(["admin", "admin_inspector"]);
}

export async function requireWorkshopAdminUser() {
  return requireUserRoles(["admin", "admin_talleres"]);
}

export async function requireWorkshopUser() {
  return requireUserRoles(["admin", "admin_talleres", "taller"]);
}
