"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CONTEXT_COOKIE, CONTEXT_PLATFORM } from "@/lib/context";
import { logContextSwitch } from "@/lib/audit";

type Result = { error?: string };

export async function switchContextAction(workshopId: string | null): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const role = user.app_metadata?.role as string | undefined;
  if (role !== "admin") {
    return { error: "No tienes permiso para cambiar de contexto" };
  }

  if (workshopId) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("user_allies")
      .select("id")
      .eq("user_id", user.id)
      .eq("ally_id", workshopId)
      .maybeSingle();

    if (!data) return { error: "No tienes acceso a este aliado" };
  }

  const cookieStore = await cookies();
  const currentContextRaw = cookieStore.get(CONTEXT_COOKIE)?.value ?? CONTEXT_PLATFORM;
  const fromContext = currentContextRaw === CONTEXT_PLATFORM ? "platform" as const : "aliado" as const;
  const fromWorkshopId = fromContext === "aliado" ? currentContextRaw : null;
  const toContext = workshopId ? "aliado" as const : "platform" as const;

  cookieStore.set(CONTEXT_COOKIE, workshopId ?? CONTEXT_PLATFORM, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
    sameSite: "lax",
  });

  await logContextSwitch(
    user.id,
    role ?? "unknown",
    user.email,
    fromContext,
    fromWorkshopId,
    toContext,
    workshopId,
  );

  revalidatePath("/admin");
  revalidatePath("/admin/talleres");
  revalidatePath("/admin/talleres/panel");
  return {};
}
