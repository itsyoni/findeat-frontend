import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedButton } from "@/components/ThemedButton";

export default function HomeScreen() {
  const { user } = useAuth();
  const { signOut } = useAuth();

  return (
    <SafeAreaView>
      <View className="px-10">
        <Text className="text-black">Hello {user?.username}</Text>
        <ThemedButton onPress={signOut}><Text className="text-black bg-red-500">Log out</Text></ThemedButton>
      </View>
    </SafeAreaView>
  );
}
