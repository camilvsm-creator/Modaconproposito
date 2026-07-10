"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

import { uploadWorkshopPhotoAction } from "@/app/admin/talleres/panel/actions";
import { Button, InputShell, SectionCard, inputClassName } from "@/components/ui";
import { WORKSHOP_PHOTO_BUCKET, MAX_WORKSHOP_PHOTOS } from "@/lib/constants";

export function PhotosManager({ workshopId }: { workshopId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(false);

    if (!file) {
      setError("Selecciona una imagen para subir.");
      setIsPending(false);
      return;
    }

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const storagePath = `workshops/${workshopId}/${self.crypto.randomUUID()}.${ext}`;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error: uploadError } = await supabase.storage
        .from(WORKSHOP_PHOTO_BUCKET)
        .upload(storagePath, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        throw new Error("No pudimos subir la imagen. Intenta nuevamente.");
      }

      const formData = new FormData();
      formData.set("workshopId", workshopId);
      formData.set("storagePath", storagePath);
      formData.set("title", title);
      formData.set("description", description);

      const result = await uploadWorkshopPhotoAction(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setFile(null);
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <SectionCard className="p-6">
      <h2 className="mb-1 text-lg font-semibold text-ink">Subir foto</h2>
      <p className="mb-4 text-sm text-danger">
        No subas documentos personales, rostros de menores de edad, direcciones exactas ni información sensible.
      </p>
      <p className="mb-4 text-sm text-stone-500">
        Máximo {MAX_WORKSHOP_PHOTOS} fotos por taller.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputShell label="Título">
          <input className={inputClassName} name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </InputShell>

        <InputShell label="Descripción">
          <textarea className={inputClassName + " min-h-[80px]"} name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </InputShell>

        <InputShell label="Imagen">
          <input
            type="file"
            accept="image/*"
            className={inputClassName + " file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </InputShell>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-success">Foto subida correctamente, queda pendiente de revisión.</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Subiendo..." : "Subir foto"}
        </Button>
      </form>
    </SectionCard>
  );
}
