import { Alert, type AlertButton, Platform } from "react-native";

/**
 * Muestra una alerta compatible con web y nativo.
 * En web, usa `window.alert` (sin soporte de múltiples botones con callback).
 * En nativo, delega a `Alert.alert` de React Native.
 */
export function showAlert(
  title: string,
  message: string,
  buttons?: AlertButton[],
): void {
  if (Platform.OS === "web") {
    alert(`${title}\n\n${message}`);
    if (buttons && buttons.length > 0) {
      const okButton =
        buttons.find(
          (b) =>
            b.text === "Entendido" ||
            b.text === "OK" ||
            Boolean(b.onPress),
        ) ?? buttons[0];
      if (okButton?.onPress) {
        okButton.onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}
