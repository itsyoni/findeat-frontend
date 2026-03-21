import { Button, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  return (
    <SafeAreaView style={{ backgroundColor: "#F7D786", flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View className="px-10 w-full h-full justify-center items-center">
        <Text className="text-black font-bold text-7xl">FINDEAT</Text>
        <View>
          <Button title="Login with Google" />
        </View>
      </View>
    </SafeAreaView>
  );
}
