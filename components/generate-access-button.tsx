"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { generateAccessLinkAction } from "@/app/admin/talleres/actions";

export function GenerateAccessButton({ workshopId, workshopName }: { workshopId: string; workshopName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activationLink, setActivationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set("workshopId", workshopId);
    const result = await generateAccessLinkAction(fd);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.activationLink) {
      setActivationLink(result.activationLink);
      router.refresh();
    }
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
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setActivationLink(null); setError(null); }}
        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#F74897] ring-1 ring-[#F74897]/40 hover:bg-[#F74897]/5 transition"
      >
        Generar acceso
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={handleClose}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-ink">Generar acceso</h2>
            <p className="mt-2 text-sm text-stone-600">
              Se generará un enlace de activación para <strong>{workshopName}</strong>. Compártelo con la persona responsable para que cree su cuenta.
            </p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            {activationLink ? (
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-stone-700">
                  Enlace de activación:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activationLink}
                    className="flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-700"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-full bg-[#F74897] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#D6003F] transition"
                  >
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="text-sm text-stone-500">
                  El enlace expira en 7 días. Al generar uno nuevo, el anterior deja de funcionar.
                </p>
              </div>
            ) : (
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGenerate}
                  className="rounded-full bg-[#F74897] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D6003F] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generando..." : "Generar enlace"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50 transition"
                >
                  Cancelar
                </button>
              </div>
            )}

            {activationLink && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50 transition"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
