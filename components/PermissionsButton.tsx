import {
  startBackgroundLocation,
  startBackgroundNotification,
} from "@/utils/background";
import React from "react";
import { Button, StyleSheet, TouchableOpacity, View, Text } from "react-native";

const LocationPermissionsButton = ({ timer }: { timer: number }) => (
  <View style={styles.container}>
    <Button
      title="Enable location in background"
      onPress={async () => await startBackgroundLocation(timer * 1000)}
    />
  </View>
);

const NotificationPermissionsButton = () => (
  <View style={styles.container}>
    <TouchableOpacity onPress={async () => await startBackgroundNotification()}>
      <Text>Enable notification in background</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    display: "none",
    backgroundColor: "red",
  },
});

export { LocationPermissionsButton, NotificationPermissionsButton };
