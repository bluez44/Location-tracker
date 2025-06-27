import { LocationInfo } from "@/models/LocationInfo";
import { getUserLocation } from "@/utils/location";
import { useState } from "react";
import { StyleSheet } from "react-native";

const useLocation = async (timer: number = 0): Promise<LocationInfo> => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

  const [location, setLocation] = useState<any>(null);

  await getUserLocation().then((res) => {
    if (res) {
      setLatitude(res.lati);
      setLongitude(res.longi);
      setLocation(res.location);
      setErrorMessage(res.errorMessage || null);
    }
  });

  return { latitude, longitude, location, errorMessage };
};

export default useLocation;

const styles = StyleSheet.create({});
