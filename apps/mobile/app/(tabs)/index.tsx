import MainFeed from "@/components/feed/mainFeed";
import { View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1">
      <MainFeed />
    </View>
  );
}
