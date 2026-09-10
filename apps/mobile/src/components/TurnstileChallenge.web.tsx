import {
  createElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Text, View } from "react-native";

import {
  buildTurnstileChallengeUrl,
  type TurnstileChallengeProps,
} from "./TurnstileChallenge.types";

type TurnstileMessage = {
  source?: string;
  type?: string;
  action?: string;
  token?: string;
};

export default function TurnstileChallenge({
  action,
  onToken,
  resetKey = 0,
}: TurnstileChallengeProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const challengeUrl = useMemo(
    () => buildTurnstileChallengeUrl(action, resetKey),
    [action, resetKey],
  );
  const challengeOrigin = useMemo(() => {
    if (!challengeUrl) return null;
    try {
      return new URL(challengeUrl, window.location.origin).origin;
    } catch {
      return null;
    }
  }, [challengeUrl]);

  useEffect(() => {
    function handleMessage(event: MessageEvent<TurnstileMessage>) {
      if (
        !challengeOrigin ||
        event.origin !== challengeOrigin ||
        event.source !== frameRef.current?.contentWindow ||
        !event.data ||
        event.data.source !== "contractor-turnstile" ||
        event.data.action !== action
      ) {
        return;
      }

      if (
        event.data.type === "success" &&
        typeof event.data.token === "string" &&
        event.data.token.length > 0
      ) {
        onToken(event.data.token);
        return;
      }

      if (
        event.data.type === "expired" ||
        event.data.type === "timeout" ||
        event.data.type === "error"
      ) {
        onToken(null);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [action, challengeOrigin, onToken]);

  if (!challengeUrl) {
    return (
      <View style={{ paddingVertical: 12, paddingHorizontal: 14 }}>
        <Text
          style={{
            color: "#991B1B",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          La verificación de seguridad no está configurada.
        </Text>
      </View>
    );
  }

  return createElement("iframe", {
    ref: frameRef,
    key: `${action}-${resetKey}`,
    src: challengeUrl,
    title: "Verificación de seguridad",
    referrerPolicy: "no-referrer",
    style: {
      border: 0,
      width: "100%",
      height: 92,
      background: "transparent",
      display: "block",
    },
  });
}
