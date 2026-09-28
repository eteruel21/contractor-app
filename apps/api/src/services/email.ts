import nodemailer, { type Transporter } from "nodemailer";

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

export type EmailTransportHealth =
  | { ready: true }
  | {
      ready: false;
      reason: "not_configured" | "verification_failed";
    };

type EmailEnvironment = typeof env & {
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
  EMAIL_WEB_BASE_URL?: string;
};

type SmtpConfiguration = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  replyTo?: string;
};

type TransactionalMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type TransactionalTemplate = {
  title: string;
  preheader: string;
  heading: string;
  greeting: string;
  introduction: string;
  webLink: string;
  webAction: string;
  deepLink: string;
  deepLinkAction: string;
  expiration: string;
  securityNotice: string;
  code?: string;
  codeLabel?: string;
};

const emailEnvironment = env as EmailEnvironment;

const DEVELOPMENT_WEB_BASE_URL = "https://app.leurettech.com";
const SMTP_CONNECTION_TIMEOUT_MS = 10_000;
const SMTP_GREETING_TIMEOUT_MS = 10_000;
const SMTP_SOCKET_TIMEOUT_MS = 30_000;
const SMTP_DNS_TIMEOUT_MS = 10_000;

let cachedTransport:
  | {
      configuration: SmtpConfiguration;
      transporter: Transporter;
    }
  | undefined;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeOptionalValue(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function resolveSmtpConfiguration(): SmtpConfiguration | null {
  const host = normalizeOptionalValue(emailEnvironment.SMTP_HOST);
  const user = normalizeOptionalValue(emailEnvironment.SMTP_USER);
  const pass = emailEnvironment.SMTP_PASS;
  const from = normalizeOptionalValue(emailEnvironment.EMAIL_FROM);
  const replyTo = normalizeOptionalValue(emailEnvironment.EMAIL_REPLY_TO);
  const port = emailEnvironment.SMTP_PORT ?? 587;

  if (!host || !user || !pass || !from) {
    return null;
  }

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    return null;
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    ...(replyTo ? { replyTo } : {})
  };
}

function smtpConfigurationsMatch(
  first: SmtpConfiguration,
  second: SmtpConfiguration
): boolean {
  return (
    first.host === second.host &&
    first.port === second.port &&
    first.user === second.user &&
    first.pass === second.pass &&
    first.from === second.from &&
    first.replyTo === second.replyTo
  );
}

function getEmailTransporter():
  | {
      configuration: SmtpConfiguration;
      transporter: Transporter;
    }
  | null {
  const configuration = resolveSmtpConfiguration();

  if (!configuration) {
    return null;
  }

  if (
    cachedTransport &&
    smtpConfigurationsMatch(cachedTransport.configuration, configuration)
  ) {
    return cachedTransport;
  }

  const secure = configuration.port === 465;
  const transporter = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure,
    requireTLS: !secure,
    auth: {
      user: configuration.user,
      pass: configuration.pass
    },
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
    dnsTimeout: SMTP_DNS_TIMEOUT_MS,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true
    },
    logger: false,
    debug: false
  });

  cachedTransport = { configuration, transporter };
  return cachedTransport;
}

function resolveWebBaseUrl(): string | null {
  const configured = normalizeOptionalValue(emailEnvironment.EMAIL_WEB_BASE_URL);
  const rawBaseUrl =
    configured ??
    (emailEnvironment.NODE_ENV === "development" || emailEnvironment.NODE_ENV === "test"
      ? DEVELOPMENT_WEB_BASE_URL
      : undefined);

  if (!rawBaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(rawBaseUrl);

    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    ) {
      return null;
    }

    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function buildWebLink(route: string, token: string): string {
  const baseUrl = resolveWebBaseUrl();

  if (!baseUrl) {
    throw new Error("La URL web de correos no está configurada correctamente.");
  }

  return `${baseUrl}/${route}?token=${encodeURIComponent(token)}`;
}

async function deliverWithSmtp({
  to,
  subject,
  text,
  html
}: TransactionalMessage): Promise<EmailDeliveryResult> {
  const transport = getEmailTransporter();

  if (!transport) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const delivery = await transport.transporter.sendMail({
      from: transport.configuration.from,
      to,
      ...(transport.configuration.replyTo
        ? { replyTo: transport.configuration.replyTo }
        : {}),
      subject,
      text,
      html,
      disableFileAccess: true,
      disableUrlAccess: true
    });

    if (Array.isArray(delivery.rejected) && delivery.rejected.length > 0) {
      return { sent: false, reason: "delivery_failed" };
    }

    return { sent: true };
  } catch {
    return { sent: false, reason: "delivery_failed" };
  }
}

