import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";

import { IniciativaHelpForm } from "@/components/iniciativa-help-form";
import {
  ACTIVE_INITIATIVES,
  type Initiative,
  type InitiativeImage,
  type InitiativeList,
} from "@/lib/iniciativas";

export const metadata: Metadata = {
  title: "Iniciativas — Moda con Propósito",
};

export default function IniciativasPage() {
  return (
    <div className="full-bleed overflow-hidden bg-[#F7F2EF] text-ink">
      <Hero />
      {ACTIVE_INITIATIVES.map((initiative, index) => (
        <InitiativeSection
          key={initiative.slug}
          initiative={initiative}
          flip={index % 2 === 1}
        />
      ))}
    </div>
  );
}

function Hero() {
  const first = ACTIVE_INITIATIVES[0];
  return (
    <section className="relative isolate overflow-hidden bg-[#201923] text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(247,72,151,0.24),transparent_34%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-28 top-16 h-72 w-72 rounded-full border border-[#F6026B]/30"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[520px] items-center gap-10 py-11 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:py-14">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              Forma parte de una iniciativa
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
              Descubre las distintas iniciativas en las que puedes ayudar y
              elige la que más se conecte contigo. Cada aporte, por pequeño que
              sea, se convierte en un gesto concreto de apoyo.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {ACTIVE_INITIATIVES.map((initiative) => (
                <a
                  key={initiative.slug}
                  href={`#${initiative.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold text-white transition hover:border-[#FF91BA] hover:bg-white/10"
                >
                  <span>{initiative.emoji}</span>
                  {initiative.name}
                </a>
              ))}
            </div>
          </div>

          <div className="relative mx-auto grid h-[360px] w-full max-w-[560px] grid-cols-12 grid-rows-6 gap-3 sm:h-[440px]">
            <PhotoFrame
              image={first.images[0]}
              priority
              className="col-span-7 row-span-6 !rounded-[1.5rem]"
            />
            <PhotoFrame
              image={first.images[1]}
              className="col-span-5 row-span-3 !rounded-[1.5rem]"
            />
            <PhotoFrame
              image={first.images[2]}
              className="col-span-5 row-span-3 !rounded-[1.5rem]"
            />
            <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#201923] shadow-xl sm:left-5 sm:top-5 sm:px-4 sm:py-2">
              Hecho con cariño
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InitiativeSection({
  initiative,
  flip,
}: {
  initiative: Initiative;
  flip: boolean;
}) {
  const dark = initiative.accent === "dark";

  return (
    <section
      id={initiative.slug}
      className={`full-bleed ${
        dark ? "bg-[#201923] text-white" : "bg-white text-ink"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div className={flip ? "lg:order-2" : undefined}>
            <InitiativeCollage images={initiative.images} dark={dark} />
          </div>
          <div className={flip ? "lg:order-1" : undefined}>
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                  <span className="mr-2">{initiative.emoji}</span>
                  {initiative.name}
                </h2>
              </div>

              <div
                className={`space-y-4 text-base leading-8 ${
                  dark ? "text-white/75" : "text-stone-700"
                }`}
              >
                {initiative.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 space-y-12 lg:mt-20">
          {initiative.lists?.length ? (
            <div className="space-y-10">
              {initiative.lists.map((list) => (
                <InitiativeListBlock
                  key={list.title}
                  list={list}
                  dark={dark}
                />
              ))}
            </div>
          ) : null}

          {initiative.steps?.length ? (
            <StepsBlock steps={initiative.steps} dark={dark} />
          ) : null}

          <HowToHelpBlock howToHelp={initiative.howToHelp} dark={dark} />

          {initiative.closing ? (
            <p
              className={`max-w-3xl text-lg font-bold leading-8 ${
                dark ? "text-[#FF91BA]" : "text-[#C00253]"
              }`}
            >
              {initiative.closing}
            </p>
          ) : null}

          <div className="space-y-8">
            <a
              href={initiative.cta.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F6026B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C00253]"
            >
              {initiative.cta.label}
              <ArrowUpRight className="h-4 w-4" />
            </a>

            {initiative.helpForm ? (
              <IniciativaHelpForm
                initiativeSlug={initiative.slug}
                helpTypes={initiative.helpForm.helpTypes}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function InitiativeCollage({
  images,
  dark,
}: {
  images: InitiativeImage[];
  dark: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={`absolute -inset-3 rounded-[2.5rem] ${
          dark ? "bg-[#FF91BA]/10" : "bg-[#FFE6F0]"
        }`}
        aria-hidden="true"
      />
      <div className="relative grid h-[340px] grid-cols-2 grid-rows-3 gap-3 sm:h-[420px]">
        <PhotoFrame
          image={images[0]}
          className="col-span-2 row-span-2 !rounded-[2rem]"
        />
        <PhotoFrame image={images[1]} className="!rounded-[2rem]" />
        {images[2] ? (
          <PhotoFrame image={images[2]} className="!rounded-[2rem]" />
        ) : null}
      </div>
    </div>
  );
}

function PhotoFrame({
  image,
  className,
  priority = false,
}: {
  image: InitiativeImage;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] bg-stone-200 ${
        className ?? ""
      }`}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition duration-700 hover:scale-105"
      />
    </div>
  );
}

function InitiativeListBlock({
  list,
  dark,
}: {
  list: InitiativeList;
  dark: boolean;
}) {
  return (
    <div>
      <h3 className="text-2xl font-black tracking-[-0.02em]">{list.title}</h3>
      {list.kind === "donation-cards" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {list.groups?.map((group) => (
            <div
              key={group.label}
              className={`rounded-[2rem] p-6 sm:p-7 ${
                dark
                  ? "border border-white/15 bg-white/5"
                  : "border border-[#F6026B]/20 bg-[#FFE6F0]"
              }`}
            >
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F6026B]">
                {group.label}
              </p>
              <ul className="mt-5 space-y-4">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F6026B]" />
                    <span className={dark ? "text-white/75" : "text-stone-700"}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {list.items?.map((item) => (
            <div
              key={item}
              className={`flex items-start gap-3 rounded-2xl p-4 ${
                dark
                  ? "border border-white/15 bg-white/5"
                  : "border border-stone-200 bg-[#F7F2EF]"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  dark ? "bg-[#FF91BA]/20" : "bg-[#F6026B]/15"
                }`}
              >
                <Check
                  className={`h-3.5 w-3.5 ${
                    dark ? "text-[#FF91BA]" : "text-[#F6026B]"
                  }`}
                />
              </span>
              <span className="text-sm leading-6">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepsBlock({
  steps,
  dark,
}: {
  steps: Initiative["steps"];
  dark: boolean;
}) {
  return (
    <div>
      <h3 className="text-2xl font-black tracking-[-0.02em]">
        ¿Cómo funciona?
      </h3>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps?.map((step, index) => (
          <div
            key={step.title}
            className={`rounded-[2rem] p-6 sm:p-7 ${
              dark
                ? "border border-white/15 bg-white/5"
                : "border border-stone-200 bg-white"
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6026B] text-sm font-black text-white">
              {index + 1}
            </span>
            <h4 className="mt-5 text-lg font-black leading-tight">{step.title}</h4>
            <p
              className={`mt-3 text-sm leading-6 ${
                dark ? "text-white/75" : "text-stone-600"
              }`}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowToHelpBlock({
  howToHelp,
  dark,
}: {
  howToHelp: Initiative["howToHelp"];
  dark: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black tracking-[-0.02em]">¿Cómo ayudar?</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {howToHelp.map((help) => (
          <div
            key={help.title}
            className={`flex flex-col items-center gap-3 rounded-[2rem] p-6 text-center sm:p-7 ${
              dark
                ? "border border-white/15 bg-white/5"
                : "border border-stone-200 bg-[#F7F2EF]"
            }`}
          >
            <span className="text-3xl">{help.icon}</span>
            <h4 className="font-black">{help.title}</h4>
            <p
              className={`text-sm leading-6 ${
                dark ? "text-white/75" : "text-stone-600"
              }`}
            >
              {help.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
