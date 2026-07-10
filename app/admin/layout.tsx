import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin-shell";
import { WORKSHOP_PHOTO_BUCKET } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkshopByUserId } from "@/lib/workshops";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return <>{children}</>;
  }

  const role = user.app_metadata?.role ?? "admin";
  const isPromoda = role === "admin_talleres" || role === "taller";

  let avatarUrl: string | null = null;
  if (role === "taller") {
    const workshop = await getWorkshopByUserId(user.id);
    if (workshop?.avatar_path) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      avatarUrl = `${supabaseUrl}/storage/v1/object/public/${WORKSHOP_PHOTO_BUCKET}/${workshop.avatar_path}`;
    }
  }

  return (
    <div data-theme={isPromoda ? "promoda" : undefined}>
      <AdminShell role={role} email={user.email} avatarUrl={avatarUrl}>
        {children}
      </AdminShell>
    </div>
  );
}
