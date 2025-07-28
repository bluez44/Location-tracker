import { Stack } from "expo-router";

import { initBackgroundLocation } from "@/utils/background";
import "../global.css";

export default function RootLayout() {
  initBackgroundLocation();
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
