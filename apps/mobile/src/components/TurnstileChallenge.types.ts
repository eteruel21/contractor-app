export type TurnstileAction =
  | "register"
  | "login"
  | "recover_password"
  | "resend_verification";

export type TurnstileChallengeProps = {
  action: TurnstileAction;
  onToken: (token: string | null) => void;
  resetKey?: number;
};

const DEFAULT_CHALLENGE_URL =
  "https://contractor-pro-web.pages.dev/turnstile.html";

export function buildTurnstileChallengeUrl(
  action: TurnstileAction,
  resetKey = 0
): string | null {
  const siteKey =
    process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const challengeUrl =
    process.env.EXPO_PUBLIC_TURNSTILE_CHALLENGE_URL?.trim() ||
    DEFAULT_CHALLENGE_URL;

  if (!siteKey || !challengeUrl) {
    return null;
  }

  const separator = challengeUrl.includes("?") ? "&" : "?";

  return (
    `${challengeUrl}${separator}` +
    `sitekey=${encodeURIComponent(siteKey)}` +
    `&action=${encodeURIComponent(action)}` +
    `&nonce=${encodeURIComponent(String(resetKey))}`
  );
}

export function turnstileChallengeOrigin(): string | null {
  const challengeUrl =
    process.env.EXPO_PUBLIC_TURNSTILE_CHALLENGE_URL?.trim() ||
    DEFAULT_CHALLENGE_URL;

  try {
    return new URL(challengeUrl).origin;
  } catch {
    return null;
  }
}