export async function verifyEmailTransport(): Promise<EmailTransportHealth> {
  const transport = getEmailTransporter();

  if (!transport) {
    return { ready: false, reason: "not_configured" };
  }

  try {
    await transport.transporter.verify();
    return { ready: true };
  } catch {
    return { ready: false, reason: "verification_failed" };
  }
}

export function resetEmailTransportForTests(): void {
  if (emailEnvironment.NODE_ENV !== "test") {
    return;
  }

  cachedTransport = undefined;
}

export function buildVerificationLinks(token: string) {
  const deepLink = `contractorpro://confirm-email?token=${encodeURIComponent(token)}`;
  const webLink = buildWebLink("confirm-email", token);
  return { deepLink, webLink };
}

export function buildPasswordResetLinks(token: string) {
  const deepLink = `contractorpro://reset-password?token=${encodeURIComponent(token)}`;
  const webLink = buildWebLink("reset-password", token);
  return { deepLink, webLink };
}

function renderTransactionalEmail(template: TransactionalTemplate): string {
  const codeBlock =
    template.code && template.codeLabel
      ? `
              <p style="margin:0 0 8px; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px; color:#475569;">
                ${escapeHtml(template.codeLabel)}
              </p>
              <div style="margin:0 0 24px; padding:14px 16px; border-radius:10px; background-color:#f1f5f9; font-family:'Courier New', Courier, monospace; font-size:18px; line-height:26px; letter-spacing:1px; text-align:center; color:#0f172a; word-break:break-all;">
                ${escapeHtml(template.code)}
              </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="es" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(template.title)}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9;">
  <table lang="es" dir="ltr" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%; background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; mso-hide:all;">
          ${escapeHtml(template.preheader)}
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%; max-width:600px; background-color:#ffffff; border:1px solid #cbd5e1; border-radius:16px;">
          <tr>
            <td bgcolor="#0f172a" style="background-color:#0f172a; padding:26px 32px; border-radius:16px 16px 0 0;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:22px; line-height:28px; font-weight:700; color:#ffffff;">
                Contractor Pro
              </p>
              <p style="margin:6px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px; color:#cbd5e1;">
                Seguridad de tu cuenta
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="margin:0 0 20px; font-family:Arial, Helvetica, sans-serif; font-size:26px; line-height:34px; font-weight:700; color:#0f172a;">
                ${escapeHtml(template.heading)}
              </h1>
              <p style="margin:0 0 14px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:24px; color:#334155;">
                ${escapeHtml(template.greeting)}
              </p>
              <p style="margin:0 0 26px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:24px; color:#334155;">
                ${escapeHtml(template.introduction)}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td align="center" style="padding:4px 0 24px;">
                    <a href="${escapeHtml(template.webLink)}" style="display:inline-block; min-width:220px; background-color:#1d4ed8; border-radius:10px; padding:14px 28px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:20px; font-weight:700; color:#ffffff; text-decoration:none; text-align:center;">
                      ${escapeHtml(template.webAction)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px; color:#475569;">
                ¿Estás usando Contractor Pro desde tu teléfono?
              </p>
              <p style="margin:0 0 24px; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px;">
                <a href="${escapeHtml(template.deepLink)}" style="font-weight:600; color:#1d4ed8; text-decoration:underline;">
                  ${escapeHtml(template.deepLinkAction)}
                </a>
              </p>${codeBlock}
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:24px;">
                <tr>
                  <td bgcolor="#eff6ff" style="background-color:#eff6ff; border-radius:10px; padding:16px 18px;">
                    <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px; color:#1e3a8a;">
                      <strong>Importante:</strong> ${escapeHtml(template.expiration)}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px; color:#475569;">
                ${escapeHtml(template.securityNotice)}
              </p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-top:1px solid #cbd5e1; padding:20px 32px; border-radius:0 0 16px 16px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:19px; text-align:center; color:#475569;">
                Contractor Pro · LEURET TECH<br>
                Responde a este mensaje si necesitas ayuda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail({
  to,
  fullName,
  token
}: VerificationEmailInput): Promise<EmailDeliveryResult> {
  let deepLink: string;
  let webLink: string;

  try {
    ({ deepLink, webLink } = buildVerificationLinks(token));
  } catch {
    return { sent: false, reason: "not_configured" };
  }

  const name = fullName?.trim() || "Usuario";
  const subject = "Verifica tu correo | Contractor Pro";
  const html = renderTransactionalEmail({
    title: subject,
    preheader: "Confirma tu correo; el enlace vence en 24 horas.",
    heading: "Confirma tu correo electrónico",
    greeting: `Hola, ${name}:`,
    introduction:
      "Gracias por registrarte. Confirma tu correo para activar tu cuenta de Contractor Pro.",
    webLink,
    webAction: "Confirmar mi correo",
    deepLink,
    deepLinkAction: "Confirmar correo en la aplicación móvil",
    code: token,
    codeLabel: "También puedes copiar este código en la aplicación:",
    expiration: "este enlace y el código vencen en 24 horas y solamente pueden utilizarse una vez.",
    securityNotice:
      "Si no creaste esta cuenta, ignora este mensaje. No es necesario realizar ninguna acción."
  });

  const text = `
Hola, ${name}:

Gracias por registrarte. Confirma tu correo para activar tu cuenta de Contractor Pro.

Confirmar mi correo:
${webLink}

Abrir en la aplicación móvil:
${deepLink}

Código de verificación: ${token}

Este enlace y el código vencen en 24 horas y solamente pueden utilizarse una vez.

Si no creaste esta cuenta, ignora este mensaje. No es necesario realizar ninguna acción.

Contractor Pro · LEURET TECH
  `.trim();

  return deliverWithSmtp({ to, subject, text, html });
}

export async function sendPasswordResetEmail({
  to,
  fullName,
  token
}: PasswordResetEmailInput): Promise<EmailDeliveryResult> {
  let deepLink: string;
  let webLink: string;

  try {
    ({ deepLink, webLink } = buildPasswordResetLinks(token));
  } catch {
    return { sent: false, reason: "not_configured" };
  }

  const name = fullName?.trim() || "Usuario";
  const subject = "Restablece tu contraseña | Contractor Pro";
  const html = renderTransactionalEmail({
    title: subject,
    preheader: "Usa este enlace seguro dentro de la próxima hora.",
    heading: "Restablece tu contraseña",
    greeting: `Hola, ${name}:`,
    introduction:
      "Recibimos una solicitud para cambiar la contraseña de tu cuenta de Contractor Pro.",
    webLink,
    webAction: "Crear una nueva contraseña",
    deepLink,
    deepLinkAction: "Restablecer contraseña en la aplicación móvil",
    expiration: "este enlace vence en 1 hora y solamente puede utilizarse una vez.",
    securityNotice:
      "Si no solicitaste este cambio, ignora este mensaje. Tu contraseña actual seguirá funcionando."
  });

  const text = `
Hola, ${name}:

Recibimos una solicitud para cambiar la contraseña de tu cuenta de Contractor Pro.

Crear una nueva contraseña:
${webLink}

Abrir en la aplicación móvil:
${deepLink}

Este enlace vence en 1 hora y solamente puede utilizarse una vez.

Si no solicitaste este cambio, ignora este mensaje. Tu contraseña actual seguirá funcionando.

Contractor Pro · LEURET TECH
  `.trim();

  return deliverWithSmtp({ to, subject, text, html });
}
