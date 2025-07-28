export type HistoryItem = {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: number | undefined;
  savedTime: string | undefined;
  vehicleNumber: string | undefined;
};
