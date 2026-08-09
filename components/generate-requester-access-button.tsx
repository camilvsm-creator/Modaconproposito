"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { generateAidRequesterAccessLinkAction } from "@/app/admin/solicitantes/actions";

export function GenerateRequesterAccessButton({ requesterId, requesterName }: { requesterId: string; requesterName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activationLink, setActivationLink] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const titleId = `generate-requester-access-modal-title-${useId().replace(/:/g, "")}`;
  const router = useRouter();

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    const fd = new FormData();
    fd.set("requesterId", requesterId);
    const result = await generateAidRequesterAccessLinkAction(fd);
    setLoading(false);

    if (result.activationLink) {
      setActivationLink(result.activationLink);
      router.refresh();
    }
    setEmailSent(result.emailSent === true);
    if (result.error) setError(result.error);
  }

  function handleCopy() {
    if (!activationLink) return;
    navigator.clipboard.writeText(activationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setOpen(false);
    setActivationLink(null);
    setEmailSent(false);
    setError(null);
  }

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setActivationLink(null); setEmailSent(false); setError(null); }}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/40 transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      >
        Generar acceso
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={handleClose}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[calc(100dvh-0.5rem)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-18px_50px_-28px_rgba(31,26,23,0.65)] ring-1 ring-gray-200 sm:max-h-[min(760px,calc(100dvh-3rem))] sm:rounded-xl sm:p-6 sm:shadow-[0_24px_70px_-38px_rgba(31,26,23,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-semibold text-ink sm:text-xl">Generar acceso</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Se generará un enlace de activación para <strong>{requesterName}</strong>. Si tiene correo registrado, también se enviará por email.
                </p>
              </div>
              <button type="button" onClick={handleClose} className="min-h-11 rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">Cerrar</button>
            </div>

            <div className="admin-modal-content mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              {error && <p className="text-sm text-danger">{error}</p>}

              {activationLink ? (
                <div className="space-y-3">
                {emailSent ? (
                  <p className="text-sm font-medium text-emerald-700">El correo de acceso fue enviado correctamente.</p>
                ) : !error ? (
                  <p className="text-sm font-medium text-amber-700">El registro no tiene correo. Comparte el enlace manualmente.</p>
                ) : null}
                <label className="block text-sm font-medium text-gray-700">Enlace de activación:</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    readOnly
                    value={activationLink}
                    className="min-h-11 w-full min-w-0 flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="min-h-11 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 sm:w-auto"
                  >
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="text-sm text-gray-500">El enlace expira en 7 días. Al generar uno nuevo, el anterior deja de funcionar.</p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGenerate}
                  className="min-h-11 rounded-md bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Regenerando..." : "Volver a generar acceso"}
                </button>
                </div>
              ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGenerate}
                  className="min-h-11 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? "Generando y enviando..." : "Generar acceso"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-h-11 w-full rounded-md bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-200 sm:w-auto"
                >
                  Cancelar
                </button>
              </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
