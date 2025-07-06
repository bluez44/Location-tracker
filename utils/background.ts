import {
  BACKGROUND_NOTIFICATION_TASK,
  LOCATION_TASK_NAME,
} from "@/constant/backgroundApp";
import { VEHICLE_NUMBER } from "@/constant/info";
import { UPDATE_INTERVAL } from "@/constant/interval";
import { loadFromStorage } from "@/storage/ultils";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
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
        const saveDate = new Date();

        schedulePushNotification(
          "Get location success",
          `Latitude: ${data.locations[0].coords.latitude}\nLongitude: ${data.locations[0].coords.longitude} \nDate: ${saveDate.toString()}`
        );

        const res = await loadFromStorage(VEHICLE_NUMBER);
        let vehicleNumber;
        if (res.name === VEHICLE_NUMBER) vehicleNumber = res.value;

        try {
          const res = await saveLocation(
            data.locations[0].coords.latitude,
            data.locations[0].coords.longitude,
            data.locations[0],
            vehicleNumber,
            saveDate
          );

          schedulePushNotification(
            "Update location success",
            JSON.stringify(res.message)
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
};

const initBackgroundNotification = async () => {
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
};

const startBackgroundLocation = async (timeInterval?: number) => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return;
  }

  const { status: bgStatus } =
    await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== "granted") {
    return;
  }

  const isRegistered =
    await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: (timeInterval || UPDATE_INTERVAL) * 1000, // in milliseconds
      distanceInterval: 20, // in meters
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location Tracking In Background",
        notificationBody: `Location will auto save in ${(timeInterval || UPDATE_INTERVAL) / 60} minutes.`,
        notificationColor: "#fff",
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
};
