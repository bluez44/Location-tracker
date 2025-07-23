import { LOCATION_HISTORY_KEY } from "@/constant/location";
import { HistoryItem } from "@/models/History";
import { loadFromStorage, saveToStorage } from "@/storage/ultils";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fetchHistory = async () => {
    const res = await loadFromStorage(LOCATION_HISTORY_KEY);
    if (res && Array.isArray(res.value)) {
      let parsedHistory = res.value.sort((a: HistoryItem, b: HistoryItem) => {
        return (b.timestamp || 0) - (a.timestamp || 0);
      });

      setHistory(parsedHistory); // Show latest first
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
      <SafeAreaView className="h-full bg-gray-200">
        {history.length > 0 ? (
          <FlatList
            className="p-4"
            data={history}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View className="mb-4 p-2 rounded bg-sky-900">
                <Text className="text-white">Latitude: {item.latitude}</Text>
                <Text className="text-white">Longitude: {item.longitude}</Text>
                {item.speed !== undefined && (
                  <Text className="text-white">Speed: {item.speed}</Text>
                )}
                {item.heading !== undefined && (
                  <Text className="text-white">Heading: {item.heading}</Text>
                )}
                <Text className="text-lime-500">
                  Timestamp:{" "}
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleString()
                    : "N/A"}
                </Text>
                {item.savedTime && (
                  <Text className="text-red-300">
                    Saved: {new Date(item.savedTime).toLocaleString()}
                  </Text>
                )}
              </View>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No history found</Text>
          </View>
        )}
        <View
          className="flex-row flex gap-3 mb-4 px-4"
          style={{ justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            onPress={() => {
              fetchHistory();
            }}
            className="mt-4 p-2 rounded bg-sky-900"
          >
            <Text className="text-white">Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setHistory([]);
              saveToStorage(LOCATION_HISTORY_KEY, { value: [] }, 0);
            }}
            className="mt-4 p-2 rounded bg-sky-900"
          >
            <Text className="text-white">Clear History</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
