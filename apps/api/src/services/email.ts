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

export async function sendPasswordResetEmail({ to, fullName, token }: PasswordResetEmailInput): Promise<EmailDeliveryResult> {
  const name = fullName?.trim() || "Usuario";
  const { deepLink, webLink } = buildPasswordResetLinks(token);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Restablecimiento de Contraseña - Contractor Pro</title>
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
        <h2 class="title">Restablecer Contraseña</h2>
        <p>Hola, <strong>${name}</strong>:</p>
        <p>Has solicitado restablecer tu contraseña de acceso a Contractor Pro:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${deepLink}" class="btn-primary">Restablecer en App Móvil</a>
          <br />
          <a href="${webLink}" class="btn-secondary">Restablecer en Navegador Web</a>
        </div>

        <p>O ingresa este código de recuperación en la aplicación:</p>
        <div class="code-box">${token}</div>

        <p class="footer">Este enlace vence en 1 hora. Si no solicitaste este cambio, puedes ignorar este mensaje.<br />© Contractor Pro</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hola ${name},

Has solicitado restablecer tu contraseña de Contractor Pro.

Restablecer en App Móvil:
${deepLink}

Restablecer en Navegador Web:
${webLink}

Token de Recuperación: ${token}
  `.trim();

  return deliverWithResend({
    to,
    subject: "Restablecimiento de Contraseña - Contractor Pro",
    text,
    html
  });
}
