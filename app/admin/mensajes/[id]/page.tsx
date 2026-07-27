import Link from "next/link";
import { notFound } from "next/navigation";

import { setMessageThreadStatusAction } from "@/app/admin/mensajes/actions";
import { MessageThreadLive } from "@/app/admin/mensajes/components/message-thread-live";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminStatusBadge } from "@/components/admin-data-ui";
import { Button } from "@/components/ui";
import { requireOperationsUser } from "@/lib/auth";
import { getMessageThread, getThreadMessagesPage } from "@/lib/messages";

async function updateThreadStatus(formData: FormData) {
  "use server";
  await setMessageThreadStatusAction(formData);
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Array.isArray(params.messagePage) ? params.messagePage[0] : params.messagePage;
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function statusLabel(status: string) {
  return status === "closed" ? "Cerrado" : "Abierto";
}

export default async function AdminMensajeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireOperationsUser();
  const { id } = await params;
  const query = await searchParams;
  const thread = await getMessageThread(id);
  if (!thread) notFound();

  const messages = await getThreadMessagesPage({ threadId: id, page: getPageParam(query), limit: 50 });
  const role = user.app_metadata?.role as string | undefined;
  const recipientName = thread.ally?.name ?? thread.requester?.name ?? "Destinatario";
  const recipientType = thread.ally ? "Aliado" : "Solicitante";
  const messagePage = getPageParam(query);
  const messagePageHref = (page: number) => page > 1 ? `/admin/mensajes/${id}?messagePage=${page}` : `/admin/mensajes/${id}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Mensajes"
        title={thread.subject}
        description={`${recipientType}: ${recipientName}`}
        navigation={{ baseHref: "/admin/mensajes", baseLabel: "Mensajes", currentLabel: thread.subject }}
        actions={
          <>
            <Link href="/admin/mensajes" className="inline-flex min-h-11 items-center justify-center rounded-md bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">
              Volver a mensajes
            </Link>
            {role === "admin" ? (
              <form action={updateThreadStatus}>
                <input type="hidden" name="threadId" value={thread.id} />
                <input type="hidden" name="status" value={thread.status === "closed" ? "open" : "closed"} />
                <Button type="submit" variant={thread.status === "closed" ? "primary" : "secondary"}>
                  {thread.status === "closed" ? "Reabrir hilo" : "Cerrar hilo"}
                </Button>
              </form>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
        <AdminStatusBadge className={thread.status === "closed" ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"}>
          {statusLabel(thread.status)}
        </AdminStatusBadge>
        <span className="text-sm text-gray-500">{recipientType}</span>
      </div>

      <section aria-label="Conversación" className="min-h-[520px] bg-white">
        <MessageThreadLive
          threadId={thread.id}
          initialMessages={messages.items}
          currentUserId={user.id}
          canSend={thread.status === "open"}
        />
      </section>

      {messages.pageCount > 1 ? (
        <AdminPagination
          page={messages.page}
          pageCount={messages.pageCount}
          total={messages.total}
          limit={messages.limit}
          hrefForPage={messagePageHref}
          className="border-t border-gray-200"
        />
      ) : null}

      {messagePage > 1 ? <p className="text-center text-sm text-gray-500">Mostrando mensajes anteriores del hilo.</p> : null}
    </div>
  );
}
