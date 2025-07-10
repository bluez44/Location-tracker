import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";
import * as TaskManager from "expo-task-manager";
import { schedulePushNotification } from "./notification";

const registerTask = async (tasks: string) => {
  let status;
  await TaskManager.isTaskRegisteredAsync(tasks).then((res) => {
    if (res === true) status = "Registered task";

    if (res === false) status = "Unregistered task";
  });

  return status;
};

const getIsDefinedTask = () => {
  return TaskManager.isTaskDefined(LOCATION_TASK_NAME);
};

const getRegisteredTasks = async () => {
  let task;
  await TaskManager.getRegisteredTasksAsync()
    .then((tasks) => (task = tasks))
    .catch((err) => console.log("err", err));

  return task;
};

const unRegisteredLocationTask = async () => {
  let status;
  await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME)
    .then((res) => {
      status = "Unregistered task";
      schedulePushNotification("Location task unregistered sucessed", status);
    })
    .catch((err) => {
      status = JSON.stringify(err);
      schedulePushNotification("Location task unregistered failed", status);
    });

  return status;
};

export {
  getIsDefinedTask,
  getRegisteredTasks,
  registerTask,
  unRegisteredLocationTask,
};
