import * as axios from "axios";
import * as Location from "expo-location";

const API_BASE_URL = "https://location-tracker-api-black.vercel.app";
// const API_BASE_URL = "http://localhost:3000"; // Use your local server URL for development

const instance = axios.default.create({
  baseURL: API_BASE_URL,
});

export const udpateLocation = async (
  latitude: number | null,
  longitude: number | null,
  location: Location.LocationObject | any
) => {
  try {
    if (!latitude || !longitude) {
      console.warn("Latitude or longitude is null, skipping update.");
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
