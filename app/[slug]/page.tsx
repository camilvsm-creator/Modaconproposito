import { ArrowLeft, ImageIcon, Instagram, MapPin, MessageCircle, Scissors } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WorkshopHelpForm } from "@/components/workshop-help-form";
import { WorkshopStatusBadge } from "@/components/workshop-status-badge";
import { SectionCard } from "@/components/ui";
import {
  getPublicWorkshopBySlug,
  getPublicWorkshopNeeds,
  getPublicWorkshopPhotos,
} from "@/lib/workshops";
import { WORKSHOP_PHOTO_BUCKET } from "@/lib/constants";
import { buildWhatsAppHref, formatDate } from "@/lib/utils";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getPublicWorkshopBySlug(slug);

  if (!workshop) {
    return { title: "Aliado no encontrado" };
  }

  return {
    title: workshop.public_name_allowed ? workshop.name : "Aliado Moda con Propósito",
    description: workshop.what_they_do?.slice(0, 160) ?? "Aliado de confección y apoyo textil.",
  };
}

export default async function WorkshopDetailPage({ params }: Props) {
  const { slug } = await params;
  const workshop = await getPublicWorkshopBySlug(slug);

  if (!workshop) notFound();

  const needs = await getPublicWorkshopNeeds(workshop.id);
  const photos = await getPublicWorkshopPhotos(workshop.id);
  const name = workshop.public_name_allowed ? workshop.name : "Aliado Moda con Propósito";

  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Link
            href="/aliados"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#F6026B] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a aliados
          </Link>

          <SectionCard className="space-y-0 overflow-hidden p-0">
                <div className="flex items-start gap-4 p-6 sm:p-8">
              {workshop.avatar_path ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${WORKSHOP_PHOTO_BUCKET}/${workshop.avatar_path}`}
                  alt={name}
                  className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-[#F6026B]/20"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFE6F0] text-[#F6026B] ring-2 ring-[#F6026B]/20">
                  <Scissors className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-[-0.03em] text-ink sm:text-3xl">
                      {name}
                    </h1>
                  </div>
                  <WorkshopStatusBadge value={workshop.status} />
                </div>

                {workshop.public_location_allowed && workshop.public_location ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#F6026B]" />
                    <div>
                      <p className="font-semibold text-ink">
                        {workshop.public_location}
                      </p>
                      <p className="text-sm text-stone-500">
                        {workshop.city}, {workshop.state}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {workshop.public_instagram_allowed && workshop.instagram ? (
                    <a
                      href={`https://instagram.com/${workshop.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow ugc"
                      className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-200"
                    >
                      <Instagram className="h-3.5 w-3.5" />
                      {workshop.instagram}
                    </a>
                  ) : null}
                  {workshop.public_whatsapp_allowed && workshop.whatsapp ? (
                    <a
                      href={buildWhatsAppHref(workshop.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer nofollow ugc"
                      className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-sm font-semibold text-success hover:bg-success/20"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Contactar por WhatsApp
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {workshop.what_they_do ? (
              <div className="border-t border-stone-100 px-6 py-5 sm:px-8">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-stone-500">
                  ¿Qué hace el aliado?
                </h2>
                <p className="mt-2 leading-7 text-stone-700">
                  {workshop.what_they_do}
                </p>
              </div>
            ) : null}
          </SectionCard>

          {needs.length ? (
            <SectionCard className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-ink">Necesidades</h2>
                <span className="rounded-full bg-[#FFE6F0] px-2.5 py-0.5 text-sm font-semibold text-[#C00253]">
                  {needs.length} {needs.length === 1 ? "activa" : "activas"}
                </span>
              </div>
              <div className="mt-4 grid gap-4">
                {needs.map((need) => (
                  <div
                    key={need.id}
                    className="rounded-2xl border border-stone-200 bg-white p-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold text-ink">{need.title}</h3>
                        {need.urgency ? (
                          <span className="shrink-0 rounded-full bg-warning-soft px-2.5 py-0.5 text-sm font-semibold text-warning">
                            {need.urgency}
                          </span>
                        ) : null}
                      </div>
                      {need.description ? (
                        <p className="text-sm leading-6 text-stone-600">
                          {need.description}
                        </p>
                      ) : null}
                      {need.requested_items ? (
                        <div className="rounded-2xl bg-stone-50 p-3">
                          <p className="text-sm font-black uppercase tracking-[0.12em] text-stone-500">
                            Insumos solicitados
                          </p>
                          <p className="mt-1 text-sm font-semibold text-stone-700">
                            {need.requested_items}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {photos.length ? (
            <SectionCard className="p-6 sm:p-8">
              <h2 className="text-xl font-black text-ink">Fotos</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo) => {
                  const src = photo.storage_path
                    ? `https://${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace("https://", "")}/storage/v1/object/public/${WORKSHOP_PHOTO_BUCKET}/${photo.storage_path}`
                    : null;
                  return (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-xl bg-stone-100"
                      style={{ aspectRatio: "4 / 3" }}
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={photo.title ?? ""}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-stone-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard className="p-6 sm:p-8">
            <h2 className="text-xl font-black text-ink">Quiero ayudar</h2>
            <p className="mt-2 text-sm text-stone-600">
              Si puedes aportar insumos, materiales, tiempo o cualquier otro
              tipo de apoyo a este aliado, completa el formulario y te
              contactaremos.
            </p>
            <div className="mt-4">
              <WorkshopHelpForm
                workshopId={workshop.id}
                workshopName={name}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
