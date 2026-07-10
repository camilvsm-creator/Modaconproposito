import Link from "next/link";

import { SectionCard } from "@/components/ui";

export default function NuestraMisionPage() {
  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
              Red de Talleres Verificados
            </p>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
              Nuestra misión
            </h1>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-ink">
              Una red solidaria para impulsar la recuperación del sector textil venezolano
            </h2>
            <div className="space-y-4 text-sm leading-6 text-stone-700">
              <p>
                Esta iniciativa nace para conectar a talleres de confección,
                costureros, diseñadores, patronistas, docentes, estudiantes y
                voluntarios con un propósito común: apoyar a las comunidades
                afectadas por el terremoto ocurrido en Venezuela el 24 de junio
                de 2026.
              </p>
              <p>
                Desde nuestra experiencia dentro del sector moda, identificamos
                una forma de aportar: unir la capacidad productiva de talleres
                a nivel nacional para confeccionar artículos textiles necesarios
                como ropa interior, sábanas, toallas y otros productos esenciales
                que muchas veces no forman parte de las donaciones tradicionales.
              </p>
              <p>
                A través de esta plataforma creamos una red colaborativa que
                conecta talleres, voluntarios y aliados para transformar
                conocimientos, manos de trabajo y materiales en soluciones
                concretas. Los productos elaborados serán entregados mediante
                las entidades correspondientes, buscando garantizar que lleguen
                a quienes más los necesitan.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-ink">
              ¿Cómo funciona?
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <SectionCard className="flex flex-col p-5">
                <h3 className="font-black text-[#F74897]">Talleres verificados</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Los talleres pueden registrarse para formar parte de la red,
                  compartir su capacidad de producción y participar en la
                  confección de productos textiles destinados a apoyar a las
                  comunidades afectadas.
                </p>
              </SectionCard>
              <SectionCard className="flex flex-col p-5">
                <h3 className="font-black text-[#F74897]">Voluntarios</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Personas con conocimientos en confección, patronaje, diseño,
                  corte, costura, logística u otras áreas pueden sumarse para
                  apoyar los procesos que requieran colaboración.
                </p>
              </SectionCard>
              <SectionCard className="flex flex-col p-5">
                <h3 className="font-black text-[#F74897]">Aliados y colaboradores</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Empresas, organizaciones e instituciones pueden aportar
                  materiales textiles como telas, cierres, hilos, elásticos u
                  otros insumos necesarios para la producción.
                </p>
              </SectionCard>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-ink">
              Nuestro objetivo
            </h2>
            <p className="text-sm leading-6 text-stone-700">
              Crear una red organizada que permita activar el talento y la
              capacidad del sector textil venezolano para responder ante
              situaciones de emergencia, fortalecer los talleres participantes
              y generar un impacto real en las comunidades.
            </p>
            <p className="text-sm leading-6 text-stone-700">
              Cada registro suma una nueva oportunidad para ayudar.
            </p>
          </section>

          <SectionCard className="flex flex-col items-center gap-4 bg-[#FFE4EC] p-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
              Tu Cartera, Mi Refugio
            </p>
            <p className="max-w-2xl text-sm leading-6 text-stone-700">
              Un bolso preparado con cariño que entrega ropa interior nueva,
              productos de higiene, artículos de cuidado personal y una carta
              escrita a mano. Podés sumarte donando insumos, materiales,
              haciendo un aporte económico o participando como voluntario.
            </p>
              <Link
                href="/adopta-una-cartuchera"
                className="rounded-full bg-[#F74897] px-6 py-3 text-sm font-bold text-white hover:bg-[#D6003F]"
              >
                Quiero sumarme
              </Link>
          </SectionCard>

          <SectionCard className="flex flex-col items-center gap-4 bg-[#FFE4EC] p-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
              Únete
            </p>
            <p className="max-w-2xl text-sm leading-6 text-stone-700">
              Si eres taller, voluntario, empresa o profesional del sector
              moda, puedes formar parte de esta iniciativa.
            </p>
              <Link
                href="/registro"
                className="rounded-full bg-[#F74897] px-6 py-3 text-sm font-bold text-white hover:bg-[#D6003F]"
              >
                Ofrecer mi taller
              </Link>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
