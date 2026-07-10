import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configureLocalNotifications(): Promise<void> {
  if (Platform.OS === "web") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      "appointments",
      {
        name: "Citas y trabajos",
        importance:
          Notifications.AndroidImportance.HIGH,
        sound: "default",
      },
    );
  }
}

export async function scheduleAppointmentNotification({
  title,
  body,
  date,
  reminderMinutes,
}: {
  title: string;
  body: string;
  date: Date;
  reminderMinutes: number;
}): Promise<string> {
  if (Platform.OS === "web") return "";

  const permission =
    await Notifications.getPermissionsAsync();

  let granted = permission.granted;

  if (!granted) {
    const requested =
      await Notifications.requestPermissionsAsync();
    granted = requested.granted;
  }

  if (!granted) return "";

  await configureLocalNotifications();

  const triggerDate = new Date(
    date.getTime() - reminderMinutes * 60_000,
  );

  if (triggerDate.getTime() <= Date.now()) return "";

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data: {
        url: "/agenda",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId:
        Platform.OS === "android"
          ? "appointments"
          : undefined,
    },
  });
}

export async function cancelScheduledNotification(
  notificationId: string,
): Promise<void> {
  if (Platform.OS === "web" || !notificationId) return;

  await Notifications.cancelScheduledNotificationAsync(
    notificationId,
  );
}
