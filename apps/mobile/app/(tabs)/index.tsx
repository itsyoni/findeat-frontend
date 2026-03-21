import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <View className="px-10">
        <Text className="text-white">Hello</Text>
      </View>
    </SafeAreaView>
  );
}
