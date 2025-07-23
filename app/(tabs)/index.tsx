import { VEHICLE_NUMBER } from "@/constant/info";
import { GET_INTERVAL, UPDATE_INTERVAL } from "@/constant/interval";
import { LocationInfo } from "@/models/LocationInfo";
import { loadFromStorage } from "@/storage/ultils";
import { getUserLocation, saveLocation } from "@/utils/location";
import {
  checkPermissions,
  requestLocationPermission,
} from "@/utils/permissions";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [locationInfor, setLocationInfor] = useState<LocationInfo>({
    latitude: 0,
    longitude: 0,
    location: null,
    errorMessage: "",
  });
  const [hasLocationPermission, setHasLocationPermission] =
    useState<boolean>(false);

  const [getLocationDate, setGetLocationDate] = useState<Date | null>(null);
  const [getLocationStatus, setGetLocationStatus] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [getLocationTimer, setGetLocationTimer] =
    useState<number>(GET_INTERVAL);

  const [updateLocationDate, setUpdateLocationDate] = useState<Date | null>(
    null
  );
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [isUpdatingLocation, setIsUpdatingLocation] = useState<boolean>(false);
  useState<number>(UPDATE_INTERVAL);

  const [vehicleNumber, setVehicleNumber] = useState<string>("");

  const showToast = (message: string = "") => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };

  useLayoutEffect(() => {
    const handleGetVehicleNumber = async () => {
      const res = await loadFromStorage(VEHICLE_NUMBER);

      if (res.name === VEHICLE_NUMBER) {
        setVehicleNumber(res.value);
      }
    };

    handleGetVehicleNumber();
  }, []);

  const handleGetLocation = () => {
    setIsGettingLocation(true);

    getUserLocation()
      .then((data) => {
        if (!data) {
          setGetLocationStatus("Error fetching location");
          showToast("Error fetching location");
          return;
        }
        setLocationInfor({
          latitude: data.lati,
          longitude: data.longi,
          location: data.location,
          errorMessage: data.errorMessage ?? "",
        });
        setGetLocationStatus(
          data.errorMessage ? data.errorMessage : "Get location successfully"
        );
        showToast(
          data.errorMessage ? data.errorMessage : "Get location successfully"
        );
      })
      .catch((error) => {
        setGetLocationStatus("Error fetching location");
      })
      .finally(() => {
        setGetLocationDate(new Date());
        setGetLocationTimer(GET_INTERVAL);
        setIsGettingLocation(false);
      });
  };

  const handleSaveLocation = () => {
    const saveDate = new Date();
    setIsUpdatingLocation(true);
    saveLocation(
      locationInfor.latitude,
      locationInfor.longitude,
      locationInfor.location,
      vehicleNumber,
      saveDate
    )
      .then((res) => {
        setUpdateStatus(res.message);
        showToast(res.message);
      })
      .catch((error) => {
        setUpdateStatus("Error saving location");
        showToast("Error saving location");
      })
      .finally(() => {
        setUpdateLocationDate(new Date());
        setIsUpdatingLocation(false);
      });
  };

  useLayoutEffect(() => {
    const timer = setInterval(() => {
      setGetLocationTimer((prev) => {
        if (prev <= 0) {
          handleGetLocation();
          return GET_INTERVAL; // Reset timer to 10 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    handleGetLocation();
  }, []);

  useEffect(() => {
    checkPermissions().then((permissions) => {
      setHasLocationPermission(permissions.hasLocationPermission);

      if (permissions.hasLocationPermission === false) {
        requestLocationPermission();
      }
    });
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "position"}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="h-full bg-gray-200">
        <ScrollView
          className="p-4 h-full"
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, flexDirection: "column" }}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          <Entypo
            className="mb-12"
            name="location"
            size={140}
            color={"#3b82f6"}
          />
          <View className="bg-white p-4 shadow-lg rounded-md w-full mb-6">
            <View className="mb-4">
              {locationInfor.location && (
                <Text className="font-bold text-xl">
                  {locationInfor.location[0].formattedAddress}
                </Text>
              )}
            </View>

            <View className="mb-2">
              <Text className="font-light text-lg">
                Latitude:{" "}
                {locationInfor.latitude
                  ? String(locationInfor.latitude)
                  : "Cannot get latitude"}
              </Text>
              <Text className="font-light text-lg">
                Longitude:{" "}
                {locationInfor.longitude
                  ? String(locationInfor.longitude)
                  : "Cannot get longitude"}
              </Text>
            </View>

            <View>
              {getLocationDate && (
                <Text className="font-light text-lg">
                  Location updated:{" "}
                  {getLocationDate
                    ? getLocationDate.toLocaleString()
                    : "Not updated yet"}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            className={`w-full shadow-lg bg-sky-500 p-2 py-4 rounded-xl mb-2 ${isGettingLocation ? "opacity-70" : ""}`}
            onPress={handleGetLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <ActivityIndicator size={"small"} />
            ) : (
              <Text className="text-white text-xl text-center">
                Get Current Location
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-full shadow-lg bg-white p-2 py-4 rounded-xl ${isUpdatingLocation ? "opacity-70" : ""}`}
            onPress={handleSaveLocation}
            disabled={isUpdatingLocation}
          >
            {isUpdatingLocation ? (
              <ActivityIndicator size={"small"} />
            ) : (
              <Text className="text-black text-xl text-center">
                Save my location
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
