import { udpateLocation } from "@/api";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React from "react";
import { Button, StyleSheet, View } from "react-native";

const LOCATION_TASK_NAME = "background-location-task";

const requestPermissions = async () => {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === "granted") {
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === "granted") {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  }
};

const PermissionsButton = () => (
  <View style={styles.container}>
    <Button onPress={requestPermissions} title="Enable background location" />
  </View>
);

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data: {locations}, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (!locations || locations.length === 0) {
    // No locations were received - this could happen if the location service is disabled.
    return;
  }
   udpateLocation(locations[0].coords.latitude, locations[0].coords.longitude, locations)
    .then((res) => {
      console.log("Location updated:", res);
    })
    .catch((err) => {
      console.log("Error updating location:", err);
    });
    // console.log("Background location received:", locations);

});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PermissionsButton;
