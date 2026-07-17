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

export async function requireWorkshopAdminUser() {
  return requireUserRoles(["admin"]);
}

export async function requireWorkshopUser() {
  return requireUserRoles(["admin", "aliado"]);
}
