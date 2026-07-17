import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Promoda <no-reply@promoda.org>";

export async function sendWorkshopActivationEmail(email: string, responsibleName: string, activationLink: string) {
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Tu aliado fue aprobado — Activa tu cuenta",
    html: `
<table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FBF7F3; padding: 40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="background-color: #FF0B55; padding: 28px 24px; text-align: center;">
            <h1 style="color: #FFFFFF; font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; margin: 0; padding: 0;">Promoda Aliados</h1>
            <p style="color: #FFE4EC; font-family: Arial, sans-serif; font-size: 14px; margin: 8px 0 0 0;">Red de aliados textiles</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 28px;">
            <p style="color: #1F1A17; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">Hola <strong>${responsibleName}</strong>,</p>
            <p style="color: #1F1A17; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">Tu aliado fue aprobado. Haz clic en el botón para activar tu cuenta y definir tu contraseña:</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
              <tr>
                <td style="background-color: #FF0B55; border-radius: 8px; text-align: center;">
                  <a href="${activationLink}" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.02em;">Activar mi acceso</a>
                </td>
              </tr>
            </table>
            <p style="color: #888; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; margin: 0 0 8px 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="color: #999; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.5; word-break: break-all; margin: 0;">${activationLink}</p>
          </td>
        </tr>
        <tr>
          <td style="border-top: 1px solid #EAECF0; padding: 20px 28px; text-align: center;">
            <p style="color: #999; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.5; margin: 0;">Equipo Promoda</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
    `,
  });

  if (error) {
    console.error("Error sending workshop activation email:", error);
  }

  return { error: error?.message ?? null };
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
    ? `Mensaje de ${tallerNombre ?? "tu aliado"} — Promoda`
    : "Nuevo mensaje de Promoda";

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
