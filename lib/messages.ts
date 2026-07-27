import { getCurrentUser } from "@/lib/auth";
import { getRequesterByUserId } from "@/lib/requesters";
import type {
  AidRequester,
  Ally,
  Message,
  MessageParticipant,
  MessageThreadDetail,
  MessageThreadListItem,
  MessageSenderRole,
  PagedResult,
} from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkshopByUserId } from "@/lib/workshops";

const THREAD_LIST_FIELDS = `
  id,
  ally_id,
  requester_id,
  subject,
  status,
  created_by_user_id,
  created_at,
  updated_at,
  ally:allies(id, name, slug),
  requester:aid_requesters(id, name, type, user_id),
  participants:message_thread_participants(id, thread_id, user_id, ally_id, participant_role, last_read_at, created_at),
  messages(id, thread_id, sender_user_id, sender_role, body, created_at)
`;

const THREAD_DETAIL_FIELDS = `
  id,
  ally_id,
  requester_id,
  subject,
  status,
  created_by_user_id,
  created_at,
  updated_at,
  ally:allies(id, name, slug),
  requester:aid_requesters(id, name, type, contact_name, user_id),
  participants:message_thread_participants(id, thread_id, user_id, ally_id, participant_role, last_read_at, created_at)
`;

const MESSAGE_FIELDS = "id, thread_id, sender_user_id, sender_role, body, created_at";

type MessageScope = {
  userId: string;
  role: MessageSenderRole;
  allyId?: string;
  requesterId?: string;
};

type RawThread = {
  id: string;
  ally_id: string | null;
  requester_id: string | null;
  subject: string;
  status: string;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  ally?: Pick<Ally, "id" | "name" | "slug"> | null;
  requester?: Pick<AidRequester, "id" | "name" | "type" | "contact_name" | "user_id"> | null;
  participants?: MessageParticipant[] | null;
  messages?: Message[] | null;
};

function assertQueryOk(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

async function getMessageScope(): Promise<MessageScope> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tu sesión expiró.");

  const role = user.app_metadata?.role as string | undefined;
  if (role === "admin") return { userId: user.id, role: "admin" };

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally) throw new Error("Tu cuenta no está vinculada a un aliado.");
    return { userId: user.id, role: "aliado", allyId: ally.id };
  }

  if (role === "solicitante") {
    const requester = await getRequesterByUserId(user.id);
    if (!requester) throw new Error("Tu cuenta no está vinculada a un solicitante.");
    return { userId: user.id, role: "solicitante", requesterId: requester.id };
  }

  throw new Error("Tu usuario no tiene un rol operativo válido.");
}

function getCurrentParticipant(scope: MessageScope, participants: MessageParticipant[]) {
  if (scope.role === "aliado") {
    return participants.find((participant) => participant.ally_id === scope.allyId) ?? null;
  }

  return participants.find(
    (participant) => participant.user_id === scope.userId && participant.participant_role === scope.role,
  ) ?? null;
}

function normalizeThread(row: RawThread, scope: MessageScope): MessageThreadListItem {
  const participants = row.participants ?? [];
  const latestMessage = [...(row.messages ?? [])].sort(
    (first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
  )[0] ?? null;
  const currentParticipant = getCurrentParticipant(scope, participants);
  const isUnread = Boolean(
    latestMessage
      && latestMessage.sender_user_id !== scope.userId
      && (!currentParticipant?.last_read_at
        || new Date(latestMessage.created_at).getTime() > new Date(currentParticipant.last_read_at).getTime()),
  );

  return {
    id: row.id,
    ally_id: row.ally_id,
    requester_id: row.requester_id,
    subject: row.subject,
    status: row.status,
    created_by_user_id: row.created_by_user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ally: row.ally ? { id: row.ally.id, name: row.ally.name, slug: row.ally.slug } : null,
    requester: row.requester
      ? { id: row.requester.id, name: row.requester.name, type: row.requester.type, user_id: row.requester.user_id }
      : null,
    latest_message: latestMessage,
    current_participant: currentParticipant,
    is_unread: isUnread,
  };
}

export async function getMessageThreadsPage({
  page = 1,
  limit = 20,
  status,
  recipientType,
}: {
  page?: number;
  limit?: number;
  status?: string;
  recipientType?: "aliado" | "solicitante" | "all";
} = {}): Promise<PagedResult<MessageThreadListItem>> {
  const scope = await getMessageScope();
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 50);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("message_threads")
    .select(THREAD_LIST_FIELDS, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to)
    .order("created_at", { foreignTable: "messages", ascending: false })
    .limit(1, { foreignTable: "messages" });

  if (status && status !== "all") query = query.eq("status", status);
  if (scope.role === "aliado") query = query.eq("ally_id", scope.allyId);
  if (scope.role === "solicitante") query = query.eq("requester_id", scope.requesterId);
  if (recipientType === "aliado") query = query.not("ally_id", "is", null);
  if (recipientType === "solicitante") query = query.not("requester_id", "is", null);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los hilos de mensajes");
  const items = ((data ?? []) as unknown as RawThread[]).map((row) => normalizeThread(row, scope));

  return {
    items,
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
  };
}

export async function getMessageThread(threadId: string): Promise<MessageThreadDetail | null> {
  const scope = await getMessageScope();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("message_threads")
    .select(THREAD_DETAIL_FIELDS)
    .eq("id", threadId)
    .maybeSingle();

  assertQueryOk(error, "No se pudo cargar el hilo de mensajes");
  if (!data) return null;

  const row = data as unknown as RawThread;
  const participants = row.participants ?? [];
  if (scope.role === "aliado" && row.ally_id !== scope.allyId) return null;
  if (scope.role === "solicitante" && row.requester_id !== scope.requesterId) return null;

  return {
    id: row.id,
    ally_id: row.ally_id,
    requester_id: row.requester_id,
    subject: row.subject,
    status: row.status,
    created_by_user_id: row.created_by_user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ally: row.ally ? { id: row.ally.id, name: row.ally.name, slug: row.ally.slug } : null,
    requester: row.requester
      ? {
          id: row.requester.id,
          name: row.requester.name,
          type: row.requester.type,
          contact_name: row.requester.contact_name ?? null,
          user_id: row.requester.user_id,
        }
      : null,
    participants,
  };
}

export async function getThreadMessagesPage({
  threadId,
  page = 1,
  limit = 50,
}: {
  threadId: string;
  page?: number;
  limit?: number;
}): Promise<PagedResult<Message>> {
  await getMessageScope();
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("messages")
    .select(MESSAGE_FIELDS, { count: "exact" })
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .range(from, to);

  assertQueryOk(error, "No se pudieron cargar los mensajes");
  const items = ((data ?? []) as Message[]).reverse();

  return {
    items,
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
  };
}
