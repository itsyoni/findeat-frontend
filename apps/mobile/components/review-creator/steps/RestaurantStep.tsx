import Text from "@/components/common/AppText";
import RestaurantSearch from "@/components/restaurants/RestaurantSearch";
import { SelectedRestaurant } from "@findeat/types/restaurant";
import { TouchableOpacity, View } from "react-native";
import { Skeleton, SkeletonPulse, ThemedSafeAreaView } from "@/components/common";

type Props = {
  selectedRestaurant: SelectedRestaurant | null;
  onSelect: (restaurant: SelectedRestaurant | null) => void;
  onBack: () => void;
  loading?: boolean;
};

export default function RestaurantStep({
  selectedRestaurant,
  onSelect,
  onBack,
  loading = false,
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

      {loading ? (
        <SkeletonPulse style={{ marginTop: 24 }}>
          <Skeleton height={52} radius={17} />
          <Skeleton width="38%" height={16} radius={7} style={{ marginTop: 24, marginBottom: 12 }} />
          {Array.from({ length: 6 }, (_, index) => <View key={index} className="flex-row items-center py-3"><Skeleton width={54} height={54} circle /><View className="ml-3 flex-1 gap-2"><Skeleton width="62%" height={15} radius={7} /><Skeleton width="48%" height={11} radius={6} /></View></View>)}
        </SkeletonPulse>
      ) : (
        <RestaurantSearch selectedRestaurant={selectedRestaurant} onSelect={onSelect} />
      )}
    </ThemedSafeAreaView>
  );
}
