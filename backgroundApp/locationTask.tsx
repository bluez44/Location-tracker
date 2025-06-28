import { startBackgroundLocation } from "@/utils/background";
import React from "react";
import { Button, StyleSheet, View } from "react-native";
import * as BackgroundTask from "expo-background-task";

const PermissionsButton = () => (
  <View style={styles.container}>
    <Button title="Enable location permission" onPress={async () => BackgroundTask.triggerTaskWorkerForTestingAsync()}/>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PermissionsButton;
