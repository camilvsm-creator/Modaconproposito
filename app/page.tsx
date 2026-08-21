import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, HeartHandshake, PackageCheck, Scissors } from "lucide-react";

import { ALLY_CATEGORY_LABELS } from "@/lib/constants";
import { ACTIVE_INITIATIVES } from "@/lib/iniciativas";
import { Illustration } from "@/components/illustration";

export const metadata: Metadata = {
  title: "Moda con Propósito — Red de Aliados Verificados",
};

const galleryImages = [
  {
    src: "/voluntariado-promoda/img-0106.webp",
    alt: "Voluntaria trabajando en una máquina de coser",
  },
  {
    src: "/voluntariado-promoda/img-8706.webp",
    alt: "Voluntaria confeccionando prendas en un taller textil",
  },
  {
    src: "/voluntariado-promoda/img-9079.webp",
    alt: "Voluntarias sosteniendo productos textiles preparados para entregar",
  },
  {
    src: "/voluntariado-promoda/ea84784b-82c8-4675-baed-55f7493ffa15.webp",
    alt: "Paquetes textiles organizados para una entrega",
  },
  {
    src: "/voluntariado-promoda/img-9892.webp",
    alt: "Cartucheras Mi cartera, tu refugio terminadas",
  },
  {
    src: "/voluntariado-promoda/deafc734-d229-4b3a-87f3-0da81d8c089a.webp",
    alt: "Detalle de una cartuchera confeccionada",
  },
  {
    src: "/voluntariado-promoda/3add65b2-9b2d-462e-ae02-f1ad63c3ef74.webp",
    alt: "Prendas textiles empacadas y etiquetadas",
  },
  {
    src: "/voluntariado-promoda/img-8705.webp",
    alt: "Productos textiles terminados sobre una mesa de trabajo",
  },
  {
    src: "/voluntariado-promoda/img-9626.webp",
    alt: "Productos textiles listos para ser distribuidos",
  },
  {
    src: "/voluntariado-promoda/img-9505.webp",
    alt: "Paquetes de ayuda textil preparados para entregar",
  },
];

function PhotoFrame({
  image,
  className,
  priority = false,
}: {
  image: (typeof galleryImages)[number];
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-stone-200 ${className ?? ""}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition duration-700 hover:scale-105"
      />
    </div>
  );
}

