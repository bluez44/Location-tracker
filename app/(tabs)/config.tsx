import { NotificationPermissionsButton } from "@/components/PermissionsButton";
import { getRegisteredTasks, unRegisteredLocationTask } from "@/utils/taskManager";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const config = () => {
  const [tasks, setTasks] = useState<any>(null);
  const [unregisterTaskStatus, setUnregisterTaskStatus] = useState<any>(null);

  const clearAlltaskInfor = () => {
    setTasks(null);
    setUnregisterTaskStatus(null);
  };

  return (
    <View>
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
        <Text className="text-white font-bold">Unregister location tasks</Text>
      </TouchableOpacity>
      {unregisterTaskStatus && <Text>Task status: {unregisterTaskStatus}</Text>}
      <TouchableOpacity
        className="my-4 bg-sky-500 p-2 rounded flex items-center justify-center"
        onPress={clearAlltaskInfor}
      >
        <Text className="text-white font-bold">Clear all task infor</Text>
      </TouchableOpacity>
    </View>
  );
};

export default config;
