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
import { convertMeterToDistance, convertSecondToTime } from "./common";
import { saveLocationInBackground } from "./location";
import { schedulePushNotification } from "./notification";

const initBackgroundLocation = async () => {
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
        const currentLocation = data.locations[0].coords;
        const currentTime = new Date();

        // const lastSavedLocationRes = await loadFromStorage(LAST_LOCATION_KEY);
        // let lastSavedLocation;
        // if (
        //   lastSavedLocationRes &&
        //   lastSavedLocationRes.name === LAST_LOCATION_KEY
        // ) {
        //   lastSavedLocation = JSON.parse(lastSavedLocationRes.value);
        // } else
        //   saveToStorage(
        //     LAST_LOCATION_KEY,
        //     JSON.stringify(currentLocation),
        //     0
        //   );

        // const distanceDiff = calculateDistance(
        //   lastSavedLocation.latitude,
        //   lastSavedLocation.longitude,
        //   currentLocation.latitude,
        //   currentLocation.longitude
        // ).toFixed(2);
        // if (lastSavedLocation && distanceDiff < MINIMUM_DISTANCE.toFixed(2)) {
        //   schedulePushNotification(
        //     "Location Update",
        //     `Distance: ${distanceDiff} < ${MINIMUM_DISTANCE} meters`
        //   );
        //   console.log(
        //     `Distance ${distanceDiff} is less than minimum distance ${MINIMUM_DISTANCE}. Not saving location.`
        //   );
        //   return;
        // }

        // --- Save to location history ---
        try {
          // Load existing history
          const historyRes = await loadFromStorage(LOCATION_HISTORY_KEY);
          let history: HistoryItem[] = [];
          if (historyRes && Array.isArray(historyRes.value)) {
            history = historyRes.value;
          }
          // Append new location with timestamp
          data.locations.map((location) => {
            history.push({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              speed: location.coords.speed,
              heading: location.coords.heading,
              timestamp: location.timestamp,
              savedTime: currentTime.toString(),
            });
            // Save updated history
            saveToStorage(LOCATION_HISTORY_KEY, history, 0);
            console.log(
              "Location history updated successfully",
              currentTime.toTimeString()
            );
          });
        } catch (e) {
          console.error("Failed to save location history:", e);
        }

        const res = await loadFromStorage(VEHICLE_NUMBER);
        let vehicleNumber: Number;
        if (res.name === VEHICLE_NUMBER) vehicleNumber = res.value;

        try {
          data.locations.map(async (location) => {
            const res = await saveLocationInBackground(
              location.coords.latitude,
              location.coords.longitude,
              location.coords.heading,
              location.coords.speed,
              location.timestamp,
              vehicleNumber
            );
            saveToStorage(
              LAST_LOCATION_KEY,
              JSON.stringify(currentLocation),
              0
            );
            console.log(
              "Location saved in background successfully",
              currentTime.toTimeString()
            );
          });
        } catch (error: any) {
          console.error(
            "Failed to update location in background:",
            error.message
          );
        }
      }
    }
  );
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
  const res = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (res) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
};

const startBackgroundLocation = async (
  distanceInterval: number = 0,
  timer: number = 0
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

  const isRegistered =
    await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: timer * 1000, // in milliseconds
      distanceInterval: distanceInterval, // in meters
      showsBackgroundLocationIndicator: true,
      mayShowUserSettingsDialog: true,
      deferredUpdatesInterval: 0,
      deferredUpdatesDistance: 0,
      deferredUpdatesTimeout: 0,
      foregroundService: {
        notificationTitle: "Location Tracking In Background",
        notificationBody: `Location will auto save in background every ${timer !== 0 ? convertSecondToTime(timer) : convertMeterToDistance(distanceInterval)}`,
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
