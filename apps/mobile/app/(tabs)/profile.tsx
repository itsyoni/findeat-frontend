import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedButton } from "@/components/ThemedButton";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-5 flex-1 flex flex-col items-start justify-between">
        <Text className="text-black text-7xl">Hello {user?.username}</Text>
        <ThemedButton
          className="mt-6 rounded-full bg-black px-6 py-3 w-full"
          onPress={() => router.push("/settings")}
        >
          <Text className="text-white">Open Settings</Text>
        </ThemedButton>
      </View>
    </SafeAreaView>
  );
}
