"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { markThreadReadAction, sendMessageAction } from "@/app/admin/mensajes/actions";
import { Button } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Message } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type RealtimeState = "connecting" | "connected" | "error" | "closed";

function RealtimeStatus({ state, error }: { state: RealtimeState; error?: string }) {
  const label = state === "connected"
    ? "Tiempo real activo"
    : state === "error"
      ? "Tiempo real no disponible"
      : state === "closed"
        ? "Tiempo real desconectado"
        : "Conectando tiempo real...";
  const tone = state === "connected"
    ? "bg-green-50 text-green-700"
    : state === "error"
      ? "bg-red-50 text-red-700"
      : "bg-gray-100 text-gray-600";

  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-sm text-gray-500" title={error}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${state === "connected" ? "bg-green-500" : state === "error" ? "bg-red-500" : "bg-gray-400"}`} aria-hidden="true" />
      <span className={`rounded-md px-2 py-1 font-semibold ${tone}`}>{label}</span>
      {state === "error" && error ? <span className="max-w-[240px] truncate text-sm text-danger">{error}</span> : null}
    </span>
  );
}

export function MessageThreadLive({
  threadId,
  initialMessages,
  currentUserId,
  canSend,
}: {
  threadId: string;
  initialMessages: Message[];
  currentUserId: string;
  canSend: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [realtimeState, setRealtimeState] = useState<RealtimeState>("connecting");
  const [realtimeError, setRealtimeError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const formData = new FormData();
    formData.set("threadId", threadId);
    void markThreadReadAction(formData);
  }, [threadId]);

  useEffect(() => {
    setRealtimeState("connecting");
    setRealtimeError(undefined);
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`message-thread-${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const incoming = payload.new as unknown as Message;
          setMessages((current) => current.some((message) => message.id === incoming.id)
            ? current
            : [...current, incoming].sort((first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime()));
        },
      );
    let cancelled = false;

    async function subscribeToThread() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) await supabase.realtime.setAuth(session.access_token);
        if (cancelled) return;

        channel.subscribe((status, subscribeError) => {
          if (cancelled) return;
          if (status === "SUBSCRIBED") {
            setRealtimeState("connected");
            setRealtimeError(undefined);
            return;
          }
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setRealtimeState("error");
            setRealtimeError(subscribeError?.message ?? status);
            console.error("Supabase Realtime error", status, subscribeError);
            return;
          }
          if (status === "CLOSED") setRealtimeState("closed");
        });
      } catch (subscribeError) {
        if (cancelled) return;
        setRealtimeState("error");
        setRealtimeError(subscribeError instanceof Error ? subscribeError.message : "No se pudo iniciar Realtime.");
        console.error("Supabase Realtime initialization error", subscribeError);
      }
    }

    void subscribeToThread();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [threadId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim() || pending || !canSend) return;

    const formData = new FormData();
    formData.set("threadId", threadId);
    formData.set("body", body);
    startTransition(async () => {
      setError(undefined);
      const result = await sendMessageAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.message) {
        setMessages((current) => current.some((message) => message.id === result.message?.id)
          ? current
          : [...current, result.message as Message]);
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-[420px] flex-col">
      <div className="flex-1 space-y-3 py-2">
        {messages.length ? messages.map((message) => {
          const ownMessage = message.sender_user_id === currentUserId;
          return (
            <div key={message.id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${ownMessage ? "bg-primary text-white" : "bg-gray-50 text-gray-700 ring-1 ring-gray-200"}`}>
                <p className="whitespace-pre-wrap">{message.body}</p>
                <p className={`mt-1 text-sm ${ownMessage ? "text-white/75" : "text-gray-500"}`}>
                  {message.sender_role === "admin" ? "Promoda" : message.sender_role === "solicitante" ? "Solicitante" : "Aliado"} · {formatDateTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        }) : (
          <p className="py-12 text-center text-sm text-gray-500">Todavía no hay mensajes en este hilo.</p>
        )}
        <div ref={endRef} />
      </div>

      {canSend ? (
        <form onSubmit={submit} className="sticky bottom-0 z-50 -mx-1 border-t border-gray-200 bg-white px-1 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <RealtimeStatus state={realtimeState} error={realtimeError} />
            <span className="text-sm text-gray-400">Enter para enviar · Shift + Enter para saltar línea</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <textarea
              className="min-h-[96px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base leading-6 text-ink shadow-inner outline-none transition placeholder:text-gray-400 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 sm:min-h-[76px]"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={4000}
              placeholder="Escribe un mensaje..."
              aria-label="Mensaje"
              disabled={pending}
            />
            <Button type="submit" size="sm" className="sm:min-w-28" disabled={pending || !body.trim()}>
              {pending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            {error ? <p className="text-sm text-danger">{error}</p> : <span />}
            <span className="shrink-0 text-sm text-gray-400">{body.length}/4000</span>
          </div>
        </form>
      ) : (
        <div className="sticky bottom-0 z-50 border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Este hilo está cerrado. Solo un administrador puede reabrirlo.</span>
            <RealtimeStatus state={realtimeState} error={realtimeError} />
          </div>
        </div>
      )}
    </div>
  );
}
