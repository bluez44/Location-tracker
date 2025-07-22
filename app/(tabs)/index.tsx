import { VEHICLE_NUMBER } from "@/constant/info";
import {
  DISTANCE_INTERVAL,
  DISTANCE_INTERVAL_KEY,
  GET_INTERVAL,
  UPDATE_INTERVAL,
  UPDATE_INTERVAL_KEY,
} from "@/constant/interval";
import { LAST_LOCATION_KEY } from "@/constant/location";
import { LocationInfo } from "@/models/LocationInfo";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import {
  startBackgroundLocation,
  stopBackgroundLocation,
} from "@/utils/background";
import { getUserLocation, saveLocation } from "@/utils/location";
import {
  checkPermissions,
  requestLocationPermission,
} from "@/utils/permissions";
import { getIsDefinedTask } from "@/utils/taskManager";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

    loadFromStorage(LAST_LOCATION_KEY).then((lastSavedLocationRes) => {
      Alert.alert(
        "Last Saved Location",
        JSON.stringify(lastSavedLocationRes, null, 2)
      );
    });

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

  const [intervalType, setIntervalType] = useState<"time" | "distance">("time");

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

      if (permissions.hasLocationPermission === false) {
        requestLocationPermission();
      }
    });
  }, []);

  const [distanceInterval, setDistanceInterval] = useState(DISTANCE_INTERVAL);
  const [updateInterval, setUpdateInterval] = useState(UPDATE_INTERVAL);

  const [isConfigChanged, setIsConfigChanged] = useState(false);

  useLayoutEffect(() => {
    const handleGetLocaldistanceInterval = async () => {
      const distanceInterval: {
        name: string;
        value: number;
      } = await loadFromStorage(DISTANCE_INTERVAL_KEY);
      if (distanceInterval.name === DISTANCE_INTERVAL_KEY) {
        setDistanceInterval(distanceInterval.value);
      }
    };

    handleGetLocaldistanceInterval();
  }, []);

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

  const [isDefinedTask, setIsDefinedTask] = useState(false);

  useEffect(() => {
    const res = getIsDefinedTask();

    setIsDefinedTask(res);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "position"}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="h-full dark:bg-black bg-white border-2">
        <ScrollView
          className="p-4"
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, flexDirection: "column" }}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          <Text className="text-sky-500">Location App</Text>
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
          <Text className="dark:text-white">
            {" "}
            Is background location task defined: {isDefinedTask ? "Yes" : "No"}
          </Text>
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
              Get location after: {getLocationTimer} seconds
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
              Location last save at:{" "}
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

          <Text className="dark:text-white">Choose update mode</Text>
          <View className="my-2 w-[200px] bg-sky-500 rounded">
            <Picker
              selectedValue={intervalType}
              onValueChange={(value) => {
                setIntervalType(value);
                setIsConfigChanged(true);
              }}
              style={{ color: "white" }}
              dropdownIconColor="white"
            >
              <Picker.Item label="Time Interval" value="time" />
              <Picker.Item label="Distance Interval" value="distance" />
            </Picker>
          </View>

          {/* Show only the relevant input */}
          {intervalType === "distance" && (
            <>
              <Text className="dark:text-white">
                Set distance interval (meters)
              </Text>
              <TextInput
                className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center text-white w-[200px] text-center"
                onChangeText={(text) => {
                  setDistanceInterval(Number(text) || 0);
                }}
                onEndEditing={() => setIsConfigChanged(true)}
                value={distanceInterval.toString() || ""}
                keyboardType="numeric"
              />
            </>
          )}
          {intervalType === "time" && (
            <>
              <Text className="dark:text-white">
                Set update interval (seconds)
              </Text>
              <TextInput
                className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center text-white w-[200px] text-center"
                onChangeText={(text) => {
                  setUpdateInterval(parseFloat(Number(text).toFixed(2)) || 0);
                }}
                onEndEditing={() => setIsConfigChanged(true)}
                value={updateInterval.toString() || ""}
                keyboardType="number-pad"
              />
            </>
          )}

          {isConfigChanged && (
            <TouchableOpacity
              className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
              onPress={async () => {
                await stopBackgroundLocation();
                // Only one interval is active, the other is 0
                const dist = intervalType === "distance" ? distanceInterval : 0;
                const time = intervalType === "time" ? updateInterval : 0;
                await startBackgroundLocation(dist, time);
                saveToStorage(UPDATE_INTERVAL_KEY, time, 0);
                saveToStorage(DISTANCE_INTERVAL_KEY, dist, 0);
                setIsConfigChanged(false);
              }}
            >
              <Text className="text-white font-bold">
                Save interval changes
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
            onPress={async () => {
              await stopBackgroundLocation();
            }}
          >
            <Text className="text-white font-bold">
              Stop background location
            </Text>
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
