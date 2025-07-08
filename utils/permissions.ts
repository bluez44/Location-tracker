import * as Camera from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";

const checkPermissions = async () => {
  const locationStatus = await Location.getForegroundPermissionsAsync();
  const cameraStatus = await Camera.Camera.getCameraPermissionsAsync();
  const mediaStatus = await MediaLibrary.getPermissionsAsync();

  return {
    hasLocationPermission: locationStatus.status === "granted",
    hasCameraPermission: cameraStatus.status === "granted",
    hasMediaPermission: mediaStatus.status === "granted",
  };
};

const requestLocationPermission = async () => {
  const res = await Location.requestForegroundPermissionsAsync();

  if (res.status !== "granted") return res;

  return await Location.requestBackgroundPermissionsAsync();
};

const requestCameraPermission = async () => {
  return await Camera.Camera.requestCameraPermissionsAsync();
};

const requestMediaPermission = async () => {
  return await MediaLibrary.requestPermissionsAsync();
};

export {
  checkPermissions,
  requestCameraPermission,
  requestLocationPermission,
  requestMediaPermission,
};
