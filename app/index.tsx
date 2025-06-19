import { udpateLocation } from "@/api";
import PermissionsButton from "@/backgroundApp/locationTask";
import useLocation from "@/hook/useLocation";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import { getUserLocation } from "@/utils/location";
import { useLayoutEffect, useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { latitude, longitude, location, errorMessage } = useLocation(10000);
  const [timeCounter, setTimeCounter] = useState(10);
  const [updateDate, setUpdateDate] = useState(new Date());
  const [resObj, setResObj] = useState<any>(null);

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

  const handleUpdateLocation = async () => {
    console.log("handleUpdateLocation called with:", {
      latitude,
      longitude,
      location,
    });
    if (!latitude || !longitude || !location) {
      console.log("Waiting for location data...");
      return;
    }

    const { prevLatitude, prevLongitude } = await loadFromStorage("location");

    if (
      prevLatitude === undefined ||
      prevLongitude === undefined ||
      prevLatitude !== latitude ||
      prevLongitude !== longitude
    ) {
      console.log(
        "No previous location found or it's different, saving current location."
      );
      saveToStorage(
        "location",
        {
          prevLatitude: latitude,
          prevLongitude: longitude,
        },
        1000 * 60 * 60 * 24
      ); // Save for 24 hours
    }

    if (prevLatitude === latitude && prevLongitude === longitude) {
      setResObj({
        status: 404,
        message: "Previous location is the same as current, skipping update.",
      });
      setUpdateDate(new Date());
      setTimeCounter(10); // Reset the counter to 10 seconds
      return;
    }

    udpateLocation(latitude, longitude, location)
      .then((res) => {
        console.log("Location updated successfully:", "res");
        setResObj(res);
        setUpdateDate(new Date());
        setTimeCounter(10); // Reset the counter to 10 seconds
      })
      .catch((error) => {
        console.error("Error updating location22:", error);
      });
  };

  useLayoutEffect(() => {
    handleUpdateLocation();
  }, [latitude, longitude, location]);

  useLayoutEffect(() => {
    const interval = setInterval(() => {
      setTimeCounter((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 10; // Reset to 10 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeCounter]);

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
          onPress={handleUpdateLocation}
        >
          Update location
        </Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 20 }}>
        Cập nhật vị trí sau mỗi 10 giây. Thời gian còn lại: {timeCounter} giây
      </Text>
      <Text style={{ marginTop: 20 }}>
        Lần cập nhật cuối: {updateDate.toLocaleTimeString()}
      </Text>
      {resObj && Object.keys(resObj).length > 0 ? (
        <Text>
          Trạng thái cập nhật lần trước:{" "}
          <Text
            style={{
              color: `${
                resObj.status === 200
                  ? "green"
                  : resObj.status === 201
                  ? "yellow"
                  : "red"
              }`,
            }}
          >
            {resObj.message}
          </Text>
        </Text>
      ) : null}

      <PermissionsButton />
    </View>
  );
}
