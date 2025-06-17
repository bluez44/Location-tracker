import { udpateLocation } from "@/api";
import useLocation from "@/hook/useLocation";
import { getUserLocation } from "@/utils/location";
import { useEffect } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { latitude, longitude, location, errorMessage } = useLocation(10000);

  // console.log("Current location:", location);

  // useEffect(() => {
  //   const res = udpateLocation(latitude, longitude, location)
  //     .then((res) => {
  //       console.log("Location updated successfully:", res);
  //     })
  //     .catch((error) => {
  //       console.error("Error updating location:", error);
  //     });
  //   console.log("Location update response:", res);
  // }, [location, errorMessage, latitude, longitude]);

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

  useEffect(() => {
    const timer = setInterval(() => {
      console.log("Saving location...");
      udpateLocation(latitude, longitude, location)
        .then((res) => {
          console.log("Location updated successfully:", res);
        })
        .catch((error) => {
          console.error("Error updating location:", error);
        });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>
        Vị trí hiện tại của thiết bị:{" "}
        {latitude && longitude
          ? `${latitude}, ${longitude}`
          : "Đang lấy vị trí..."}
      </Text>
      <Text>Quốc gia: {country || "Chưa biết"}</Text>
      <Text>Mã quốc gia: {isoCountryCode || "Chưa biết"}</Text>
      <Text>Mã postal: {postalCode || "Chưa biết"}</Text>
      <Text>Vùng: {region || "Chưa biết"}</Text>
      <Text>Thành phố: {city || "Chưa biết"}</Text>
      <Text>Quận/Huyện: {district || "Chưa biết"}</Text>
      <Text>Đường: {street || "Chưa biết"}</Text>
      <Text>Phường: {subregion || "Chưa biết"}</Text>
      <Text>Time zone: {timezone || "Chưa biết"}</Text>
      <Text>Địa chỉ cụ thể: {formattedAddress}</Text>
      {errorMessage ? (
        <Text style={{ color: "red" }}>{errorMessage}</Text>
      ) : null}
      <TouchableOpacity>
        <Text
          style={{
            color: "blue",
            marginTop: 20,
            textDecorationLine: "underline",
          }}
          onPress={() => {
            const url = `https://www.google.com/maps/place/${latitude}+${longitude}`;
            console.log("Opening URL:", url);
            // Open the URL in the default browser
            Linking.openURL(url);
          }}
        >
          Go to Google Maps
        </Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text
          style={{
            color: "blue",
            marginTop: 20,
            textDecorationLine: "underline",
          }}
          onPress={() => {
            getUserLocation().then((res) => {
              console.log("New location:", res);
            });
          }}
        >
          Refresh Location
        </Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text
          style={{
            color: "blue",
            marginTop: 20,
            textDecorationLine: "underline",
          }}
          onPress={() => {
            console.log("Updating location...");
            udpateLocation(latitude, longitude, location)
              .then((res) => {
                console.log("Location updated successfully:", res);
              })
              .catch((error) => {
                console.error("Error updating location22:", error);
              });
          }}
        >
          Update location
        </Text>
      </TouchableOpacity>
    </View>
  );
}
