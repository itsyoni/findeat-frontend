import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  useEffect(() => {
    api.get("/").then((res) => {
      console.log("Backend response:", res.data);
    });
  }, []);

  const { user, logout } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-2xl font-bold">Welcome to FindEat</Text>

      <Text className="mb-6 text-gray-600">Logged in as {user?.username}</Text>

      <TouchableOpacity
        className="rounded-2xl bg-black px-6 py-4"
        onPress={logout}
      >
        <Text className="font-bold text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
