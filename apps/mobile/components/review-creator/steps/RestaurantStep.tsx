import Text from "@/components/common/AppText";
import RestaurantSearch from "@/components/restaurants/RestaurantSearch";
import { SelectedRestaurant } from "@findeat/types/restaurant";
import { TouchableOpacity, View } from "react-native";
import { ThemedSafeAreaView } from "@/components/common";

type Props = {
  selectedRestaurant: SelectedRestaurant | null;
  onSelect: (restaurant: SelectedRestaurant) => void;
  onNext: () => void;
};

export default function RestaurantStep({
  selectedRestaurant,
  onSelect,
  onNext,
}: Props) {
  return (
    <ThemedSafeAreaView className="px-6 pt-8">
      <Text className="text-3xl font-bold text-black dark:text-white">
        Where did you eat?
      </Text>

      <RestaurantSearch
        selectedRestaurant={selectedRestaurant}
        onSelect={onSelect}
      />

      <View className="flex-1" />

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
