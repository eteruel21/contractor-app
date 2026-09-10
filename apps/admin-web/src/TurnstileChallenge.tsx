import { useEffect, useMemo, useRef } from "react";

type TurnstileMessage = { source?: string; type?: string; action?: string; token?: string };

type Props = {
  onToken: (token: string | null) => void;
  resetKey?: number;
};

export default function TurnstileChallenge({ onToken, resetKey = 0 }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const src = useMemo(() => {
    const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "").trim();
    const challengeUrl = (import.meta.env.VITE_TURNSTILE_CHALLENGE_URL ?? "/turnstile.html").trim();
    if (!siteKey || !challengeUrl) return null;
    const url = new URL(challengeUrl, window.location.origin);
    url.searchParams.set("sitekey", siteKey);
    url.searchParams.set("action", "login");
    url.searchParams.set("nonce", String(resetKey));
    return url.toString();
  }, [resetKey]);

  useEffect(() => {
    if (!src) return;
    const expectedOrigin = new URL(src).origin;
    function handleMessage(event: MessageEvent<TurnstileMessage>) {
      if (event.origin !== expectedOrigin || event.source !== frameRef.current?.contentWindow) return;
      const payload = event.data;
      if (!payload || payload.source !== "contractor-turnstile" || payload.action !== "login") return;
      if (payload.type === "success" && typeof payload.token === "string" && payload.token.length > 0) {
        onToken(payload.token);
        return;
      }
      if (payload.type === "expired" || payload.type === "timeout" || payload.type === "error") onToken(null);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [src, onToken]);

  if (!src) return <p style={{ color: "#991B1B", fontSize: 13, textAlign: "center" }}>La verificación de seguridad no está configurada.</p>;

  return <iframe ref={frameRef} key={resetKey} src={src} title="Verificación de seguridad" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin" style={{ border: 0, width: "100%", height: 92, display: "block", background: "transparent" }} />;
}
