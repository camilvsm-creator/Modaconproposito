"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

import { updateWorkshopProfileAction, uploadWorkshopAvatarAction } from "@/app/admin/talleres/panel/actions";
import { Button, InputShell, SectionCard, inputClassName } from "@/components/ui";
import { WORKSHOP_PHOTO_BUCKET, MAX_WORKSHOP_AVATAR_BYTES } from "@/lib/constants";
import type { Workshop } from "@/lib/types";

function avatarUrl(storagePath: string | null) {
  if (!storagePath) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${WORKSHOP_PHOTO_BUCKET}/${storagePath}`;
}

export function WorkshopProfileForm({ workshop }: { workshop: Workshop }) {
  const [name, setName] = useState(workshop.name);
  const [responsibleName, setResponsibleName] = useState(workshop.responsible_name);
  const [whatsapp, setWhatsapp] = useState(workshop.whatsapp ?? "");
  const [instagram, setInstagram] = useState(workshop.instagram ?? "");
  const [state, setState] = useState(workshop.state);
  const [city, setCity] = useState(workshop.city);
  const [municipality, setMunicipality] = useState(workshop.municipality ?? "");
  const [publicLocation, setPublicLocation] = useState(workshop.public_location ?? "");
  const [description, setDescription] = useState(workshop.description ?? "");
  const [whatTheyDo, setWhatTheyDo] = useState(workshop.what_they_do);
  const [publicNameAllowed, setPublicNameAllowed] = useState(workshop.public_name_allowed);
  const [publicLocationAllowed, setPublicLocationAllowed] = useState(workshop.public_location_allowed);
  const [publicInstagramAllowed, setPublicInstagramAllowed] = useState(workshop.public_instagram_allowed);
  const [publicWhatsappAllowed, setPublicWhatsappAllowed] = useState(workshop.public_whatsapp_allowed);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(avatarUrl(workshop.avatar_path));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [avatarPending, setAvatarPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const result = await updateWorkshopProfileAction(formData);
    setIsPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  }

  async function handleAvatarUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!avatarFile) return;

    setAvatarPending(true);
    setError(null);

    try {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const storagePath = `avatars/${workshop.id}/${Date.now()}.${ext}`;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error: uploadError } = await supabase.storage
        .from(WORKSHOP_PHOTO_BUCKET)
        .upload(storagePath, avatarFile, {
          contentType: avatarFile.type,
          upsert: true,
        });

      if (uploadError) throw new Error("No pudimos subir la imagen. Intenta nuevamente.");

      const formData = new FormData();
      formData.set("workshopId", workshop.id);
      formData.set("storagePath", storagePath);

      const result = await uploadWorkshopAvatarAction(formData);
      if (result.error) throw new Error(result.error);

      setAvatarSrc(avatarUrl(storagePath));
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el avatar.");
    } finally {
      setAvatarPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <SectionCard className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Foto de perfil</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="shrink-0">
            {avatarPreview || avatarSrc ? (
              <img
                src={avatarPreview || avatarSrc!}
                alt="Avatar del taller"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-stone-200"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 ring-2 ring-stone-200">
                <span className="text-2xl font-semibold text-stone-400">
                  {workshop.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <form onSubmit={handleAvatarUpload} className="flex flex-wrap items-end gap-3">
            <input
              type="file"
              accept="image/*"
              className={inputClassName + " file:mr-3 file:rounded file:border-0 file:bg-[#F74897] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setAvatarFile(file);
                if (file) {
                  setAvatarPreview(URL.createObjectURL(file));
                } else {
                  setAvatarPreview(null);
                }
              }}
            />
            <Button type="submit" disabled={avatarPending || !avatarFile}>
              {avatarPending ? "Subiendo..." : "Subir foto"}
            </Button>
          </form>
        </div>
        {workshop.avatar_path ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAvatarPending(true);
              setError(null);
              try {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
                const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                  auth: { autoRefreshToken: false, persistSession: false },
                });
                await supabase.storage.from(WORKSHOP_PHOTO_BUCKET).remove([workshop.avatar_path!]);
                const formData = new FormData();
                formData.set("workshopId", workshop.id);
                formData.set("storagePath", "");
                const result = await uploadWorkshopAvatarAction(formData);
                if (result.error) throw new Error(result.error);
                setAvatarSrc(null);
                setAvatarFile(null);
                setAvatarPreview(null);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Error al eliminar el avatar.");
              } finally {
                setAvatarPending(false);
              }
            }}
            className="mt-3"
          >
            <Button type="submit" variant="ghost" disabled={avatarPending}>
              Eliminar foto
            </Button>
          </form>
        ) : null}
      </SectionCard>

      <SectionCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="workshopId" value={workshop.id} />

          <div className="grid gap-4 md:grid-cols-2">
            <InputShell label="Nombre del taller">
              <input className={inputClassName} name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </InputShell>
            <InputShell label="Responsable">
              <input className={inputClassName} name="responsibleName" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} required />
            </InputShell>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputShell label="WhatsApp">
              <input className={inputClassName} name="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </InputShell>
            <InputShell label="Instagram">
              <input className={inputClassName} name="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            </InputShell>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InputShell label="Estado">
              <input className={inputClassName} name="state" value={state} onChange={(e) => setState(e.target.value)} required />
            </InputShell>
            <InputShell label="Ciudad">
              <input className={inputClassName} name="city" value={city} onChange={(e) => setCity(e.target.value)} required />
            </InputShell>
            <InputShell label="Municipio/Parroquia">
              <input className={inputClassName} name="municipality" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
            </InputShell>
          </div>

          <InputShell label="Zona pública">
            <input className={inputClassName} name="publicLocation" value={publicLocation} onChange={(e) => setPublicLocation(e.target.value)} />
          </InputShell>

          <InputShell label="Descripción">
            <textarea className={inputClassName + " min-h-[100px]"} name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </InputShell>

          <InputShell label="Qué hace el taller">
            <textarea className={inputClassName + " min-h-[100px]"} name="whatTheyDo" value={whatTheyDo} onChange={(e) => setWhatTheyDo(e.target.value)} required />
          </InputShell>

          <fieldset className="space-y-3">
            <legend className="text-base font-medium text-stone-900">Autorizaciones de publicación</legend>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="publicNameAllowed" checked={publicNameAllowed} onChange={(e) => setPublicNameAllowed(e.target.checked)} className="h-5 w-5 rounded border-stone-300 text-primary focus:ring-primary/30" />
                <span className="text-sm text-stone-700">Permitir publicar el nombre del responsable</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="publicLocationAllowed" checked={publicLocationAllowed} onChange={(e) => setPublicLocationAllowed(e.target.checked)} className="h-5 w-5 rounded border-stone-300 text-primary focus:ring-primary/30" />
                <span className="text-sm text-stone-700">Permitir publicar la zona de ubicación</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="publicInstagramAllowed" checked={publicInstagramAllowed} onChange={(e) => setPublicInstagramAllowed(e.target.checked)} className="h-5 w-5 rounded border-stone-300 text-primary focus:ring-primary/30" />
                <span className="text-sm text-stone-700">Permitir publicar el enlace de Instagram</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="publicWhatsappAllowed" checked={publicWhatsappAllowed} onChange={(e) => setPublicWhatsappAllowed(e.target.checked)} className="h-5 w-5 rounded border-stone-300 text-primary focus:ring-primary/30" />
                <span className="text-sm text-stone-700">Permitir publicar el número de WhatsApp</span>
              </label>
            </div>
          </fieldset>

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {success ? <p className="text-sm text-success">Perfil actualizado correctamente.</p> : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </SectionCard>
    </div>
  );
}
