import {
  BACKGROUND_NOTIFICATION_TASK,
  LOCATION_TASK_NAME,
} from "@/constant/backgroundApp";
import { VEHICLE_NUMBER } from "@/constant/info";
import { UPDATE_INTERVAL } from "@/constant/interval";
import { LAST_LOCATION_KEY } from "@/constant/location";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Alert } from "react-native";
import { convertMeterToTime, convertSecondToTime } from "./common";
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
          const currentLocation = data.locations[0].coords;

          saveToStorage(LAST_LOCATION_KEY, currentLocation, 0);

          const currentTime = new Date();

          schedulePushNotification(
            "Get location success",
            `Latitude: ${currentLocation.latitude}\nLongitude: ${currentLocation.longitude} \nDate: ${new Date(data.locations[0].timestamp).toString()} \nSpeed: ${currentLocation.speed}\nCurrent time: ${currentTime.toString()}`
          );

          const res = await loadFromStorage(VEHICLE_NUMBER);
          let vehicleNumber;
          if (res.name === VEHICLE_NUMBER) vehicleNumber = res.value;

          try {
            const res = await saveLocationInBackground(
              currentLocation.latitude,
              currentLocation.longitude,
              currentLocation.heading,
              currentLocation.speed,
              data.locations[0].timestamp,
              vehicleNumber
            );
          } catch (error: any) {
            console.error(
              "Failed to update location in background:",
              error.message
            );
          }
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
  const res = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (res) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
};

const startBackgroundLocation = async (
  distanceInterval: number = 0,
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

  const isRegistered =
    await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  if (!isRegistered) {
    const convertedTime = convertSecondToTime(timer || UPDATE_INTERVAL);
    const convertedDistance = convertMeterToTime(distanceInterval);

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: (timer || UPDATE_INTERVAL) * 1000, // in milliseconds
      distanceInterval: distanceInterval, // in meters
      deferredUpdatesDistance: 0,
      deferredUpdatesInterval: 0,
      showsBackgroundLocationIndicator: true,
      mayShowUserSettingsDialog: true,
      foregroundService: {
        notificationTitle: "Location Tracking In Background",
        notificationBody: `Location will auto save every ${convertedTime} or 00000 when distance difference is ${convertedDistance}`,
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
