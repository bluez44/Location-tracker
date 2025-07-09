import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";
import { VEHICLE_NUMBER } from "@/constant/info";
import { loadFromStorage } from "@/storage/ultils";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { saveLocationInBackground } from "./location";
import { schedulePushNotification } from "./notification";

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
        schedulePushNotification(
          "Get location error",
          `Background location task error: ${error.message}`
        );
        return;
      }

      if (data) {
        const currentLocation = data.locations[0].coords;

        let location = await Location.reverseGeocodeAsync({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        });

        schedulePushNotification(
          "Get location success",
          `Latitude: ${currentLocation.latitude}\nLongitude: ${currentLocation.longitude} \nDate: ${new Date(data.locations[0].timestamp).toString()} \nSpeed: ${currentLocation.speed} \nLocation: ${location[0].formattedAddress}`
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
}
