import { VEHICLE_NUMBER } from "@/constant/info";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import { getRegisteredTasks } from "@/utils/taskManager";
import React, { useLayoutEffect, useState } from "react";
import {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "position"}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="px-5 flex justify-center flex-col h-full dark:bg-black">
        <ScrollView
          className="p-4"
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
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
              <Text className="dark:text-white">
                {JSON.stringify(tasks, null, 2)}
              </Text>
            ) : (
              <Text className="dark:text-white">No task found</Text>
            ))}
          <TouchableOpacity
            className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
            onPress={clearAlltaskInfor}
          >
            <Text className="text-white font-bold">Clear all task infor</Text>
          </TouchableOpacity>

          <View>
            <Text className="dark:text-white">Enter vehicle number</Text>
            <TextInput
              className="my-4 bg-sky-500 p-2 rounded text-white"
              placeholder="Enter vehicle number"
              value={vehicleNumber}
              onChangeText={(text) => setVehicleNumber(text)}
              onEndEditing={(e) => {
                setIsVehicleNumChanged(true);
              }}
            />
          </View>
          {isVehicleNumChanged && (
            <TouchableOpacity
              className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
              onPress={async () => {
                saveToStorage(VEHICLE_NUMBER, vehicleNumber, 0);
                setIsVehicleNumChanged(false);
              }}
            >
              <Text className="text-white font-bold">Save vehicle number</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default config;