export default function NuestraMisionPage() {
  return (
    <div className="full-bleed overflow-hidden bg-[#F7F2EF] text-ink">
      <section className="relative isolate overflow-hidden bg-white text-ink">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-[540px] items-center gap-10 py-11 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:py-14">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-black leading-[0.98] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
                Nuestra misión
              </h1>
              <h2 className="mt-5 max-w-xl text-xl font-semibold leading-tight tracking-[-0.03em] text-[#C00253] sm:text-2xl">
                Una red donde cada talento, recurso y aporte puede convertirse en ayuda.
              </h2>
              <div className="mt-5 max-w-xl space-y-4 text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
                <p>
                  Conectamos talleres, escuelas de moda, costureros, diseñadores, patronistas, empresas, voluntarios y
                  colaboradores para poner sus capacidades al servicio de quienes más lo necesitan.
                </p>
                <p>
                  Moda con Propósito articula esta red para transformar conocimientos, materiales, tiempo y recursos en
                  artículos textiles y acciones de ayuda concretas, coordinando cada etapa desde la necesidad hasta la
                  entrega.
                </p>
                <p>
                  Así, cada persona y organización puede aportar desde lo que tiene y sabe hacer, formando parte de una
                  red solidaria organizada, transparente y capaz de responder donde se necesita.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/registro"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F6026B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C00253]"
                >
                  Registrar aliado
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/voluntarios"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-bold text-[#F6026B] transition hover:border-[#F6026B]/40 hover:bg-[#FFE6F0]"
                >
                  Postularme como voluntario
                </Link>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-center">
              <div className="w-full max-w-[440px] overflow-hidden rounded-[2rem] ring-1 ring-stone-200">
                <Illustration
                  src="/ilustraciones/maquina-coser-rosa.png"
                  alt="Ilustración de máquina de coser rosada de Moda con Propósito"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-ink sm:text-5xl">
              ¿Cómo funciona?
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
            <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] bg-[#201923] p-8 text-white sm:p-10">
              <Image
                src={galleryImages[6].src}
                alt={galleryImages[6].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover opacity-35"
              />
              <div className="relative z-10 flex h-full flex-col justify-end">
                <Scissors className="h-9 w-9 text-[#FF91BA]" />
                <p className="mt-6 max-w-sm text-2xl font-bold leading-tight sm:text-3xl">
                  Transformar conocimientos, mano de obra e insumos en artículos textiles esenciales.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="relative rounded-[2rem] border border-[#F6026B]/20 bg-[#FFE6F0] p-6 sm:p-7">
                <Illustration
                  src="/ilustraciones/boton-verde.png"
                  className="pointer-events-none absolute right-5 top-5 hidden h-10 w-auto object-contain sm:block"
                />
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F6026B] text-white">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <h3 className="mt-7 text-lg font-black text-[#C00253]">Aliados verificados</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Las academias, talleres, escuelas y otros aliados pueden registrarse para formar parte de la red, compartir su capacidad de producción y participar en la confección de productos textiles destinados a apoyar a las comunidades afectadas.
                </p>
              </article>
              <article className="relative rounded-[2rem] border border-stone-200 bg-[#F7F2EF] p-6 sm:p-7">
                <Illustration
                  src="/ilustraciones/flor-naranja.png"
                  className="pointer-events-none absolute bottom-5 right-6 hidden h-9 w-auto object-contain sm:block"
                />
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#201923] text-white">
                  <Scissors className="h-5 w-5" />
                </div>
                <h3 className="mt-7 text-lg font-black text-[#C00253]">Voluntarios</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Personas con conocimientos en confección, patronaje, diseño, corte, costura, logística u otras áreas pueden sumarse para apoyar los procesos que requieran colaboración.
                </p>
              </article>
              <article className="relative rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(31,26,23,0.55)] sm:p-7">
                <Illustration
                  src="/ilustraciones/corazon-rosa.png"
                  className="pointer-events-none absolute right-6 top-6 hidden h-8 w-auto object-contain sm:block"
                />
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF91BA] text-[#201923]">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-7 text-lg font-black text-[#C00253]">Aliados y colaboradores</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Empresas, organizaciones e instituciones pueden aportar materiales textiles como telas, cierres, hilos, elásticos u otros insumos necesarios para la producción.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="voluntariado" className="bg-[#F7F2EF] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-ink sm:text-5xl">
                ¿A quiénes buscamos como voluntarios?
              </h2>
            </div>
            <p className="text-base leading-8 text-stone-700 sm:text-lg">
              Para construir una red sólida y sostenible, no solo necesitamos manos frente a las máquinas de coser, sino también talento en comunicación, logística y gestión. Buscamos perfiles comprometidos en las siguientes áreas:
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <article className="overflow-hidden rounded-[2rem] bg-white">
              <PhotoFrame image={galleryImages[7]} className="h-56 rounded-none" />
              <div className="p-7">
                <h3 className="text-lg font-black text-[#C00253]">Área Técnica y Académica</h3>
                <ul className="mt-5 space-y-4 text-sm leading-6 text-stone-700">
                  <li>
                    <strong className="font-bold text-ink">Academias y escuelas de moda y diseño:</strong>{" "}
                    Para sumar a sus comunidades estudiantiles y docentes en jornadas de práctica formativa con impacto social.
                  </li>
                  <li>
                    <strong className="font-bold text-ink">Voluntarios en costura:</strong>{" "}
                    Costureros, patronistas y confeccionistas para hacer equipo con las academias y escuelas.
                  </li>
                </ul>
              </div>
            </article>

            <article className="overflow-hidden rounded-[2rem] bg-white">
              <PhotoFrame image={galleryImages[5]} className="h-56 rounded-none" />
              <div className="p-7">
                <h3 className="text-lg font-black text-[#C00253]">Área de Comunicación y Medios</h3>
                <ul className="mt-5 space-y-4 text-sm leading-6 text-stone-700">
                  <li>
                    <strong className="font-bold text-ink">Creadores de contenido:</strong>{" "}
                    Para visibilizar las jornadas, contar las historias de los voluntarios y mantener informada a la comunidad.
                  </li>
                  <li>
                    <strong className="font-bold text-ink">Diseñadores gráficos:</strong>{" "}
                    Para la creación de material visual de campaña, fichas técnicas simplificadas, infografías e instructivos.
                  </li>
                </ul>
              </div>
            </article>

            <article className="overflow-hidden rounded-[2rem] bg-[#201923] text-white lg:col-span-1">
              <PhotoFrame image={galleryImages[8]} className="h-56 rounded-none" />
              <div className="p-7">
                <h3 className="text-lg font-black text-[#FF91BA]">🚚 Área Operativa, Logística y Servicios</h3>
                <ul className="mt-5 space-y-4 text-sm leading-6 text-white/75">
                  <li>
                    <strong className="font-bold text-white">Atención de usuarios y coordinación de voluntariado:</strong>{" "}
                    Para gestionar las convocatorias, responder dudas de los aliados y hacer seguimiento a las entregas.
                  </li>
                  <li>
                    <strong className="font-bold text-white">Distribución, envíos y transporte:</strong>{" "}
                    Aliados logísticos y conductores voluntarios para trasladar los kits precortados hacia los talleres y llevar el producto terminado al centro o refugio.
                  </li>
                  <li>
                    <strong className="font-bold text-white">Papelería e impresión:</strong>{" "}
                    Imprentas o aliados que puedan donar o facilitar la impresión de etiquetas de talla, empaques, fichas técnicas y material informativo.
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-ink sm:text-5xl">
                Categorías de aliados
              </h2>
            </div>
            <Link href="/aliados" className="inline-flex items-center gap-2 text-sm font-bold text-[#C00253] hover:text-[#F6026B]">
              Ver aliados
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(ALLY_CATEGORY_LABELS).map(([value, label]) => (
              <article key={value} className="group rounded-[2rem] border border-stone-200 bg-[#F7F2EF] p-6 transition hover:-translate-y-1 hover:border-[#F6026B]/50">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F6026B]">{label}</p>
                <p className="mt-4 text-sm leading-6 text-stone-600">Aliados que pueden sumarse a tareas, producción y apoyo textil coordinado por Moda con Propósito.</p>
                <ArrowUpRight className="mt-8 h-5 w-5 text-[#C00253] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#201923] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                Súmate a una iniciativa
              </h2>
            </div>
            <Link
              href="/iniciativas"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#FF91BA] transition hover:text-white"
            >
              Ver todas las iniciativas
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {ACTIVE_INITIATIVES.map((initiative) => (
              <Link
                key={initiative.slug}
                href={`/iniciativas#${initiative.slug}`}
                className="group rounded-[2rem] border border-white/15 bg-white/5 p-7 transition hover:border-[#F6026B]/60 hover:bg-white/10 sm:p-8"
              >
                <span className="text-3xl">{initiative.emoji}</span>
                <h3 className="mt-5 text-2xl font-black leading-tight text-white">
                  {initiative.name}
                </h3>
                <p className="mt-1 text-sm font-bold text-[#FF91BA]">
                  {initiative.tagline}
                </p>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">
                  {initiative.description[0]}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#FF91BA] transition group-hover:text-white">
                  Sumarme
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FFE6F0] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Illustration
            src="/ilustraciones/ratoncitos-cosiendo.png"
            alt="Ilustración de ratoncitos cosiendo juntos"
            className="h-24 w-auto object-contain sm:h-28"
          />
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
            Si eres aliado, voluntario, empresa o profesional del sector moda, puedes formar parte de esta iniciativa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/registro"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#F6026B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C00253]"
            >
              Registrar aliado
            </Link>
            <Link
              href="/voluntarios"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-[#F6026B] ring-1 ring-[#F6026B] transition hover:bg-[#FFE6F0]"
            >
              Postularme como voluntario
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
