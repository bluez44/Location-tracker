import { LOCATION_TASK_NAME } from "@/constant/backgroundApp";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

const registerTask = async (tasks: string) => {
  let status;
  await TaskManager.isTaskRegisteredAsync(tasks).then(async (res) => {
    if (!res) await BackgroundTask.registerTaskAsync(tasks);
  });

  await TaskManager.isTaskRegisteredAsync(tasks).then((res) => {
    if (res === true) status = "Registered task";

    if (res === false) status = "Unregistered task";
  });

  return status;
};

const getRegisteredTasks = async () => {
  let task;
  await TaskManager.getRegisteredTasksAsync()
    .then((tasks) => (task = tasks))
    .catch((err) => console.log(err));

  return task;
};

const unRegisteredLocationTask = async () => {
  let status;
  if(!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) return "Task is not registered";
  await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME)
    .then((res) => (status = JSON.stringify(res)))
    .catch((err) => (status = JSON.stringify(err)));

  return status;
};

export { getRegisteredTasks, registerTask, unRegisteredLocationTask };
