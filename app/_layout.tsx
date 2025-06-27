import { Stack } from "expo-router";
import * as TaskManager from "expo-task-manager";

import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";

import "../global.css";
import { saveLocation } from "@/utils/location";
import { Alert } from "react-native";

// TaskManager.defineTask(
//   LOCATION_TASK_NAME,
//   async ({ data: { locations }, error } : any) => {
//     if (error) {
//       // Error occurred - check `error.message` for more details.
//       console.error("Background location task error:", error.message);
//       return;
//     }
//     if (!locations || locations.length === 0) {
//       // No locations were received - this could happen if the location service is disabled.
//       console.warn("No locations received in background task.");
//       return;
//     }
//     if (locations) console.log("Received locations:", locations);
//     saveLocation(
//       locations[0].coords.latitude,
//       locations[0].coords.longitude,
//       locations
//     )
//       .then((res) => {
//         console.log("Location updated:", res);
//       })
//       .catch((err) => {
//         console.log("Error updating location:", err);
//       });
//   }
// );

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "Location Tracker" }}
      />
    </Stack>
  );
}
