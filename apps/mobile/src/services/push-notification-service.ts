import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { authenticatedRequest } from "./api";

// Configurar el comportamiento por defecto de las notificaciones recibidas en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

/**
 * Solicita permisos de notificación al SO y registra el Expo Push Token en el backend.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (!Device.isDevice && Platform.OS !== "web") {
      console.log("Las notificaciones push nativas requieren un dispositivo físico.");
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C"
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID
    }).catch(() => null);

    if (!tokenData?.data) {
      return null;
    }

    const pushToken = tokenData.data;

    // Registrar en el backend API
    await authenticatedRequest("/push-tokens", {
      method: "POST",
      body: JSON.stringify({
        expoPushToken: pushToken,
        devicePlatform: Platform.OS
      })
    }).catch(() => null);

    return pushToken;
  } catch (error) {
    console.error("Error al registrar notificaciones push:", error);
    return null;
  }
}

/**
 * Cancela el registro del token de notificación push en el backend al cerrar sesión.
 */
export async function unregisterPushTokenAsync(pushToken: string): Promise<boolean> {
  try {
    await authenticatedRequest("/push-tokens", {
      method: "DELETE",
      body: JSON.stringify({
        expoPushToken: pushToken
      })
    });
    return true;
  } catch {
    return false;
  }
}
