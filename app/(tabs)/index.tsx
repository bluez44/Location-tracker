import { VEHICLE_NUMBER } from "@/constant/info";
import {
  GET_INTERVAL,
  UPDATE_INTERVAL,
  UPDATE_INTERVAL_KEY,
} from "@/constant/interval";
import { LocationInfo } from "@/models/LocationInfo";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import {
  initBackgroundLocation,
  initBackgroundNotification,
  startBackgroundLocation,
} from "@/utils/background";
import { getUserLocation, saveLocation } from "@/utils/location";
import { schedulePushNotification } from "@/utils/notification";
import {
  checkPermissions,
  requestLocationPermission,
} from "@/utils/permissions";
import { unRegisteredLocationTask } from "@/utils/taskManager";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

initBackgroundLocation();
initBackgroundNotification();

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
          console.error("No location data returned");
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
    setIsUpdatingLocation(true);
    saveLocation(
      locationInfor.latitude,
      locationInfor.longitude,
      locationInfor.location,
      vehicleNumber
    )
      .then((res) => {
        setUpdateStatus(res.message);
      })
      .catch((error) => {
        setUpdateStatus("Error saving location");
      })
      .finally(() => {
        setUpdateLocationDate(new Date());
        setIsUpdatingLocation(false);
      });
  };

  useLayoutEffect(() => {
    const timer = setInterval(() => {
      if (getLocationTimer <= 0) {
        handleGetLocation();
        setGetLocationTimer(GET_INTERVAL); // Reset timer to 10 seconds
        return;
      }
      setGetLocationTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [getLocationTimer]);

  useEffect(() => {
    handleGetLocation();
  }, []);

  useEffect(() => {
    checkPermissions().then((permissions) => {
      setHasLocationPermission(permissions.hasLocationPermission);
    });
  }, []);

  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
      schedulePushNotification("AppState changed to", nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const [updateInterval, setUpdateInterval] = useState(0);
  const [isChanged, setIsChanged] = useState(false);

  useLayoutEffect(() => {
    const handleGetLocalUpdateInterval = async () => {
      const updateInterval: {
        name: string;
        value: number;
      } = await loadFromStorage(UPDATE_INTERVAL_KEY);
      if (updateInterval.name === UPDATE_INTERVAL_KEY) {
        setUpdateInterval(updateInterval.value);
      }
    };

    handleGetLocalUpdateInterval();
  }, []);

  return (
    <SafeAreaView className="h-full dark:bg-black bg-white ">
      <ScrollView>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-sky-500">Location App</Text>
          <Text className="dark:text-white">Current app state: {appState}</Text>
          <Text className="dark:text-white">
            Latitude:{" "}
            {locationInfor.latitude
              ? String(locationInfor.latitude)
              : "Cannot get latitude"}
          </Text>
          <Text className="dark:text-white">
            Longitude:{" "}
            {locationInfor.longitude
              ? String(locationInfor.longitude)
              : "Cannot get longitude"}
          </Text>
          {locationInfor.errorMessage && (
            <Text style={{ color: "red" }}>
              Error: {locationInfor.errorMessage}
            </Text>
          )}
          {locationInfor.location && (
            <Text className="dark:text-white">
              Location: {locationInfor.location[0].formattedAddress}
            </Text>
          )}
          <View style={{ marginTop: 20 }}>
            {hasLocationPermission ? (
              <Text className="text-green-500">Location is accepted</Text>
            ) : (
              <View>
                <Text className="text-red-500">Location is denied</Text>
                <TouchableOpacity
                  onPress={async () => {
                    const { status } = await requestLocationPermission();
                    if (status === "granted") {
                      setHasLocationPermission(true);
                    } else {
                      setHasLocationPermission(false);
                    }
                  }}
                >
                  <Text
                    style={{
                      color: "blue",
                      textDecorationLine: "underline",
                    }}
                  >
                    Request Location Permission
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View className="mt-4 justify-content-between flex items-center">
            {getLocationDate && (
              <Text className="mt-4 dark:text-white">
                Location last get at:{" "}
                {getLocationDate
                  ? getLocationDate.toLocaleTimeString()
                  : "Not updated yet"}
              </Text>
            )}
            <Text className="mt-4 dark:text-white">
              Get location every {GET_INTERVAL} seconds. Time left:{" "}
              {getLocationTimer} seconds
            </Text>
            {isGettingLocation ? (
              <View className="my-4">
                <ActivityIndicator size={"large"} />
              </View>
            ) : (
              <TouchableOpacity
                className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
                onPress={handleGetLocation}
              >
                <Text className="text-white font-bold">
                  Get Current Location
                </Text>
              </TouchableOpacity>
            )}
            {getLocationStatus &&
            (getLocationStatus.includes("successfully") ||
              getLocationStatus.includes("saved")) ? (
              <Text className="mt-2 text-green-500">{getLocationStatus}</Text>
            ) : (
              <Text className="mt-2 text-red-500">{getLocationStatus}</Text>
            )}
          </View>
          {isUpdatingLocation ? (
            <View className="my-4">
              <ActivityIndicator size={"large"} />
            </View>
          ) : (
            <TouchableOpacity
              className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
              onPress={handleSaveLocation}
            >
              <Text className="text-white font-bold">Save my location</Text>
            </TouchableOpacity>
          )}
          {updateLocationDate && (
            <Text className="mt-4 dark:text-white">
              Location last get at:{" "}
              {updateLocationDate
                ? updateLocationDate.toLocaleTimeString()
                : "Not updated yet"}
            </Text>
          )}
          {updateStatus &&
          (updateStatus.includes("successfully") ||
            updateStatus.includes("saved")) ? (
            <Text className="mt-2 text-green-500">{updateStatus}</Text>
          ) : (
            <Text className="mt-2 text-red-500">{updateStatus}</Text>
          )}
          <Text className="dark:text-white">Set update interval (seconds)</Text>
          <TextInput
            className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center text-white w-[200px] text-center"
            onChangeText={(text) => {
              setUpdateInterval(Number(text));
              setIsChanged(true);
            }}
            value={updateInterval.toString()}
            placeholder="useless placeholder"
            keyboardType="numeric"
          />
          {isChanged && (
            <TouchableOpacity
              className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
              onPress={async () => {
                const res = await unRegisteredLocationTask();
                await startBackgroundLocation(updateInterval);
                saveToStorage(UPDATE_INTERVAL_KEY, updateInterval, 0);
                setIsChanged(false);
              }}
            >
              <Text className="text-white font-bold">Save update interval</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
