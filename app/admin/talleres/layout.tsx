import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TalleresLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "/admin/talleres";
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/admin");
  }

  if (user && user.app_metadata?.role === "aliado") {
    if (!pathname.startsWith("/admin/talleres/panel")) {
      redirect("/admin/talleres/panel");
    }
  }

  if (pathname.startsWith("/admin/talleres/panel") && user?.app_metadata?.role !== "aliado") {
    redirect("/admin/talleres");
  }

  return <>{children}</>;
}
