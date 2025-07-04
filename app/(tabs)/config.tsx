import { NotificationPermissionsButton } from "@/components/PermissionsButton";
import { VEHICLE_NUMBER } from "@/constant/info";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import { getRegisteredTasks, unRegisteredLocationTask } from "@/utils/taskManager";
import React, { useLayoutEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView, SafeAreaView } from "react-native";

const config = () => {
  const [tasks, setTasks] = useState<any>(null);
  const [unregisterTaskStatus, setUnregisterTaskStatus] = useState<any>(null);

  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [isVehicleNumChanged, setIsVehicleNumChanged] = useState<boolean>(false);

  const clearAlltaskInfor = () => {
    setTasks(null);
    setUnregisterTaskStatus(null);
  };

  useLayoutEffect(() => {
    const handleGetVehicleNumber = async () => {
      const res =await loadFromStorage(VEHICLE_NUMBER)

      if(res.name === VEHICLE_NUMBER){
        setVehicleNumber(res.value)
      }
    }

    handleGetVehicleNumber()
  }, [])

  return (
    <SafeAreaView className="px-5 flex justify-center flex-col h-full dark:bg-black">
      <ScrollView>
        <NotificationPermissionsButton />
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
            const status = await unRegisteredLocationTask();

            setUnregisterTaskStatus(status);
          }}
        >
          <Text className="text-white font-bold">
            Unregister location tasks
          </Text>
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
  );
};

export default config;
