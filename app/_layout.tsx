import { Stack } from "expo-router";

import {
  initBackgroundLocation,
  initBackgroundNotification,
} from "@/utils/background";
import { useEffect } from "react";
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    initBackgroundLocation();
    initBackgroundNotification();
  });

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
