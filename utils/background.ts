import {
  BACKGROUND_NOTIFICATION_TASK,
  LOCATION_TASK_NAME,
} from "@/constant/backgroundApp";
import { VEHICLE_NUMBER } from "@/constant/info";
import { LAST_LOCATION_KEY, LOCATION_HISTORY_KEY } from "@/constant/location";
import { HistoryItem } from "@/models/History";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Alert } from "react-native";
import { saveLocationInBackground } from "./location";
import { schedulePushNotification } from "./notification";

const initBackgroundLocation = async () => {
  if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
    TaskManager.defineTask(
      LOCATION_TASK_NAME,
      async ({
        data,
        error,
      }: {
        data: {
          locations: Location.LocationObject[];
        };
        error: any;
      }) => {
        if (error) {
          console.error("Background location task error:", error.message);
          return;
        }

        if (data) {
          console.log("-----------------------------------------");
          console.log("Background location task data:", data);
          console.log("Number of locations:", data.locations.length);
          const currentTime = new Date();
          console.log("Current time:", currentTime.toTimeString());

          const res = await loadFromStorage(VEHICLE_NUMBER);
          let vehicleNumber: any = 0;
          if (res && res.name === VEHICLE_NUMBER) vehicleNumber = res.value;

          console.log(
            "Vehicle number in background location task:",
            vehicleNumber
          );

          // Load existing history
          const historyRes = await loadFromStorage(LOCATION_HISTORY_KEY);
          let history: HistoryItem[] = [];
          if (historyRes && Array.isArray(historyRes.value)) {
            history = historyRes.value;
          }

          data.locations.map(async (location) => {
            saveLocationInBackground(
              location.coords.latitude,
              location.coords.longitude,
              location.coords.heading,
              location.coords.speed,
              location.timestamp,
              vehicleNumber
            );

            console.log(vehicleNumber);

            history.push({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              speed: location.coords.speed,
              heading: location.coords.heading,
              timestamp: location.timestamp,
              savedTime: currentTime.toString(),
              vehicleNumber: vehicleNumber,
            });

            saveToStorage(LOCATION_HISTORY_KEY, history, 0);
            console.log(
              "Location history updated successfully",
              currentTime.toTimeString()
            );

            saveToStorage(
              LAST_LOCATION_KEY,
              JSON.stringify(location.coords),
              0
            );
            console.log(
              "Location saved in background successfully",
              currentTime.toTimeString()
            );
          });
          console.log("-----------------------------------------");
        }
      }
    );
  }
};

const initBackgroundNotification = async () => {
  if (!TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
    TaskManager.defineTask<Notifications.NotificationTaskPayload>(
      BACKGROUND_NOTIFICATION_TASK,
      async ({ data, error, executionInfo }: any) => {
        const isNotificationResponse = "actionIdentifier" in data;
        if (isNotificationResponse) {
          // Do something with the notification response from user
          Alert.alert("Notification Response", JSON.stringify(data));
        } else {
          // Do something with the data from notification that was received
          Alert.alert("Notification Received", JSON.stringify(data));
        }
        return;
      }
    );
  }
};

const stopBackgroundLocation = async () => {
  console.log("Stopping background location updates...");
  const res = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (res) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
};

const startBackgroundLocation = async (
  distanceInterval: number,
  timer: number
) => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    schedulePushNotification("Foreground location permission", "not granted");
    return;
  }

  const { status: bgStatus } =
    await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== "granted") {
    schedulePushNotification("Background location permission", "not granted");
    return;
  }

  await stopBackgroundLocation();

  const isRegistered =
    await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  if (!isRegistered) {
    console.log(
      "Starting background location updates...",
      timer,
      distanceInterval
    );
    Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: timer * 1000, // in milliseconds
      distanceInterval: distanceInterval, // in meters
      deferredUpdatesInterval: 0, // in milliseconds
      deferredUpdatesDistance: 0, // in meters
      showsBackgroundLocationIndicator: true,
      mayShowUserSettingsDialog: true,
      foregroundService: {
        notificationTitle: "Location Tracking In Background",
        notificationBody: "Tracking your location in the background",
        notificationColor: "#fff",
        killServiceOnDestroy: false,
      },
    });
  }
};

const startBackgroundNotification = async () => {
  if (!Notifications.PermissionStatus.GRANTED)
    await Notifications.requestPermissionsAsync();
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
};

export {
  initBackgroundLocation,
  initBackgroundNotification,
  startBackgroundLocation,
  startBackgroundNotification,
  stopBackgroundLocation,
};
