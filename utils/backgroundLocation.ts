import * as Location from "expo-location";

import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";

const requestPermissions = async () => {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === "granted") {
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === "granted") {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
        }).then(() => {
          console.log("Get background location successfully.");
        });
      }
    }

  console.log("##############################################");

};


export default requestPermissions;
