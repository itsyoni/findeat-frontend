import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedButton } from "@/components/ThemedButton";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView>
      <View className="px-10">
        <Text className="text-black">Hello {user?.username}</Text>
        <ThemedButton
          className="mt-6 rounded-full bg-black px-6 py-3"
          onPress={() => router.push("/settings")}
        >
          <Text className="text-white">Open Settings</Text>
        </ThemedButton>
      </View>
    </SafeAreaView>
  );
}
