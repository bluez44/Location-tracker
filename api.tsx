import * as axios from "axios";
import * as Location from "expo-location";

const API_BASE_URL = "https://location-tracker-api-black.vercel.app";

const instance = axios.default.create({
  baseURL: API_BASE_URL,
});

export const udpateLocation = async (
  latitude: number | null,
  longitude: number | null,
  location: Location.LocationGeocodedAddress
) => {
  try {
    const timestamp = new Date().toISOString();
    // console.log("Updating location:", latitude, longitude, location, timestamp);
    const userId = 1; // Replace with actual user ID if needed
    if (latitude === null || longitude === null) {
      return;
    }
    const response = await instance.post("/api/locations", {
      userId,
      latitude,
      longitude,
      timestamp,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};

export default instance;
