import { ThemedButton } from "@/components/ThemedButton";
import { useRouter } from "expo-router";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ backgroundColor: "#F7D786", flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View className="px-10 w-full h-full justify-center items-center">
        <Text className="text-black font-bold text-7xl">FINDEAT</Text>
        <View className="w-full flex-col items-center gap-5 mt-10">
          <ThemedButton
            className="w-full rounded-full"
            onPress={() => router.push("/auth/login")}
          >
            <Text className="text-base font-semibold text-white">Log In</Text>
          </ThemedButton>
          <ThemedButton
            className="w-full rounded-full bg-transparent border-2 border-black"
            onPress={() => router.push("/auth/register")}
          >
            <Text className="text-base font-semibold text-black">Sign Up</Text>
          </ThemedButton>
        </View>
      </View>
    </SafeAreaView>
  );
}
