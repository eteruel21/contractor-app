import { env } from "../config/env.js";

type VerificationEmailInput = {
  to: string;
  fullName?: string | null;
  token: string;
};

type PasswordResetEmailInput = {
  to: string;
  fullName?: string | null;
  token: string;
};

export type EmailDeliveryResult =
  | { sent: true }
  | {
      sent: false;
      reason: "not_configured" | "delivery_failed";
    };

type ResendMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

async function deliverWithResend({
  to,
  subject,
  text,
  html
}: ResendMessage): Promise<EmailDeliveryResult> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [to],
        subject,
        text,
        html
      })
    });

    if (!response.ok) {
      return { sent: false, reason: "delivery_failed" };
    }

    return { sent: true };
  } catch {
    return { sent: false, reason: "delivery_failed" };
  }
}

export function buildVerificationLinks(token: string) {
  const deepLink = `contractorpro://confirm-email?token=${encodeURIComponent(token)}`;
  const webLink = `https://app.leurettech.com/confirm-email?token=${encodeURIComponent(token)}`;
  return { deepLink, webLink };
}

export function buildPasswordResetLinks(token: string) {
  const deepLink = `contractorpro://reset-password?token=${encodeURIComponent(token)}`;
  const webLink = `https://app.leurettech.com/reset-password?token=${encodeURIComponent(token)}`;
  return { deepLink, webLink };
}

