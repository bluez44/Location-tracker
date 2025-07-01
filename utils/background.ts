import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Alert } from "react-native";
import { saveLocation } from "./location";
import { schedulePushNotification } from "./notification";

const initBackgroundLocation = async () => {
  TaskManager.defineTask(
    LOCATION_TASK_NAME,
    async ({
      data,
      error,
    }: {
      data: Location.LocationObject[];
      error: any;
    }) => {
      schedulePushNotification(
        "Location Tracking",
        "Starting background location task..."
      );

      if (error) {
        console.error("Background location task error:", error.message);
        return;
      }

      if (data) {
        schedulePushNotification(
          "Get location successfully",
          JSON.stringify(data)
        );
        try {
          const res = await saveLocation(
            data[0].coords.latitude,
            data[0].coords.longitude,
            data[0]
          );

          schedulePushNotification("Location Tracking", res.message);
        } catch (error: any) {
          console.error(
            "Failed to update location in background:",
            error.message
          );
        }
      }
    }
  );

  console.log("Define background location task.");
};

const startBackgroundLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Permission to access location was denied");
    return;
  }

  const { status: bgStatus } =
    await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== "granted") {
    console.log("Permission to access background location was denied");
    return;
  }

  const isRegistered =
    await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 30000, // in milliseconds
      distanceInterval: 0, // in meters
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location Tracking",
        notificationBody: "We are tracking your location in the background.",
        notificationColor: "#fff",
      },
    })
      .then(() => {
        console.log(
          "Location Tracking",
          "Background location tracking started successfully."
        );
      })
      .catch((error) => {
        Alert.alert(
          "Error",
          `Failed to start background location: ${error.message}`
        );
      });
  }
  console.log("✅ Started background location task");
};

export { initBackgroundLocation, startBackgroundLocation };
