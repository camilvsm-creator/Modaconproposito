"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

import { deleteWorkshopAction } from "@/app/admin/talleres/actions";

export function DeleteWorkshopButton({ workshopId, workshopName }: { workshopId: string; workshopName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set("id", workshopId);
    const result = await deleteWorkshopAction(fd);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setConfirmText(""); setError(null); }}
        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-300 hover:bg-red-50 transition"
      >
        Eliminar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-ink">Eliminar taller</h2>
            <p className="mt-2 text-sm text-stone-600">
              Se eliminará permanentemente el taller <strong>{workshopName}</strong> y todos sus datos (necesidades, fotos, ofertas de ayuda, tokens de activación y usuario asociado).
            </p>
            <p className="mt-2 text-sm font-semibold text-red-600">Esta acción no se puede deshacer.</p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Escribe <strong>ELIMINAR</strong> para confirmar:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm"
                placeholder="ELIMINAR"
                autoFocus
              />
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={confirmText !== "ELIMINAR" || loading}
                onClick={handleDelete}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Eliminando..." : "Eliminar permanentemente"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
