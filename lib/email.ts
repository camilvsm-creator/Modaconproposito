import { Resend } from "resend";

import { getSiteUrl } from "@/lib/site-url";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

export async function sendInspectorCredentials(email: string, password: string, fullName: string) {
  const loginUrl = `${getSiteUrl()}/admin`;

  const { error } = await resend.emails.send({
    from: "Afectados Terremoto Venezuela <admin@afectadosterremoto.com>",
    to: email,
    subject: "Acceso al panel de operaciones",
    html: `
      <p>Hola <strong>${fullName}</strong>,</p>
      <p>Se ha creado tu cuenta de inspector en la plataforma.</p>
      <p><strong>Enlace:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><strong>Usuario:</strong> ${email}</p>
      <p><strong>Contraseña:</strong> ${password}</p>
      <br>
      <p style="color: #888; font-size: 13px;">Afectados Terremoto Venezuela</p>
    `,
  });

  if (error) {
    console.error("Error sending inspector creation email:", error);
  }

  return { error: error?.message ?? null };
}

export async function sendInspectorActivationLink(email: string, fullName: string, activationLink: string) {
  const { error } = await resend.emails.send({
    from: "Afectados Terremoto Venezuela <admin@afectadosterremoto.com>",
    to: email,
    subject: "Tu enlace de activación — Afectados Terremoto Venezuela",
    html: `
<table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FBF7F3; padding: 40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="background-color: #B42318; padding: 28px 24px; text-align: center;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; display: block; margin: 0 auto;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <h1 style="color: #FFFFFF; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 18px; font-weight: 700; margin: 10px 0 0 0; padding: 0;">Afectados Terremoto Venezuela</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 28px;">
            <p style="color: #1F1A17; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">Hola <strong>${fullName}</strong>,</p>
            <p style="color: #1F1A17; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">Tu postulación como inspector fue aprobada. Haz clic en el botón para activar tu cuenta y definir tu contraseña:</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
              <tr>
                <td style="background-color: #B42318; border-radius: 8px; text-align: center;">
                  <a href="${activationLink}" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.02em;">Activar mi cuenta</a>
                </td>
              </tr>
            </table>
            <p style="color: #888; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.5; margin: 0 0 8px 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="color: #999; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; word-break: break-all; margin: 0;">${activationLink}</p>
          </td>
        </tr>
        <tr>
          <td style="border-top: 1px solid #EAECF0; padding: 20px 28px; text-align: center;">
            <p style="color: #999; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; margin: 0;">&mdash; Equipo Afectados Terremoto Venezuela</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
    `,
  });

  if (error) {
    console.error("Error sending activation link email:", error);
  }

  return { error: error?.message ?? null };
}

