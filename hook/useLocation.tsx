import { getUserLocation } from "@/utils/location";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

const useLocation = (timer: number = 0) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    getUserLocation().then((res) => {
      if (res) {
        setLatitude(res.lati);
        setLongitude(res.longi);
        setLocation(res.location);
        setErrorMessage(res.errorMessage || null);
      }
    });
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(async () => {
        await getUserLocation().then((res) => {
          if (res) {
            setLatitude(res.lati);
            setLongitude(res.longi);
            setLocation(res.location);
            setErrorMessage(res.errorMessage || null);
          }
        });
      }, timer);

      return () => clearInterval(interval);
    }
  }, [timer]);

  return { latitude, longitude, location, errorMessage };
};

export default useLocation;

const styles = StyleSheet.create({});
