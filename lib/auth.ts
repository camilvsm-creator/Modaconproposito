import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export async function requireUserRoles(roles: string[]) {
  const user = await getCurrentUser();

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

export async function requireRequesterUser() {
  return requireUserRoles(["solicitante"]);
}

export async function requireRequestsUser() {
  return requireUserRoles(["admin", "solicitante"]);
}

export async function requireOperationsUser() {
  return requireUserRoles(["admin", "aliado", "solicitante"]);
}
