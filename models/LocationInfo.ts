import { LocationGeocodedAddress } from "expo-location";

export type LocationInfo = {
  latitude: number | null;
  longitude: number | null;
  location: LocationGeocodedAddress[] | null;
  errorMessage: string | null;
};