export async function sendVerificationEmail({ to, fullName, token }: VerificationEmailInput): Promise<EmailDeliveryResult> {
  const name = fullName?.trim() || "Usuario";
  const { deepLink, webLink } = buildVerificationLinks(token);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verifica tu cuenta - Contractor Pro</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; }
        .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: 700; color: #0f172a; text-decoration: none; }
        .title { font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 0; }
        .btn-primary { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 16px 0; text-align: center; }
        .btn-secondary { display: inline-block; background-color: #f1f5f9; color: #334155 !important; font-weight: 600; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 8px; text-align: center; }
        .code-box { background-color: #f1f5f9; font-family: monospace; font-size: 16px; padding: 12px; border-radius: 6px; text-align: center; letter-spacing: 2px; margin: 16px 0; word-break: break-all; }
        .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="brand">🏗️ Contractor Pro</span>
        </div>
        <h2 class="title">Verificación de Cuenta</h2>
        <p>Hola, <strong>${name}</strong>:</p>
        <p>Gracias por registrarte en Contractor Pro. Por favor, confirma tu correo electrónico para activar tu cuenta:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${deepLink}" class="btn-primary">Abrir en la App Móvil</a>
          <br />
          <a href="${webLink}" class="btn-secondary">Confirmar en Navegador Web</a>
        </div>

        <p>O copia tu token de verificación directamente en la aplicación:</p>
        <div class="code-box">${token}</div>

        <p class="footer">Si no creaste esta cuenta, puedes ignorar este mensaje.<br />© Contractor Pro</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hola ${name},

Gracias por registrarte en Contractor Pro. Confirma tu correo para activar tu cuenta.

Abrir en App Móvil:
${deepLink}

Abrir en Navegador Web:
${webLink}

Token de Verificación: ${token}
  `.trim();

  return deliverWithResend({
    to,
    subject: "Verifica tu cuenta - Contractor Pro",
    text,
    html
  });
}

export async function sendPasswordResetEmail({ to, token }: PasswordResetEmailInput): Promise<EmailDeliveryResult> {
  const { deepLink, webLink } = buildPasswordResetLinks(token);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Cambiar contraseña - Contractor Pro</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f7fb;">
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    role="presentation"
    style="width:100%; background-color:#f4f7fb;"
  >
    <tr>
      <td
        align="center"
        style="padding-top:40px; padding-right:16px; padding-bottom:40px; padding-left:16px;"
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          role="presentation"
          style="width:100%; max-width:600px; background-color:#ffffff; border:1px solid #e2e8f0; border-radius:16px;"
        >
          <tr>
            <td
              bgcolor="#0f172a"
              style="background-color:#0f172a; padding-top:26px; padding-right:32px; padding-bottom:26px; padding-left:32px;"
            >
              <p
                style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:22px; line-height:28px; font-weight:700; color:#ffffff;"
              >
                Contractor Pro
              </p>

              <p
                style="margin-top:6px; margin-right:0; margin-bottom:0; margin-left:0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px; color:#cbd5e1;"
              >
                Seguridad de tu cuenta
              </p>
            </td>
          </tr>

          <tr>
            <td
              style="padding-top:36px; padding-right:32px; padding-bottom:36px; padding-left:32px;"
            >
              <h1
                style="margin-top:0; margin-right:0; margin-bottom:20px; margin-left:0; font-family:Arial, Helvetica, sans-serif; font-size:26px; line-height:34px; font-weight:700; color:#0f172a;"
              >
                Cambia tu contraseña
              </h1>

              <p
                style="margin-top:0; margin-right:0; margin-bottom:14px; margin-left:0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:24px; color:#475569;"
              >
                Hola,
              </p>

              <p
                style="margin-top:0; margin-right:0; margin-bottom:26px; margin-left:0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:24px; color:#475569;"
              >
                Recibimos una solicitud para cambiar la contraseña de tu cuenta de Contractor Pro.
                Utiliza el siguiente botón para establecer una nueva contraseña.
              </p>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
              >
                <tr>
                  <td align="center" style="padding-top:4px; padding-bottom:28px;">
                    <a
                      href="${webLink}"
                      style="display:inline-block; background-color:#2563eb; border-radius:10px; padding-top:14px; padding-right:28px; padding-bottom:14px; padding-left:28px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:20px; font-weight:700; color:#ffffff; text-decoration:none;"
                    >
                      Cambiar mi contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <p
                style="margin-top:0; margin-right:0; margin-bottom:8px; margin-left:0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px; color:#64748b;"
              >
                ¿Estás usando Contractor Pro desde tu teléfono?
              </p>

              <p
                style="margin-top:0; margin-right:0; margin-bottom:26px; margin-left:0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px;"
              >
                <a
                  href="${deepLink}"
                  style="font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px; font-weight:600; color:#2563eb; text-decoration:none;"
                >
                  Abrir en la aplicación móvil
                </a>
              </p>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="margin-bottom:24px;"
              >
                <tr>
                  <td
                    bgcolor="#eff6ff"
                    style="background-color:#eff6ff; border-radius:10px; padding-top:16px; padding-right:18px; padding-bottom:16px; padding-left:18px;"
                  >
                    <p
                      style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:21px; color:#1e40af;"
                    >
                      <strong>Importante:</strong> este enlace vence en 1 hora y solamente puede utilizarse para restablecer tu contraseña.
                    </p>
                  </td>
                </tr>
              </table>

              <p
                style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:21px; color:#64748b;"
              >
                Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá funcionando.
              </p>
            </td>
          </tr>

          <tr>
            <td
              bgcolor="#f8fafc"
              style="background-color:#f8fafc; border-top:1px solid #e2e8f0; padding-top:20px; padding-right:32px; padding-bottom:20px; padding-left:32px;"
            >
              <p
                style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:19px; text-align:center; color:#94a3b8;"
              >
                © 2026 Contractor Pro · LEURET TECH
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Hola,

Recibimos una solicitud para cambiar la contraseña de tu cuenta de Contractor Pro.

Cambiar mi contraseña:
${webLink}

Abrir en la aplicación móvil:
${deepLink}

Este enlace vence en 1 hora.

Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá funcionando.

Contractor Pro
LEURET TECH
  `.trim();

  return deliverWithResend({
    to,
    subject: "Cambia tu contraseña | Contractor Pro",
    text,
    html
  });
}
