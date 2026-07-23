import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { WORKSHOP_PHOTO_BUCKET } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkshopAvatarPath, getUserLinkedWorkshops } from "@/lib/workshops";
import { getContextFromHeaders } from "@/lib/context";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "/admin";
  const context = getContextFromHeaders(hdrs);
  const isPublicActivation = pathname.startsWith("/admin/activar-aliado") || pathname.startsWith("/admin/activar-solicitante");

  if (isPublicActivation) return <>{children}</>;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    if (pathname !== "/admin") redirect("/admin");
    return <>{children}</>;
  }

  const role = typeof user.app_metadata?.role === "string" ? user.app_metadata.role : "unknown";

  let avatarUrl: string | null = null;
  if (role === "aliado") {
    const avatarPath = await getWorkshopAvatarPath(user.id);
    if (avatarPath) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      avatarUrl = `${supabaseUrl}/storage/v1/object/public/${WORKSHOP_PHOTO_BUCKET}/${avatarPath}`;
    }
  }

  const linkedWorkshops = role === "admin"
    ? await getUserLinkedWorkshops(user.id)
    : [];

  return (
    <AdminShell role={role} email={user.email} avatarUrl={avatarUrl} context={context} linkedWorkshops={linkedWorkshops}>
      {children}
    </AdminShell>
  );
}
