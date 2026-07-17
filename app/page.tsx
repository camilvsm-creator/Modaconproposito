import Link from "next/link";
import type { Metadata } from "next";

import { SectionCard } from "@/components/ui";
import { ALLY_CATEGORY_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Promoda — Red de Aliados Verificados",
};

export default function NuestraMisionPage() {
  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
              Aliados Verificados
            </p>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
              Nuestra misión
            </h1>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-ink">
              Una red solidaria para impulsar la recuperación del sector textil venezolano
            </h2>
            <div className="space-y-4 text-sm leading-6 text-stone-700">
              <p>
                Esta iniciativa nace para conectar a aliados textiles, escuelas y academias de confección,
                costureros, diseñadores, patronistas, docentes, estudiantes y
                voluntarios con un propósito común: apoyar a las comunidades
                afectadas por el terremoto ocurrido en Venezuela el 24 de junio
                de 2026.
              </p>
              <p>
                Desde nuestra experiencia dentro del sector moda, identificamos
                una forma de aportar: unir la capacidad productiva de aliados
                e institutos a nivel nacional para confeccionar artículos textiles
                necesarios como ropa interior, sábanas, toallas y otros productos
                esenciales que muchas veces no forman parte de las donaciones
                tradicionales.
              </p>
              <p>
                A través de esta plataforma creamos una red colaborativa que
                conecta aliados, voluntarios y colaboradores para transformar
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
                <h3 className="font-black text-[#F74897]">Aliados verificados</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Las academias, talleres, escuelas y otros aliados pueden registrarse para formar parte de la red,
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
              Categorías de aliados
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(ALLY_CATEGORY_LABELS).map(([value, label]) => (
                <SectionCard key={value} className="p-5">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">Aliados que pueden sumarse a tareas, producción y apoyo textil coordinado por Promoda.</p>
                </SectionCard>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-ink">
              Nuestro objetivo
            </h2>
            <p className="text-sm leading-6 text-stone-700">
              Crear una red organizada que permita activar el talento y la
              capacidad del sector textil venezolano para responder ante
              situaciones de emergencia y fortalecer los aliados participantes
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
              Un bolso preparado con cariño para personas afectadas por el
              terremoto. Podés sumarte donando materiales, haciendo un aporte
              económico o participando como voluntario.
            </p>
            <div className="max-w-2xl text-left text-sm leading-6 text-stone-700">
              <p className="font-bold text-ink">¿Qué lleva la cartuchera?</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Ropa interior nueva</li>
                <li>Maquillaje y labiales nuevos</li>
                <li>Productos de higiene personal</li>
                <li>Una carta escrita a mano</li>
              </ul>
              <p className="mt-4 font-bold text-ink">¿Qué puedes donar?</p>
              <p className="mt-2 font-bold text-stone-600">Neceseres:</p>
              <ul className="list-disc pl-5">
                <li>Tela: Vinil espejo estampado</li>
                <li>Agujas número 14 punta de bola</li>
                <li>Cierre de chaqueta de 40cm color rosa</li>
              </ul>
              <p className="mt-3 font-bold text-stone-600">Pantis o boxers:</p>
              <ul className="list-disc pl-5">
                <li>Sesgo elástico tamaño mediano (blanco o rosa)</li>
                <li>Elástica ancha para boxer</li>
                <li>Telas: franela pijamera, microdurazno est, microdurazno heavy</li>
              </ul>
            </div>
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
              Si eres aliado, voluntario, empresa o profesional del sector
              moda, puedes formar parte de esta iniciativa.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/registro"
                className="rounded-full bg-[#F74897] px-6 py-3 text-sm font-bold text-white hover:bg-[#D6003F]"
              >
                Registrar aliado
              </Link>
              <Link
                href="/voluntarios"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#F74897] ring-1 ring-[#F74897] hover:bg-[#FFE4EC]"
              >
                Postularme como voluntario
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
