import { useEffect } from "react";
import { Platform, Alert } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import * as Device from "expo-device";

export const useCheckBatteryOptimization = () => {
  useEffect(() => {
    const checkBatteryOptimization = async () => {
      if (Platform.OS !== "android") return;

      // Một số thiết bị Android yêu cầu kiểm tra battery optimization riêng
      const manufacturer = (Device.manufacturer || "").toLowerCase();

      // Với các hãng hay "giết app"
      const knownAggressiveVendors = ["xiaomi", "oppo", "vivo", "realme", "huawei", "samsung"];

      if (knownAggressiveVendors.includes(manufacturer)) {
        Alert.alert(
          "Tắt tối ưu pin",
          "Để ứng dụng theo dõi vị trí hoạt động ổn định trong nền, bạn cần tắt chế độ tiết kiệm pin hoặc tối ưu hóa pin cho ứng dụng này.",
          [
            {
              text: "Mở cài đặt",
              onPress: () => {
                IntentLauncher.startActivityAsync(
                  IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                );
              },
            },
            {
              text: "Bỏ qua",
              style: "cancel",
            },
          ]
        );
      }
    };

    checkBatteryOptimization();
  }, []);
};
