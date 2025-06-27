import * as Location from "expo-location";

import instance from "@/api";
import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";
import { AxiosError } from "axios";

export const getUserLocation = async () => {
  let errorMessage: string | null = null;
  let longi: number | null = null;
  let lati: number | null = null;
  let location: any = null;
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    errorMessage = "Permission to access location was denied";
    return;
  }

  //   const { coords } = await Location.getCurrentPositionAsync({});
  const lastKnownLocation = await Location.getLastKnownPositionAsync({});

  if (lastKnownLocation && lastKnownLocation.coords) {
    const { latitude, longitude } = lastKnownLocation.coords;
    lati = latitude;
    longi = longitude;

    // console.log("Location:", latitude, longitude);

    const res = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    location = res;

    //   console.log("Location details:", res);
  }

  return { lati, longi, location, errorMessage };
};

export const saveLocation = async (
  latitude: number | null,
  longitude: number | null,
  location: Location.LocationObject | any
) => {
  try {
    if (!latitude || !longitude) {
      console.log("Latitude or longitude is null, skipping update.");
      return Promise.resolve({
        status: 404,
        message: "Latitude or longitude is null, skipping update.",
      });
    }

    const timestamp = new Date().toString();
    // console.log("Updating location api:", latitude, longitude, timestamp);
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

    console.log("Updating location api:", latitude, longitude);
    // const response = await instance.post("/api/locations", {
    //   userId,
    //   latitude,
    //   longitude,
    //   timestamp,
    //   city,
    //   country,
    //   district,
    //   formattedAddress,
    //   isoCountryCode,
    //   name,
    //   postalCode,
    //   region,
    //   street,
    //   streetNumber,
    //   subregion,
    //   timezone,
    // });
    const response = await instance.get('/')

    return response.data;
  } catch (error: AxiosError | any) {
    console.error("Error updating location:", error.message);
    throw error;
  }
};

export const startBackgroundLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Permission to access location was denied");
    return;
  }

  const { status: bgStatus } =
    await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== "granted") {
    console.log("Permission to access background location was denied");
    return;
  }

  const isRegistered =
    await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // in milliseconds
      distanceInterval: 50, // in meters
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location Tracking",
        notificationBody: "We are tracking your location in the background.",
        notificationColor: "#fff",
      },
    })
      .then(() => {
        console.log(
          "Location Tracking",
          "Background location tracking started successfully."
        );
      })
      .catch((error) => {
        console.log(
          "Error",
          `Failed to start background location: ${error.message}`
        );
      });
    console.log("✅ Started background location task");
  }
};
