import { useEffect, useRef } from "react";

type TurnstileWidgetId = string;

type TurnstileOptions = {
  sitekey: string;
  action?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "error-callback"?: (code?: string) => void;
};

type TurnstileApi = {
  render: (
    container: HTMLElement | string,
    options: TurnstileOptions,
  ) => TurnstileWidgetId;
  remove: (widgetId: TurnstileWidgetId) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type Props = {
  onToken: (token: string | null) => void;
  resetKey?: number;
};

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileLoader: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (turnstileLoader) {
    return turnstileLoader;
  }

  turnstileLoader = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.getElementById(
      TURNSTILE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    const resolveWhenReady = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        reject(new Error("Cloudflare Turnstile no quedó disponible."));
      }
    };

    if (existing) {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }

      existing.addEventListener("load", resolveWhenReady, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("No se pudo cargar Cloudflare Turnstile.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = resolveWhenReady;
    script.onerror = () =>
      reject(new Error("No se pudo cargar Cloudflare Turnstile."));

    document.head.appendChild(script);
  }).catch((error) => {
    turnstileLoader = null;
    throw error;
  });

  return turnstileLoader;
}

export default function TurnstileChallenge({
  onToken,
  resetKey = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const siteKey = (
      import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ""
    ).trim();

    if (!siteKey || !containerRef.current) {
      onTokenRef.current(null);
      return;
    }

    let cancelled = false;
    let api: TurnstileApi | null = null;

    onTokenRef.current(null);

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        api = turnstile;

        if (widgetIdRef.current) {
          try {
            turnstile.remove(widgetIdRef.current);
          } catch {
            // El widget ya pudo haber sido eliminado.
          }
          widgetIdRef.current = null;
        }

        containerRef.current.innerHTML = "";

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: "login",
          theme: "auto",
          size: "flexible",

          callback: (token) => {
            if (!cancelled) {
              onTokenRef.current(token);
            }
          },

          "expired-callback": () => {
            if (!cancelled) {
              onTokenRef.current(null);
            }
          },

          "timeout-callback": () => {
            if (!cancelled) {
              onTokenRef.current(null);
            }
          },

          "error-callback": (code) => {
            console.error("[Cloudflare Turnstile] Error:", code);
            if (!cancelled) {
              onTokenRef.current(null);
            }
          },
        });
      })
      .catch((error) => {
        console.error("[Cloudflare Turnstile]", error);
        if (!cancelled) {
          onTokenRef.current(null);
        }
      });

    return () => {
      cancelled = true;

      if (api && widgetIdRef.current) {
        try {
          api.remove(widgetIdRef.current);
        } catch {
          // El widget ya pudo haber sido eliminado.
        }
      }

      widgetIdRef.current = null;

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [resetKey]);

  const siteKey = (
    import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ""
  ).trim();

  if (!siteKey) {
    return (
      <p
        style={{
          color: "#991B1B",
          fontSize: 13,
          textAlign: "center",
        }}
      >
        La verificación de seguridad no está configurada.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: 65,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  );
}