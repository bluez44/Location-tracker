import { startBackgroundLocation } from "@/utils/location";
import React from "react";
import { Button, StyleSheet, View } from "react-native";

const PermissionsButton = () => (
  <View style={styles.container} onTouchStart={startBackgroundLocation}>
    <Button title="Enable location permission" />
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
