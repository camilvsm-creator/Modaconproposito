import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AuditEventParams = {
  actor_id: string;
  actor_role: string;
  actor_email: string | null | undefined;
  context_type: "platform" | "aliado";
  context_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  note?: string;
};

export async function logAuditEvent(params: AuditEventParams) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("audit_events").insert({
    actor_id: params.actor_id,
    actor_role: params.actor_role,
    actor_email: params.actor_email ?? null,
    context_type: params.context_type,
    context_id: params.context_id ?? null,
    entity_type: params.entity_type,
    entity_id: params.entity_id ?? null,
    action: params.action,
    old_data: params.old_data ?? null,
    new_data: params.new_data ?? null,
    note: params.note ?? null,
  });

  if (error) {
    console.error("[audit] Failed to log event:", error.message);
  }
}

export async function logContextSwitch(
  userId: string,
  role: string,
  email: string | null | undefined,
  fromContext: "platform" | "aliado",
  fromWorkshopId: string | null,
  toContext: "platform" | "aliado",
  toWorkshopId: string | null,
) {
  await logAuditEvent({
    actor_id: userId,
    actor_role: role,
    actor_email: email,
    context_type: fromContext,
    context_id: fromWorkshopId,
    entity_type: "context",
    entity_id: toWorkshopId,
    action: "context_switch",
    old_data: { context_type: fromContext, ally_id: fromWorkshopId },
    new_data: { context_type: toContext, ally_id: toWorkshopId },
  });
}
