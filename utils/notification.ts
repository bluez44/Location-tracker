import { DISMISS_TIMEOUT } from "@/constant/notification";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

async function schedulePushNotification(titile: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titile,
      body: body,
      data: { data: "goes here", test: { test1: "more data" } },
    },
    trigger: null,
  });
}

async function schedulePushNotificationWithOnlyData(data: Record<string, any>) {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      data: data,
    },
    trigger: null,
  });

  setTimeout(async () => {
    try {
      await Notifications.dismissNotificationAsync(notificationId);
    } catch (error) {
      console.log("Error dismissing notification:", error);
    }
  }, DISMISS_TIMEOUT);
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "A channel is needed for the permissions prompt to appear",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

export {
  registerForPushNotificationsAsync,
  schedulePushNotification,
  schedulePushNotificationWithOnlyData,
};
