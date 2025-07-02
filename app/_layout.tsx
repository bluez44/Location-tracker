import { Stack } from "expo-router";

import "../global.css";

import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Alert } from "react-native";

export default function RootLayout() {
  const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

  TaskManager.defineTask<Notifications.NotificationTaskPayload>(
    BACKGROUND_NOTIFICATION_TASK,
    async ({ data, error, executionInfo }: any) => {
      console.log("Received a notification task payload!");
      const isNotificationResponse = "actionIdentifier" in data;
      if (isNotificationResponse) {
        // Do something with the notification response from user
        Alert.alert("Notification Response", JSON.stringify(data));
      } else {
        // Do something with the data from notification that was received
        Alert.alert("Notification Received", JSON.stringify(data));
      }
      return;
    }
  );

  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
