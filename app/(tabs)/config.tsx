import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";
import { VEHICLE_NUMBER } from "@/constant/info";
import {
  DISTANCE_INTERVAL,
  DISTANCE_INTERVAL_KEY,
  UPDATE_INTERVAL,
  UPDATE_INTERVAL_KEY,
} from "@/constant/interval";
import { MINIMUM_DISTANCE, MINIMUM_TIME } from "@/constant/location";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import {
  startBackgroundLocation,
  stopBackgroundLocation,
} from "@/utils/background";
import { getRegisteredTasks, isDefinedTask } from "@/utils/taskManager";
import { Picker } from "@react-native-picker/picker";
import React, { useLayoutEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const config = () => {
  const [tasks, setTasks] = useState<any>(null);

  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [isVehicleNumChanged, setIsVehicleNumChanged] =
    useState<boolean>(false);

  const [distanceInterval, setDistanceInterval] = useState(DISTANCE_INTERVAL);
  const [updateInterval, setUpdateInterval] = useState(UPDATE_INTERVAL);
  const [intervalType, setIntervalType] = useState<"time" | "distance">("time");
  const [isConfigChanged, setIsConfigChanged] = useState(false);

  const clearAlltaskInfor = () => {
    setTasks(null);
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

  useLayoutEffect(() => {
    const handleGetDistaceIntervalInStorage = async () => {
      const distanceInterval: {
        name: string;
        value: number;
      } = await loadFromStorage(DISTANCE_INTERVAL_KEY);
      if (distanceInterval.name === DISTANCE_INTERVAL_KEY) {
        setDistanceInterval(distanceInterval.value);
      }
    };

    handleGetDistaceIntervalInStorage();
  }, []);

  useLayoutEffect(() => {
    const handleGetUpdateIntervalInStorage = async () => {
      const updateInterval: {
        name: string;
        value: number;
      } = await loadFromStorage(UPDATE_INTERVAL_KEY);
      if (updateInterval.name === UPDATE_INTERVAL_KEY) {
        setUpdateInterval(updateInterval.value);
      }
    };

    handleGetUpdateIntervalInStorage();
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
          <View className="bg-white p-4 shadow-lg rounded-md w-full mb-6 gap-2">
            <Text className="text-xl">Task manager</Text>
            {tasks &&
              (tasks.length > 0 ? (
                <Text className="text-md">
                  {JSON.stringify(tasks, null, 2)}
                </Text>
              ) : (
                <Text className="text-md">No task found</Text>
              ))}
            <TouchableOpacity
              className="bg-sky-500 p-2 rounded-lg flex items-center justify-center"
              onPress={async () => {
                const tasks = await getRegisteredTasks();
                setTasks(tasks);
              }}
            >
              <Text className="text-white">Get registered tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-sky-500 p-2 rounded-lg flex items-center justify-center"
              onPress={() => {
                const tasks = isDefinedTask(LOCATION_TASK_NAME);

                Alert.alert("Task status", `Is task defined: ${tasks}`);
              }}
            >
              <Text className="text-white">Get defined tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-sky-500 p-2 rounded-lg flex items-center justify-center"
              onPress={clearAlltaskInfor}
            >
              <Text className="text-white">Clear all task infor</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white p-4 shadow-lg rounded-md w-full mb-6 gap-2">
            <Text className="text-xl">Vehicle information</Text>
            <TextInput
              className=" bg-sky-500 p-2 rounded-lg text-white"
              placeholder="Enter vehicle number"
              value={vehicleNumber}
              onChangeText={(text) => setVehicleNumber(text)}
              onEndEditing={(e) => {
                setIsVehicleNumChanged(true);
              }}
            />
            {isVehicleNumChanged && (
              <TouchableOpacity
                className="bg-green-700 p-2 rounded-lg flex items-center justify-center"
                onPress={async () => {
                  saveToStorage(VEHICLE_NUMBER, vehicleNumber, 0);
                  setIsVehicleNumChanged(false);
                }}
              >
                <Text className="text-white">Save vehicle number</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="bg-white p-4 shadow-lg rounded-md w-full mb-6 gap-2">
            <Text className="text-xl">Background location</Text>
            <Text className="text-md">Choose update mode</Text>
            <View className="w-full bg-sky-500 rounded-lg">
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
              <View className="w-full flex flex-row items-center gap-2">
                <TextInput
                  className="flex-1 bg-sky-500 p-2 rounded-lg flex items-center justify-center text-white text-center"
                  onChangeText={(text) => {
                    setDistanceInterval(Number(text) || 0);
                  }}
                  onEndEditing={() => {
                    if (distanceInterval < 50) {
                      setDistanceInterval(50);
                    }
                    setIsConfigChanged(true);
                  }}
                  value={distanceInterval.toString() || ""}
                  keyboardType="numeric"
                />
                <Text className="text-center">meters</Text>
              </View>
            )}
            {intervalType === "time" && (
              <View className="w-full flex flex-row items-center gap-2">
                <TextInput
                  className="flex-1 bg-sky-500 p-2 rounded-lg flex items-center justify-center text-white text-center"
                  onChangeText={(text) => {
                    setUpdateInterval(parseFloat(Number(text).toFixed(2)) || 0);
                  }}
                  onEndEditing={() => setIsConfigChanged(true)}
                  value={updateInterval.toString() || ""}
                  keyboardType="number-pad"
                />
                <Text className="text-center">seconds</Text>
              </View>
            )}
            {isConfigChanged && (
              <TouchableOpacity
                className="bg-green-700 p-2 rounded-lg flex items-center justify-center"
                onPress={async () => {
                  await stopBackgroundLocation();
                  // Only one interval is active, the other is 0
                  const dist =
                    intervalType === "distance" ? distanceInterval : 0;
                  const time =
                    intervalType === "time" ? updateInterval : 0;
                  await startBackgroundLocation(dist, time);
                  saveToStorage(UPDATE_INTERVAL_KEY, time, 0);
                  saveToStorage(DISTANCE_INTERVAL_KEY, dist, 0);
                  setIsConfigChanged(false);
                }}
              >
                <Text className="text-white">Start background location</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="bg-red-600 p-2 mt-10 rounded-lg flex items-center justify-center"
              onPress={async () => {
                await stopBackgroundLocation();
              }}
            >
              <Text className="text-white font-bold">
                Stop background location
              </Text>
            </TouchableOpacity>
          </View>

          <View className="justify-self-end">
            <Text className="text-gray-500 text-center">
              Location will be updated when minimum distance difference is{" "}
              {MINIMUM_DISTANCE}m
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default config;
