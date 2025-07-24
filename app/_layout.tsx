import { Stack } from "expo-router";

import {
  initBackgroundLocation,
  initBackgroundNotification,
} from "@/utils/background";
import "../global.css";

initBackgroundLocation();
initBackgroundNotification();

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
