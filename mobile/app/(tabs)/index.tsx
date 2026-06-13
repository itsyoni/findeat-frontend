import { useEffect } from "react";
import { Text, View } from "react-native";
import { api } from "@/lib/api";

export default function HomeScreen() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const res = await api.get("/health");
        console.log("Backend response:", res.data);
      } catch (error) {
        console.error("Connection failed:", error);
      }
    };

    testConnection();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to NativeWind!
      </Text>
    </View>
  );
}