import Text from "@/components/common/AppText";
import RestaurantSearch from "@/components/restaurants/RestaurantSearch";
import { SelectedRestaurant } from "@findeat/types/restaurant";
import { TouchableOpacity, View } from "react-native";
import { ThemedSafeAreaView } from "@/components/common";

type Props = {
  selectedRestaurant: SelectedRestaurant | null;
  onSelect: (restaurant: SelectedRestaurant | null) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function RestaurantStep({
  selectedRestaurant,
  onSelect,
  onBack,
  onNext,
}: Props) {
  return (
    <ThemedSafeAreaView
      style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}
    >
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={onBack} className="py-2 pr-4">
          <Text className="font-bold text-black dark:text-white">← Back</Text>
        </TouchableOpacity>
        <Text className="text-sm font-semibold text-gray-400">1 of 4</Text>
      </View>
      <Text className="text-3xl font-bold text-black dark:text-white">
        Where did you eat?
      </Text>

      <Text className="mt-2 text-gray-500">
        Start by choosing the place you want to review.
      </Text>

      <RestaurantSearch
        selectedRestaurant={selectedRestaurant}
        onSelect={onSelect}
      />

      <TouchableOpacity
        className={`rounded-2xl py-4 ${
          selectedRestaurant ? "bg-black" : "bg-gray-200"
        }`}
        disabled={!selectedRestaurant}
        onPress={onNext}
      >
        <Text
          className={`text-center font-bold ${
            selectedRestaurant ? "text-white" : "text-gray-400"
          }`}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </ThemedSafeAreaView>
  );
}
