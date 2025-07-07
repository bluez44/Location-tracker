import * as Location from "expo-location";

import instance from "@/api";
import { AxiosError } from "axios";

export const getUserLocation = async () => {
  let errorMessage: string | null = null;
  let longi: number | null = null;
  let lati: number | null = null;
  let location: any = null;
  //   const { coords } = await Location.getCurrentPositionAsync({});
  const lastKnownLocation = await Location.getLastKnownPositionAsync({});

  if (lastKnownLocation && lastKnownLocation.coords) {
    const { latitude, longitude } = lastKnownLocation.coords;
    lati = latitude;
    longi = longitude;

    const res = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    location = res;
  }

  return { lati, longi, location, errorMessage };
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
  vehicleNumber: any,
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
