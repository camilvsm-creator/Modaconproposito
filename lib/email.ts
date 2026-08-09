import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Moda con Propósito <no-reply@modaconproposito.com>";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendAccessEmail({
  email,
  recipientName,
  entityName,
  activationLink,
  accessType,
}: {
  email: string;
  recipientName: string;
  entityName: string;
  activationLink: string;
  accessType: "aliado" | "solicitante";
}) {
  if (!resend) return { error: "Falta configurar RESEND_API_KEY." };

  const safeRecipientName = escapeHtml(recipientName);
  const safeEntityName = escapeHtml(entityName);
  const safeActivationLink = escapeHtml(activationLink);
  const accessLabel = accessType === "aliado" ? "aliado" : "solicitante";

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Activa tu acceso de ${accessLabel} — Moda con Propósito`,
      text: `Hola ${recipientName}. Se generó un acceso de ${accessLabel} para ${entityName}. Actívalo y define tu contraseña desde este enlace: ${activationLink}. El enlace vence en 7 días.`,
      html: `
<div style="margin:0;background:#ffffff;padding:32px 16px;font-family:Arial,sans-serif;color:#1f1a17;">
  <div style="max-width:560px;margin:0 auto;">
    <p style="margin:0 0 24px;color:#ff0b55;font-size:18px;font-weight:700;">Moda con Propósito</p>
    <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;">Activa tu acceso</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hola <strong>${safeRecipientName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Se generó un acceso de ${accessLabel} para <strong>${safeEntityName}</strong>. Usa el siguiente enlace para activar tu cuenta y definir tu contraseña.</p>
    <p style="margin:0 0 24px;"><a href="${safeActivationLink}" style="display:inline-block;background:#ff0b55;color:#ffffff;padding:12px 20px;text-decoration:none;font-size:16px;font-weight:700;">Activar mi acceso</a></p>
    <p style="margin:0 0 8px;color:#666666;font-size:14px;line-height:1.5;">Si el botón no funciona, copia este enlace:</p>
    <p style="margin:0 0 24px;color:#666666;font-size:14px;line-height:1.5;word-break:break-all;">${safeActivationLink}</p>
    <p style="margin:0;color:#666666;font-size:14px;line-height:1.5;">El enlace vence en 7 días. Si no solicitaste este acceso, puedes ignorar el mensaje.</p>
  </div>
</div>`,
    });

    if (error) console.error("Error sending access email:", error);
    return { error: error?.message ?? null };
  } catch (error) {
    console.error("Error sending access email:", error);
    return { error: "No se pudo conectar con el servicio de correo." };
  }
}

export function sendWorkshopActivationEmail(email: string, responsibleName: string, activationLink: string, allyName = "tu aliado") {
  return sendAccessEmail({ email, recipientName: responsibleName, entityName: allyName, activationLink, accessType: "aliado" });
}

export function sendAidRequesterActivationEmail(email: string, contactName: string, activationLink: string, requesterName: string) {
  return sendAccessEmail({ email, recipientName: contactName, entityName: requesterName, activationLink, accessType: "solicitante" });
}

export async function sendMensajeNotification(
  contenido: string,
  emisor: "aliado" | "admin",
  tallerEmail?: string,
  tallerNombre?: string,
) {
  const destino = emisor === "aliado"
    ? process.env.PROMODA_EMAIL!
    : tallerEmail!;

  const subject = emisor === "aliado"
    ? `Mensaje de ${tallerNombre ?? "tu aliado"} — Moda con Propósito`
    : "Nuevo mensaje de Moda con Propósito";

  if (!resend) return { error: "Falta configurar RESEND_API_KEY." };

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: destino,
    subject,
    text: contenido,
  });

  if (error) {
    console.error("Error sending message notification:", error);
  }

  return { error: error?.message ?? null };
}
