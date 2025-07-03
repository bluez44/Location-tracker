import PermissionsButton from "@/components/PermissionsButton";
import { GET_INTERVAL, UPDATE_INTERVAL } from "@/constant/interval";
import { LocationInfo } from "@/models/LocationInfo";
import { initBackgroundLocation } from "@/utils/background";
import { getUserLocation, saveLocation } from "@/utils/location";
import { schedulePushNotification, schedulePushNotificationWithOnlyData } from "@/utils/notification";
import {
  checkPermissions,
  requestCameraPermission,
  requestLocationPermission,
  requestMediaPermission,
} from "@/utils/permissions";
import { getRegisteredTasks, unRegisteredAllTasks } from "@/utils/taskManager";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

initBackgroundLocation();

export default function Index() {
  const [locationInfor, setLocationInfor] = useState<LocationInfo>({
    latitude: 0,
    longitude: 0,
    location: null,
    errorMessage: "",
  });
  const [hasLocationPermission, setHasLocationPermission] =
    useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] =
    useState<boolean>(false);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean>(false);

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
  const [updateLocationTimer, setUpdateLocationTimer] =
    useState<number>(UPDATE_INTERVAL);

  const [tasks, setTasks] = useState<any>(null);
  const [unregisterTaskStatus, setUnregisterTaskStatus] = useState<any>(null);

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
      locationInfor.location
    )
      .then((res) => {
        setUpdateStatus(res.message);
      })
      .catch((error) => {
        setUpdateStatus("Error saving location");
      })
      .finally(() => {
        setUpdateLocationTimer(UPDATE_INTERVAL);
        setUpdateLocationDate(new Date());
        setIsUpdatingLocation(false);
      });
  };

  const clearAlltaskInfor = () => {
    setTasks(null);
    setUnregisterTaskStatus(null);
  };

  useLayoutEffect(() => {
    const timer = setInterval(() => {
      if (updateLocationTimer <= 0) {
        handleSaveLocation();
        setUpdateLocationTimer(UPDATE_INTERVAL); // Reset timer to 10 seconds
        return;
      }
      setUpdateLocationTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [updateLocationTimer]);

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
      setHasCameraPermission(permissions.hasCameraPermission);
      setHasMediaPermission(permissions.hasMediaPermission);
    });
  }, []);

  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
      console.log("AppState changed to", nextAppState);
      schedulePushNotificationWithOnlyData({ appState: nextAppState });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView className="">
      <ScrollView>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-sky-500">Location App</Text>
          <Text>Current app state: {appState}</Text>
          <Text>
            Latitude:{" "}
            {locationInfor.latitude
              ? String(locationInfor.latitude)
              : "Cannot get latitude"}
          </Text>
          <Text>
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
            <Text>Location: {locationInfor.location[0].formattedAddress}</Text>
          )}
          <View style={{ marginTop: 20 }}>
            <Text>Permissions:</Text>
            {hasLocationPermission ? (
              <Text>Location is accepted</Text>
            ) : (
              <View>
                <Text>Location is denied</Text>
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

            {hasCameraPermission ? (
              <Text>Camera is accepted</Text>
            ) : (
              <View>
                <Text>Camera is denied</Text>
                <TouchableOpacity
                  onPress={async () => {
                    const { status } = await requestCameraPermission();
                    if (status === "granted") {
                      setHasCameraPermission(true);
                    } else {
                      setHasCameraPermission(false);
                    }
                  }}
                >
                  <Text
                    style={{
                      color: "blue",
                      textDecorationLine: "underline",
                    }}
                  >
                    Request Camera Permission
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {hasMediaPermission ? (
              <Text>Media is accepted</Text>
            ) : (
              <View>
                <Text>Media is denied</Text>
                <TouchableOpacity
                  onPress={async () => {
                    const { status } = await requestMediaPermission();
                    if (status === "granted") {
                      setHasMediaPermission(true);
                    } else {
                      setHasMediaPermission(false);
                    }
                  }}
                >
                  <Text
                    style={{
                      color: "blue",
                      textDecorationLine: "underline",
                    }}
                  >
                    Request Media Permission
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View className="mt-4 justify-content-between flex items-center">
            {getLocationDate && (
              <Text className="mt-4">
                Location last get at:{" "}
                {getLocationDate
                  ? getLocationDate.toLocaleTimeString()
                  : "Not updated yet"}
              </Text>
            )}
            <Text className="mt-4">
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
          <View className="mt-4 justify-content-between flex items-center">
            {updateLocationDate && (
              <Text className="mt-4">
                Location last save at:{" "}
                {updateLocationDate
                  ? updateLocationDate.toLocaleTimeString()
                  : "Not updated yet"}
              </Text>
            )}
            <Text className="mt-4">
              Save location every {UPDATE_INTERVAL} seconds. Time left:{" "}
              {updateLocationTimer} seconds
            </Text>
            {updateStatus &&
            (updateStatus.includes("successfully") ||
              updateStatus.includes("saved")) ? (
              <Text className="mt-2 text-green-500">{updateStatus}</Text>
            ) : (
              <Text className="mt-2 text-red-500">{updateStatus}</Text>
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
          <PermissionsButton />
          <TouchableOpacity
            className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
            onPress={async () => {
              const tasks = await getRegisteredTasks();
              setTasks(tasks);
            }}
          >
            <Text className="text-white font-bold">Get registered tasks</Text>
          </TouchableOpacity>
          {tasks &&
            (tasks.length > 0 ? (
              <Text>{JSON.stringify(tasks, null, 2)}</Text>
            ) : (
              <Text>No task found</Text>
            ))}
          <TouchableOpacity
            className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
            onPress={async () => {
              const status = await unRegisteredAllTasks();

              setUnregisterTaskStatus(status);
            }}
          >
            <Text className="text-white font-bold">Unregister all tasks</Text>
          </TouchableOpacity>
          {unregisterTaskStatus && (
            <Text>Task status: {unregisterTaskStatus}</Text>
          )}
          <TouchableOpacity
            className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
            onPress={clearAlltaskInfor}
          >
            <Text className="text-white font-bold">Clear all task infor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
