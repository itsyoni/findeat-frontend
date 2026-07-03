import Text from "@/components/common/AppText";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  onBack: () => void;
  onCustom: () => void;
  onFromMenu: () => void;
};

export default function DishSourceStep({
  onBack,
  onCustom,
  onFromMenu,
}: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="flex-1 px-6 pt-8">
        <TouchableOpacity onPress={onBack}>
          <Text className="font-bold text-black">← Back</Text>
        </TouchableOpacity>

        <Text className="mt-6 text-3xl font-bold text-black">Add dish</Text>

        <Text className="mt-2 text-gray-500">
          Choose a dish from the restaurant menu or add it manually.
        </Text>

        <View className="mt-8 gap-4">
          <TouchableOpacity
            className="rounded-3xl bg-black p-6"
            onPress={onFromMenu}
          >
            <Text className="text-xl font-bold text-white">From menu</Text>
            <Text className="mt-2 text-white/70">
              Link this dish to the restaurant menu.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-3xl bg-[#F5F4F5] p-6"
            onPress={onCustom}
          >
            <Text className="text-xl font-bold text-black">Custom dish</Text>
            <Text className="mt-2 text-gray-500">
              Add a special, temporary, or missing dish.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
