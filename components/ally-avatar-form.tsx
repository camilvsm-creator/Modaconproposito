"use client";

import { useState } from "react";

import { uploadWorkshopAvatarAction } from "@/app/admin/ally-actions";
import { Button, SectionCard, inputClassName } from "@/components/ui";
import { MAX_WORKSHOP_AVATAR_BYTES, WORKSHOP_PHOTO_BUCKET } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Workshop } from "@/lib/types";

function avatarUrl(path: string | null) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${WORKSHOP_PHOTO_BUCKET}/${path}`;
}

export function AllyAvatarForm({ workshop }: { workshop: Workshop }) {
  const [path, setPath] = useState(workshop.avatar_path);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    if (file.size > MAX_WORKSHOP_AVATAR_BYTES) {
      setError("La imagen supera el límite de 2 MB.");
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const storagePath = `avatars/${workshop.id}/${Date.now()}.${ext}`;
      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage.from(WORKSHOP_PHOTO_BUCKET).upload(storagePath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error("No pudimos subir la imagen.");

      const formData = new FormData();
      formData.set("workshopId", workshop.id);
      formData.set("storagePath", storagePath);
      const result = await uploadWorkshopAvatarAction(formData);
      if (result.error) throw new Error(result.error);
      setPath(storagePath);
      setFile(null);
      setPreview(null);
      setSuccess("Foto de perfil guardada correctamente.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No pudimos guardar la imagen.");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      if (path) {
        const { error: removeError } = await createSupabaseBrowserClient().storage.from(WORKSHOP_PHOTO_BUCKET).remove([path]);
        if (removeError) throw new Error("No pudimos eliminar la imagen.");
      }
      const formData = new FormData();
      formData.set("workshopId", workshop.id);
      formData.set("storagePath", "");
      const result = await uploadWorkshopAvatarAction(formData);
      if (result.error) throw new Error(result.error);
      setPath(null);
      setPreview(null);
      setSuccess("Foto de perfil eliminada correctamente.");
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "No pudimos eliminar la imagen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard className="p-6">
      <h2 className="text-lg font-semibold text-ink">Foto de perfil</h2>
      <p className="mt-1 text-sm text-gray-500">La misma imagen se usa como avatar y logo público. Máximo 2 MB.</p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        {preview || avatarUrl(path) ? <img src={preview || avatarUrl(path)!} alt={`Foto de ${workshop.name}`} className="h-24 w-24 rounded-full object-cover ring-2 ring-gray-200" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-3xl font-semibold text-gray-400">{workshop.name.charAt(0).toUpperCase()}</div>}
        <form onSubmit={save} className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-end">
          <input className={`${inputClassName} file:mr-3 file:rounded file:border-0 file:bg-[#F74897] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const next = event.target.files?.[0] ?? null; setFile(next); setPreview(next ? URL.createObjectURL(next) : null); }} />
          <Button type="submit" disabled={pending || !file}>{pending ? "Guardando..." : "Guardar foto"}</Button>
        </form>
      </div>
      {path ? <Button type="button" variant="ghost" disabled={pending} onClick={remove} className="mt-3">Eliminar foto</Button> : null}
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {success ? <p role="status" className="mt-3 text-sm font-medium text-success">{success}</p> : null}
    </SectionCard>
  );
}
