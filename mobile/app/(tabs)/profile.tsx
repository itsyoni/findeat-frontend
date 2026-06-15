import { useAuth } from "@/contexts/AuthContext";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Text className="text-3xl font-bold text-black">Profile</Text>

      <View className="mt-8 rounded-3xl border border-gray-200 p-5">
        <Text className="text-sm text-gray-500">Username</Text>
        <Text className="mt-1 text-xl font-bold">@{user?.username}</Text>

        <Text className="mt-5 text-sm text-gray-500">Email</Text>
        <Text className="mt-1 text-base text-black">{user?.email}</Text>
      </View>

      <TouchableOpacity
        className="mt-8 rounded-2xl bg-black py-4"
        onPress={logout}
      >
        <Text className="text-center font-bold text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
