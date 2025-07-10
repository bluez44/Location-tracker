import { LOCATION_HISTORY_KEY } from "@/constant/location";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const res = await loadFromStorage(LOCATION_HISTORY_KEY);
    if (res && Array.isArray(res.value)) {
      setHistory(res.value.reverse()); // Show latest first
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "position"}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="h-full dark:bg-black bg-white border-2 pb-12">
        <ScrollView className="flex-1 bg-white dark:bg-black p-4 relative">
          {history.length === 0 ? (
            <Text className="dark:text-white">No location history found.</Text>
          ) : (
            history.map((item, idx) => (
              <View
                key={idx}
                className="mb-4 p-2 rounded bg-sky-100 dark:bg-sky-900"
              >
                <Text className="dark:text-white">
                  Latitude: {item.latitude}
                </Text>
                <Text className="dark:text-white">
                  Longitude: {item.longitude}
                </Text>
                <Text className="text-gray-500">
                  Timestamp:{" "}
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleString()
                    : "N/A"}
                </Text>
                {item.speed !== undefined && (
                  <Text className="dark:text-white">Speed: {item.speed}</Text>
                )}
                {item.heading !== undefined && (
                  <Text className="dark:text-white">
                    Heading: {item.heading}
                  </Text>
                )}
                {item.savedTime && (
                  <Text className="text-red-300">
                    Saved: {new Date(item.savedTime).toLocaleString()}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
        <View
          className="flex-row flex gap-3 mb-4"
          style={{ justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            onPress={() => {
              fetchHistory();
            }}
            className="mt-4 p-2 rounded bg-sky-100 dark:bg-sky-900"
          >
            <Text className="dark:text-white">Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setHistory([]);
              saveToStorage(LOCATION_HISTORY_KEY, { value: [] }, 0);
            }}
            className="mt-4 p-2 rounded bg-sky-100 dark:bg-sky-900"
          >
            <Text className="dark:text-white">Clear History</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
