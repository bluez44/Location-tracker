import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen name="index" options={{ title: "Location Tracker" }} />

      <Tabs.Screen
        name="notification"
        options={{ title: "Notification Test" }}
      />
    </Tabs>
  );
}
