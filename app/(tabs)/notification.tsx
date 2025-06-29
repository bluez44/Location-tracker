import { schedulePushNotification } from "@/utils/notification";
import * as Notifications from "expo-notifications";
import { Button, Text, View } from "react-native";

export default function Notification({
  expoPushToken,
  channels,
  notification,
}: {
  expoPushToken: string;
  channels: Notifications.NotificationChannel[];
  notification: Notifications.Notification | undefined;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map((c) => c.id),
        null,
        2
      )}`}</Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>
          Title: {notification && notification.request.content.title}{" "}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{" "}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification("Test title", "Test body");
        }}
      />
    </View>
  );
}
