"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Button, SectionCard } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import type { Mensaje } from "@/lib/types";
import { sendMensajeNotification } from "@/lib/email";
import { useWorkshop } from "@/app/admin/talleres/panel/workshop-context";

const mockMensajes: Mensaje[] = [
  {
    id: "1",
    de: "admin",
    contenido: "¡Bienvenidos al panel! Este es el centro de mensajes con Promoda. Por aquí coordinaremos todas las instrucciones y novedades.",
    fecha: "2026-07-08 10:00",
    leido: true,
  },
  {
    id: "2",
    de: "taller",
    contenido: "Gracias. Estamos listos para empezar con la producción de sábanas.",
    fecha: "2026-07-08 10:30",
    leido: true,
  },
  {
    id: "3",
    de: "admin",
    contenido: "Perfecto. Les confirmamos que el pedido de tela llegará este viernes.",
    fecha: "2026-07-08 11:00",
    leido: false,
  },
];

export default function MensajesPage() {
  const workshop = useWorkshop();
  const [mensajes, setMensajes] = useState<Mensaje[]>(mockMensajes);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [envioNotificacion, setEnvioNotificacion] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const contenido = nuevoMensaje.trim();
    if (!contenido) return;

    const msg: Mensaje = {
      id: String(Date.now()),
      de: "taller",
      contenido,
      fecha: new Date().toLocaleString("es-VE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      leido: false,
    };

    setMensajes((prev) => [...prev, msg]);
    setNuevoMensaje("");

    setEnvioNotificacion(true);
    await sendMensajeNotification(contenido, "taller", workshop?.email, workshop?.name);
    setTimeout(() => setEnvioNotificacion(false), 2000);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Mensajes"
        description="Centro de comunicación con Promoda. Los mensajes se notifican por correo."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Mensajes" }}
      />

      <SectionCard className="flex flex-col overflow-hidden p-0">
        {mensajes.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Sin mensajes"
              description="Envía tu primer mensaje al equipo de Promoda."
            />
          </div>
        ) : (
          <div className="flex max-h-96 flex-col gap-3 overflow-y-auto p-4">
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={"flex " + (msg.de === "taller" ? "justify-end" : "justify-start")}
              >
                <div
                  className={
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm " +
                    (msg.de === "taller"
                      ? "bg-[#F74897] text-white"
                      : "bg-stone-100 text-stone-800")
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>
                  <p
                    className={
                      "mt-1 text-sm " +
                      (msg.de === "taller" ? "text-white/70" : "text-stone-400")
                    }
                  >
                    {msg.fecha}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="border-t border-stone-200 p-4">
          {envioNotificacion && (
            <p className="mb-2 text-sm text-stone-500">
              Notificando al admin por correo...
            </p>
          )}
          <form onSubmit={enviar} className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
              placeholder="Escribe un mensaje..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
            />
            <Button type="submit" disabled={!nuevoMensaje.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SectionCard>
    </div>
  );
}
