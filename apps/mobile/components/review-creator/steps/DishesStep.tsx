import Text from "@/components/common/AppText";
import { ReviewDishDraft } from "@findeat/types/review";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedSafeAreaView } from "@/components/common";
import DishCard from "../components/DishCard";

type Props = {
  items: ReviewDishDraft[];
  onBack: () => void;
  onAddCustomDish: () => void;
  onAddMenuDish: () => void;
  onRemoveDish: (id: string) => void;
  onNext: () => void;
};

export default function DishesStep({
  items,
  onBack,
  onAddCustomDish,
  onAddMenuDish,
  onRemoveDish,
  onNext,
}: Props) {
  return (
    <ThemedSafeAreaView>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 40,
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onBack}>
            <Text className="font-bold text-black dark:text-white">← Back</Text>
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-gray-400">3 of 4</Text>
        </View>

        <Text className="mt-6 text-3xl font-bold text-black dark:text-white">
          What did you order?
        </Text>

        <Text className="mt-2 text-gray-500">
          Add dishes if you want to rate them individually, or skip this step.
        </Text>

        <View className="mt-7 gap-3">
          <TouchableOpacity
            className="rounded-2xl bg-black px-4 py-4 dark:bg-white"
            onPress={onAddMenuDish}
          >
            <Text className="text-center font-bold text-white dark:text-black">
              Choose from restaurant menu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="py-2" onPress={onAddCustomDish}>
            <Text className="text-center font-bold text-gray-500">
              Can’t find it? Add a custom dish
            </Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View className="mt-6 items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 dark:border-gray-700 dark:bg-gray-900">
            <Text className="text-center text-lg font-bold text-black dark:text-white">
              No dishes yet
            </Text>

            <Text className="mt-2 text-center text-gray-500">
              This is optional. You can continue with only the restaurant review.
            </Text>
          </View>
        ) : (
          <View className="mt-8 gap-4">
            {items.map((item) => (
              <DishCard
                key={item.id}
                item={item}
                onRemove={() => onRemoveDish(item.id)}
              />
            ))}
          </View>
        )}

        <TouchableOpacity
          className="mt-7 rounded-2xl bg-black py-4 dark:bg-white"
          onPress={onNext}
        >
          <Text className="text-center font-bold text-white dark:text-black">
            {items.length > 0 ? "Review everything" : "Skip dishes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}
