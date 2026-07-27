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
                Nuestro propósito central es conectar a la industria de la moda, escuelas de confección, costureros, diseñadores, patronistas, docentes y voluntarios en una red colaborativa nacional. Buscamos transformar conocimientos, mano de obra e insumos en artículos textiles esenciales para apoyar a las comunidades afectadas por el terremoto ocurrido el 24 de junio de 2026, mediante jornadas de voluntariado a largo plazo que no afecten la operatividad comercial habitual de los aliados.
              </p>
              <p>
                Desde nuestra experiencia dentro del sector moda, identificamos una necesidad crítica: la escasez de insumos textiles de primera necesidad (ropa interior, sábanas, toallas, bolsos de traslado e indumentaria básica) que frecuentemente quedan fuera de las donaciones tradicionales.
              </p>
              <p>
                A través de esta plataforma creamos una red colaborativa que conecta aliados y voluntarios para transformar materia prima y talento en soluciones concretas y dignas. Los productos elaborados serán entregados mediante las entidades correspondientes para garantizar que lleguen directamente a quienes más los necesitan.
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

          <section id="voluntariado" className="space-y-6">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl font-black tracking-[-0.02em] text-ink">
                ¿A quiénes buscamos como voluntarios?
              </h2>
              <p className="text-sm leading-6 text-stone-700 sm:text-base">
                Para construir una red sólida y sostenible, no solo necesitamos manos frente a las máquinas de coser, sino también talento en comunicación, logística y gestión. Buscamos perfiles comprometidos en las siguientes áreas:
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SectionCard className="p-5 ring-1 ring-stone-200/80">
                <h3 className="text-base font-black text-[#F74897]">Área Técnica y Académica</h3>
                <ul className="mt-4 space-y-4 text-sm leading-6 text-stone-700">
                  <li>
                    <strong className="font-bold text-ink">Academias y escuelas de moda y diseño:</strong>{" "}
                    Para sumar a sus comunidades estudiantiles y docentes en jornadas de práctica formativa con impacto social.
                  </li>
                  <li>
                    <strong className="font-bold text-ink">Voluntarios en costura:</strong>{" "}
                    Costureros, patronistas y confeccionistas para hacer equipo con las academias y escuelas.
                  </li>
                </ul>
              </SectionCard>

              <SectionCard className="p-5 ring-1 ring-stone-200/80">
                <h3 className="text-base font-black text-[#F74897]">Área de Comunicación y Medios</h3>
                <ul className="mt-4 space-y-4 text-sm leading-6 text-stone-700">
                  <li>
                    <strong className="font-bold text-ink">Creadores de contenido:</strong>{" "}
                    Para visibilizar las jornadas, contar las historias de los voluntarios y mantener informada a la comunidad.
                  </li>
                  <li>
                    <strong className="font-bold text-ink">Diseñadores gráficos:</strong>{" "}
                    Para la creación de material visual de campaña, fichas técnicas simplificadas, infografías e instructivos.
                  </li>
                </ul>
              </SectionCard>

              <SectionCard className="p-5 ring-1 ring-stone-200/80 md:col-span-2">
                <h3 className="text-base font-black text-[#F74897]">🚚 Área Operativa, Logística y Servicios</h3>
                <ul className="mt-4 grid gap-4 text-sm leading-6 text-stone-700 md:grid-cols-3 md:gap-5">
                  <li>
                    <strong className="font-bold text-ink">Atención de usuarios y coordinación de voluntariado:</strong>{" "}
                    Para gestionar las convocatorias, responder dudas de los aliados y hacer seguimiento a las entregas.
                  </li>
                  <li>
                    <strong className="font-bold text-ink">Distribución, envíos y transporte:</strong>{" "}
                    Aliados logísticos y conductores voluntarios para trasladar los kits precortados hacia los talleres y llevar el producto terminado al centro o refugio.
                  </li>
                  <li>
                    <strong className="font-bold text-ink">Papelería e impresión:</strong>{" "}
                    Imprentas o aliados que puedan donar o facilitar la impresión de etiquetas de talla, empaques, fichas técnicas y material informativo.
                  </li>
                </ul>
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
