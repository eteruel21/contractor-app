import nodemailer from "nodemailer";
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

function createTransporter() {
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
  }
  return null;
}

export function buildVerificationLinks(token: string) {
  const deepLink = `contractorpro://confirm-email?token=${encodeURIComponent(token)}`;
  const webLink = `https://contractor-pro-web.pages.dev/confirm-email?token=${encodeURIComponent(token)}`;
  return { deepLink, webLink };
}

export function buildPasswordResetLinks(token: string) {
  const deepLink = `contractorpro://reset-password?token=${encodeURIComponent(token)}`;
  const webLink = `https://contractor-pro-web.pages.dev/reset-password?token=${encodeURIComponent(token)}`;
  return { deepLink, webLink };
}

export async function sendVerificationEmail({ to, fullName, token }: VerificationEmailInput): Promise<{ sent: boolean }> {
  const name = fullName?.trim() || "Usuario";
  const { deepLink, webLink } = buildVerificationLinks(token);
  const sender = env.EMAIL_FROM || "no-reply@contractor.app";

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

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[EMAIL DEV LOG] Para: ${to} | Asunto: Verifica tu cuenta - Contractor Pro`);
    console.log(`[EMAIL DEV LOG] DeepLink: ${deepLink}`);
    console.log(`[EMAIL DEV LOG] WebLink: ${webLink}`);
    console.log(`[EMAIL DEV LOG] Token: ${token}`);
    return { sent: true };
  }

  try {
    await transporter.sendMail({
      from: sender,
      to,
      subject: "Verifica tu cuenta - Contractor Pro",
      text,
      html
    });
    return { sent: true };
  } catch (error) {
    console.error("Error enviando email de verificación:", error);
    return { sent: false };
  }
}

export async function sendPasswordResetEmail({ to, fullName, token }: PasswordResetEmailInput): Promise<{ sent: boolean }> {
  const name = fullName?.trim() || "Usuario";
  const { deepLink, webLink } = buildPasswordResetLinks(token);
  const sender = env.EMAIL_FROM || "no-reply@contractor.app";

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

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[EMAIL DEV LOG] Para: ${to} | Asunto: Restablecimiento de Contraseña - Contractor Pro`);
    console.log(`[EMAIL DEV LOG] DeepLink: ${deepLink}`);
    console.log(`[EMAIL DEV LOG] WebLink: ${webLink}`);
    console.log(`[EMAIL DEV LOG] Token: ${token}`);
    return { sent: true };
  }

  try {
    await transporter.sendMail({
      from: sender,
      to,
      subject: "Restablecimiento de Contraseña - Contractor Pro",
      text,
      html
    });
    return { sent: true };
  } catch (error) {
    console.error("Error enviando email de recuperación:", error);
    return { sent: false };
  }
}
