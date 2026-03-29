import { ThemedButton } from "@/components/ThemedButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/auth/welcome");
  };
  return (
    <View className="flex-1 items-center justify-end bg-white p-10">
      <ThemedButton
        onPress={handleLogout}
        className="w-full bg-red-500 py-2 rounded-full"
      >
        <Text className="text-white font-cabinet-bold text-2xl">Log out</Text>
      </ThemedButton>
    </View>
  );
}
