import { ThemedInput } from "@/components/ThemedInput";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MagnifyingGlass from "@/assets/icons/MagnifyingGlass.svg";
import { useState } from "react";

export default function Chat() {
  const [search, setSearch] = useState("");

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View className="px-5 flex-1">
          <ThemedInput
            icon={MagnifyingGlass}
            iconSize={20}
            iconColor="none"
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder="Search"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="bg-[#f5f5f5] text-base text-[#212121]"
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
