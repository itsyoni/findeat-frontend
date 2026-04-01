import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

export default function AddPost() {
  const { user } = useAuth();

  return (
    <SafeAreaView>
      <View className="px-10">
        <Text className="text-black">Hello {user?.username}</Text>
      </View>
    </SafeAreaView>
  );
}