export async function sendWorkshopActivationEmail(email: string, responsibleName: string, activationLink: string) {
  const { error } = await resend.emails.send({
    from: "Afectados Terremoto Venezuela <admin@afectadosterremoto.com>",
    to: email,
    subject: "Tu taller fue aprobado — Activa tu cuenta",
    html: `
<table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FBF7F3; padding: 40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="background-color: #B42318; padding: 28px 24px; text-align: center;">
            <h1 style="color: #FFFFFF; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 18px; font-weight: 700; margin: 0; padding: 0;">Red de Talleres Voluntarios</h1>
            <p style="color: #FEF3F2; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; margin: 8px 0 0 0;">Afectados Terremoto Venezuela</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 28px;">
            <p style="color: #1F1A17; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">Hola <strong>${responsibleName}</strong>,</p>
            <p style="color: #1F1A17; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">Tu taller fue aprobado. Haz clic en el botón para activar tu cuenta y definir tu contraseña:</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
              <tr>
                <td style="background-color: #B42318; border-radius: 8px; text-align: center;">
                  <a href="${activationLink}" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.02em;">Activar mi taller</a>
                </td>
              </tr>
            </table>
            <p style="color: #888; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.5; margin: 0 0 8px 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="color: #999; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; word-break: break-all; margin: 0;">${activationLink}</p>
          </td>
        </tr>
        <tr>
          <td style="border-top: 1px solid #EAECF0; padding: 20px 28px; text-align: center;">
            <p style="color: #999; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; margin: 0;">&mdash; Equipo Afectados Terremoto Venezuela</p>
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

export async function sendInspectionAssignmentEmail(
  inspectorEmail: string,
  inspectorName: string,
  inspectionUrl: string,
  requestCode: string,
) {
  const { error } = await resend.emails.send({
    from: "Afectados Terremoto Venezuela <admin@afectadosterremoto.com>",
    to: inspectorEmail,
    subject: `Inspección asignada — ${requestCode}`,
    html: `
<table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FBF7F3; padding: 40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="background-color: #B42318; padding: 28px 24px; text-align: center;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; display: block; margin: 0 auto;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <h1 style="color: #FFFFFF; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 18px; font-weight: 700; margin: 10px 0 0 0; padding: 0;">Afectados Terremoto Venezuela</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 28px;">
            <p style="color: #1F1A17; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">Hola <strong>${inspectorName}</strong>,</p>
            <p style="color: #1F1A17; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 8px 0;">Te han asignado la inspección <strong>${requestCode}</strong>.</p>
            <p style="color: #1F1A17; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">Haz clic en el botón para revisar los detalles y comenzar la evaluación:</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
              <tr>
                <td style="background-color: #B42318; border-radius: 8px; text-align: center;">
                  <a href="${inspectionUrl}" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.02em;">Ver inspección</a>
                </td>
              </tr>
            </table>
            <p style="color: #888; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.5; margin: 0 0 8px 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="color: #999; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; word-break: break-all; margin: 0;">${inspectionUrl}</p>
          </td>
        </tr>
        <tr>
          <td style="border-top: 1px solid #EAECF0; padding: 20px 28px; text-align: center;">
            <p style="color: #999; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; margin: 0;">&mdash; Equipo Afectados Terremoto Venezuela</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
    `,
  });

  if (error) {
    console.error("Error sending inspection assignment email:", error);
  }

  return { error: error?.message ?? null };
}

export async function sendMensajeNotification(
  contenido: string,
  emisor: "taller" | "admin",
  tallerEmail?: string,
  tallerNombre?: string,
) {
  const destino = emisor === "taller"
    ? process.env.PROMODA_EMAIL!
    : tallerEmail!;

  const subject = emisor === "taller"
    ? `✉️ Mensaje de ${tallerNombre ?? "tu taller"} — Promoda`
    : "✉️ Nuevo mensaje de Promoda";

  const { error } = await resend.emails.send({
    from: "Promoda <promoda@afectadosterremoto.com>",
    to: destino,
    subject,
    text: contenido,
  });

  if (error) {
    console.error("Error sending message notification:", error);
  }

  return { error: error?.message ?? null };
}

export async function sendInspectionReportEmail(
  applicantEmail: string,
  applicantName: string,
  requestCode: string,
  htmlContent: string,
  summary: string,
) {
  const trimmedSummary = summary?.trim()
    ? `Resumen: ${summary}`
    : "Informe preliminar de observación remota.";

  const { error } = await resend.emails.send({
    from: "Afectados Terremoto Venezuela <admin@afectadosterremoto.com>",
    to: applicantEmail,
    subject: `Informe preliminar — ${requestCode}`,
    html: `
<table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FBF7F3; padding: 40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="background-color: #1c1917; padding: 28px 24px; text-align: center;">
            <h1 style="color: #FFFFFF; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 17px; font-weight: 700; margin: 0; padding: 0;">Afectados Terremoto Venezuela</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 24px;">
            <p style="color: #1F1A17; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Hola <strong>${applicantName}</strong>,</p>
            <p style="color: #1F1A17; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Adjuntamos el informe preliminar de observación remota correspondiente a tu solicitud <strong>${requestCode}</strong>.</p>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="color: #166534; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.6; margin: 0;">
                <strong>Importante:</strong> Esta es una observación preliminar basada en fotos y videos. <strong>No es un dictamen oficial</strong> ni una certificación de habitabilidad. La evaluación definitiva requiere inspección presencial por profesionales competentes.
              </p>
            </div>

            <p style="color: #57534E; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.7; margin: 0 0 8px 0;">${trimmedSummary}</p>

            <p style="color: #57534E; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.7; margin: 16px 0 8px 0;">
              Puedes consultar el estado de tu solicitud en <strong>afectadosterremoto.com/consulta-inspeccion</strong> usando tu código <strong>${requestCode}</strong> y el correo con el que hiciste la solicitud.
            </p>
          </td>
        </tr>
        <tr>
          <td style="border-top: 1px solid #EAECF0; padding: 20px 24px; text-align: center;">
            <p style="color: #999; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; margin: 0;">&mdash; Equipo Afectados Terremoto Venezuela</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
    `,
  });

  if (error) {
    console.error("Error sending inspection report email:", error);
  }

  return { error: error?.message ?? null };
}
