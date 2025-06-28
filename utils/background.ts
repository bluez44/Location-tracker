import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";
import * as BackgroundTask from "expo-background-task";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Alert } from "react-native";
import { saveLocation } from "./location";

const initBackgroundLocation = async () => {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    console.log("Starting background location task...");

    if (error) {
      console.error("Background location task error:", error.message);
      return;
    }

    if (data)
      Alert.alert(
        "Location Tracking",
        "Background location tracking started successfully." + JSON.stringify(data)
      );


    console.log("End background location task.");
  });

  await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME).then(
    async (res) => {
      if (!res) {
        BackgroundTask.registerTaskAsync(LOCATION_TASK_NAME);
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
      timeInterval: 10000, // in milliseconds
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
