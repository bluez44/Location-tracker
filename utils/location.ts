import * as Location from "expo-location";

import instance from "@/api";
import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";
import { LAST_LOCATION_KEY } from "@/constant/location";
import { loadFromStorage } from "@/storage/ultils";
import { AxiosError } from "axios";
import { schedulePushNotification } from "./notification";

export const getUserLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  let errorMessage: string | null = null;

  if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)) {
    const lastSavedLocationRes = await loadFromStorage(LAST_LOCATION_KEY);

    if (
      lastSavedLocationRes &&
      lastSavedLocationRes.name === LAST_LOCATION_KEY
    ) {
      const { latitude, longitude } = JSON.parse(lastSavedLocationRes.value);

      const location = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      return { lati: latitude, longi: longitude, location, errorMessage };
    }
  } else {
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      mayShowUserSettingsDialog: true,
    });

    const location = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    return { lati: latitude, longi: longitude, location, errorMessage };
  }
};

export const saveLocation = async (
  latitude: number | null,
  longitude: number | null,
  location: Location.LocationObject | any,
  vehicleNumber: any,
  saveDate: Date
) => {
  try {
    if (!latitude || !longitude) {
      return Promise.resolve({
        status: 404,
        message: "Latitude or longitude is null, skipping update.",
      });
    }

    const timestamp = saveDate.toString();
    const userId = 1; // Replace with actual user ID if needed
    const {
      city,
      country,
      district,
      formattedAddress,
      isoCountryCode,
      name,
      postalCode,
      region,
      street,
      streetNumber,
      subregion,
      timezone,
    } = location?.[0] || {};

    if (latitude === null || longitude === null) {
      return;
    }

    const response = await instance.post("/api/locations", {
      userId,
      latitude,
      longitude,
      timestamp,
      city,
      country,
      district,
      formattedAddress,
      isoCountryCode,
      name,
      postalCode,
      region,
      street,
      streetNumber,
      subregion,
      timezone,
      vehicleNumber,
    });

    return response.data;
  } catch (error: AxiosError | any) {
    console.error("Error updating location:", error.message);
    throw error;
  }
};

export const saveLocationInBackground = async (
  latitude: number,
  longitude: number,
  heading: number | null,
  speed: number | null,
  saveTimestamp: number,
  vehicleNumber: any
) => {
  try {
    if (!latitude || !longitude) {
      return Promise.resolve({
        status: 404,
        message: "Latitude or longitude is null, skipping update.",
      });
    }

    const timestamp = new Date(saveTimestamp).toString();
    const userId = 1; // Replace with actual user ID if needed

    if (latitude === null || longitude === null) {
      schedulePushNotification(
        "Get location error",
        "Latitude or longitude is null, skipping update."
      );
      return;
    }

    const response = await instance.post("/api/locations", {
      userId,
      latitude,
      longitude,
      heading,
      speed,
      timestamp,
      vehicleNumber,
    });

    return response.data;
  } catch (error: AxiosError | any) {
    console.error("Error updating location:", error.message);
    throw error;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Khoảng cách theo km
  return distance * 1000; // Chuyển đổi sang mét
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
