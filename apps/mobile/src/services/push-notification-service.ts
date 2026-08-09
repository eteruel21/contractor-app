import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { authenticatedRequest } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

function expoProjectId(): string | null {
  return (
    process.env.EXPO_PUBLIC_PROJECT_ID
      ?.trim() || null
  );
}

async function currentExpoPushToken():
Promise<string | null> {
  if (
    Platform.OS === "web" ||
    !Device.isDevice
  ) {
    return null;
  }

  const projectId = expoProjectId();

  if (!projectId) {
    return null;
  }

  const permissions =
    await Notifications.getPermissionsAsync();

  if (permissions.status !== "granted") {
    return null;
  }

  const tokenData =
    await Notifications.getExpoPushTokenAsync({
      projectId
    });

  return tokenData.data || null;
}

export async function registerForPushNotificationsAsync():
Promise<string | null> {
  try {
    if (
      Platform.OS === "web" ||
      !Device.isDevice
    ) {
      return null;
    }

    const projectId = expoProjectId();

    if (!projectId) {
      return null;
    }

    const {
      status: existingStatus
    } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await Notifications
          .requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications
        .setNotificationChannelAsync(
          "default",
          {
            name: "default",
            importance:
              Notifications
                .AndroidImportance.MAX,
            vibrationPattern: [
              0,
              250,
              250,
              250
            ],
            lightColor: "#FF231F7C"
          }
        );
    }

    const tokenData =
      await Notifications
        .getExpoPushTokenAsync({
          projectId
        });

    const pushToken =
      tokenData.data?.trim();

    if (!pushToken) {
      return null;
    }

    await authenticatedRequest(
      "/push-tokens",
      {
        method: "POST",
        body: JSON.stringify({
          expoPushToken: pushToken,
          devicePlatform: Platform.OS
        })
      }
    );

    return pushToken;
  } catch (error) {
    console.error(
      "Error al registrar notificaciones push:",
      error
    );

    return null;
  }
}

export async function unregisterPushTokenAsync(
  pushToken: string
): Promise<boolean> {
  try {
    await authenticatedRequest(
      "/push-tokens",
      {
        method: "DELETE",
        body: JSON.stringify({
          expoPushToken: pushToken
        })
      }
    );

    return true;
  } catch {
    return false;
  }
}

export async function unregisterCurrentPushTokenAsync():
Promise<boolean> {
  try {
    const pushToken =
      await currentExpoPushToken();

    if (!pushToken) {
      return true;
    }

    return unregisterPushTokenAsync(
      pushToken
    );
  } catch {
    return false;
  }
}
