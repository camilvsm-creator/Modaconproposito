import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { WORKSHOP_PHOTO_BUCKET } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkshopAvatarPath } from "@/lib/workshops";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "/admin";
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    if (pathname !== "/admin" && !pathname.startsWith("/admin/activar-taller")) redirect("/admin");
    return <>{children}</>;
  }

  const role = user.app_metadata?.role ?? "admin";

  let avatarUrl: string | null = null;
  if (role === "taller") {
    const avatarPath = await getWorkshopAvatarPath(user.id);
    if (avatarPath) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      avatarUrl = `${supabaseUrl}/storage/v1/object/public/${WORKSHOP_PHOTO_BUCKET}/${avatarPath}`;
    }
  }

  return (
    <div data-theme={"promoda"}>
      <AdminShell role={role} email={user.email} avatarUrl={avatarUrl}>
        {children}
      </AdminShell>
    </div>
  );
}
