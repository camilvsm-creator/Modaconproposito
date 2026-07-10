"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

import { createPatternAction } from "@/app/admin/talleres/patrones/actions";
import { Button, InputShell, SectionCard, inputClassName } from "@/components/ui";
import { PATTERN_BUCKET, PATTERN_CATEGORIES, PATTERN_DIFFICULTIES, PATTERN_DIFFICULTY_LABELS } from "@/lib/constants";

export function UploadPatternForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [patternFile, setPatternFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(false);

    if (!patternFile) {
      setError("Selecciona el archivo del patrón (PDF o imagen).");
      setIsPending(false);
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const patternExt = patternFile.name.split(".").pop() || "pdf";
      const patternPath = `patterns/${self.crypto.randomUUID()}.${patternExt}`;

      const { error: patternUploadError } = await supabase.storage
        .from(PATTERN_BUCKET)
        .upload(patternPath, patternFile, { contentType: patternFile.type, upsert: false });

      if (patternUploadError) {
        throw new Error("No pudimos subir el archivo del patrón. Intenta nuevamente.");
      }

      let imagePath = "";
      if (imageFile) {
        const imageExt = imageFile.name.split(".").pop() || "png";
        imagePath = `patterns/${self.crypto.randomUUID()}.${imageExt}`;

        const { error: imageUploadError } = await supabase.storage
          .from(PATTERN_BUCKET)
          .upload(imagePath, imageFile, { contentType: imageFile.type, upsert: false });

        if (imageUploadError) {
          throw new Error("No pudimos subir la imagen de previsualización.");
        }
      }

      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("difficulty", difficulty);
      formData.set("category", category);
      formData.set("filePath", patternPath);
      formData.set("fileSizeBytes", String(patternFile.size));
      formData.set("imagePath", imagePath);

      const result = await createPatternAction(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setDifficulty("");
      setCategory("");
      setPatternFile(null);
      setImageFile(null);
      const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
      fileInputs.forEach((input) => { input.value = ""; });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el patrón.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <SectionCard className="p-6">
      <h2 className="mb-1 text-lg font-semibold text-ink">Subir nuevo patrón</h2>
      <p className="mb-4 text-sm text-stone-500">
        Subí un patrón estandarizado en formato PDF o imagen. Opcionalmente podés incluir una imagen de previsualización.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputShell label="Título *">
          <input className={inputClassName} name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </InputShell>

        <InputShell label="Descripción">
          <textarea className={inputClassName + " min-h-[80px]"} name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </InputShell>

        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Dificultad">
            <select className={inputClassName} name="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">Sin especificar</option>
              {PATTERN_DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{PATTERN_DIFFICULTY_LABELS[d]}</option>
              ))}
            </select>
          </InputShell>

          <InputShell label="Categoría">
            <select className={inputClassName} name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Sin categoría</option>
              {PATTERN_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </InputShell>
        </div>

        <InputShell label="Archivo del patrón * (PDF o imagen)">
          <input
            type="file"
            accept=".pdf,image/*"
            className={inputClassName + " file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"}
            onChange={(e) => setPatternFile(e.target.files?.[0] ?? null)}
            required
          />
        </InputShell>

        <InputShell label="Imagen de previsualización (opcional)">
          <input
            type="file"
            accept="image/*"
            className={inputClassName + " file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"}
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </InputShell>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-success">Patrón subido correctamente.</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Subiendo..." : "Subir patrón"}
        </Button>
      </form>
    </SectionCard>
  );
}