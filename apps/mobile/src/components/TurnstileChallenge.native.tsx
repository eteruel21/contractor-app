import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

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
  const challengeUrl = useMemo(
    () => buildTurnstileChallengeUrl(action, resetKey),
    [action, resetKey],
  );

  if (!challengeUrl) {
    return (
      <View style={styles.messageBox}>
        <Text style={styles.errorText}>
          La verificación de seguridad no está configurada.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={`${action}-${resetKey}`}
        source={{ uri: challengeUrl }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["https://*", "http://*"]}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.webView}
        onMessage={(event) => {
          try {
            const payload = JSON.parse(
              event.nativeEvent.data,
            ) as TurnstileMessage;

            if (
              payload.source !== "contractor-turnstile" ||
              payload.action !== action
            ) {
              return;
            }

            if (
              payload.type === "success" &&
              typeof payload.token === "string" &&
              payload.token.length > 0
            ) {
              onToken(payload.token);
              return;
            }

            if (
              payload.type === "expired" ||
              payload.type === "timeout" ||
              payload.type === "error"
            ) {
              onToken(null);
            }
          } catch {
            onToken(null);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 92,
    width: "100%",
    overflow: "hidden",
  },
  webView: {
    minHeight: 92,
    backgroundColor: "transparent",
  },
  messageBox: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    textAlign: "center",
  },
});
