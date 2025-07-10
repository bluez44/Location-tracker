import { registerForPushNotificationsAsync } from "@/utils/notification";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export default function Layout() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("response", response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarActiveBackgroundColor: "#000",
        tabBarStyle: { borderColor: "black" },
        headerStyle: { backgroundColor: "#000" },
        headerTitleStyle: { color: "white" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Location Tracker",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: "Config",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
