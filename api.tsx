import * as axios from "axios";
import * as Location from "expo-location";

const API_BASE_URL = "https://location-tracker-api-black.vercel.app";

const instance = axios.default.create({
  baseURL: API_BASE_URL,
});

export const udpateLocation = async (
  latitude: number | null,
  longitude: number | null,
  location: Location.LocationObject | any
) => {
  try {
    const timestamp = new Date().toISOString();
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
    });

    return response.data;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};

export default instance;
