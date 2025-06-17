import * as Location from "expo-location";

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

    console.log("Location:", latitude, longitude);

    const res = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    location = res;

    //   console.log("Location details:", res);
  }

  return { lati, longi, location, errorMessage };
};

// {"city": null, "country": "Việt Nam", "district": null, "formattedAddress": "Hẻm 2 Đường số 8, Khu Phố 19, Bình Tân, Hồ Chí Minh, Việt Nam", "isoCountryCode": "VN", "name": "Hẻm 2", "postalCode": null, "region": "Hồ Chí Minh", "street": "Đường số 8", "streetNumber": "Hẻm 2", "subregion": "Bình Tân", "timezone": null}
