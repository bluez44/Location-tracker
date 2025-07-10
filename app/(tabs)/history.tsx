import { LOCATION_HISTORY_KEY } from "@/constant/location";
import { loadFromStorage } from "@/storage/ultils";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await loadFromStorage(LOCATION_HISTORY_KEY);
      if (res && Array.isArray(res.value)) {
        setHistory(res.value.reverse()); // Show latest first
      }
    };
    fetchHistory();
  }, []);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black p-4">
      <Text className="text-xl font-bold mb-4 dark:text-white">
        Location History
      </Text>
      {history.length === 0 ? (
        <Text className="dark:text-white">No location history found.</Text>
      ) : (
        history.map((item, idx) => (
          <View
            key={idx}
            className="mb-4 p-2 rounded bg-sky-100 dark:bg-sky-900"
          >
            <Text className="dark:text-white">Latitude: {item.latitude}</Text>
            <Text className="dark:text-white">Longitude: {item.longitude}</Text>
            <Text className="dark:text-white">
              Timestamp:{" "}
              {item.timestamp
                ? new Date(item.timestamp).toLocaleString()
                : "N/A"}
            </Text>
            {item.speed !== undefined && (
              <Text className="dark:text-white">Speed: {item.speed}</Text>
            )}
            {item.heading !== undefined && (
              <Text className="dark:text-white">Heading: {item.heading}</Text>
            )}
            {item.savedTime && (
              <Text className="dark:text-white">
                Saved: {new Date(item.savedTime).toLocaleString()}
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
