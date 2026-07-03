import Text from "@/components/common/AppText";
import { ReviewDishDraft } from "@findeat/types/review";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DishCard from "../components/DishCard";

type Props = {
  items: ReviewDishDraft[];
  onBack: () => void;
  onAddDish: () => void;
  onNext: () => void;
};

export default function DishesStep({
  items,
  onBack,
  onAddDish,
  onNext,
}: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 40,
        }}
      >
        <TouchableOpacity onPress={onBack}>
          <Text className="font-bold text-black">← Back</Text>
        </TouchableOpacity>

        <Text className="mt-6 text-3xl font-bold text-black">
          What did you order?
        </Text>

        {items.length === 0 ? (
          <View className="mt-10 items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16">
            <Text className="text-center text-lg font-bold text-black">
              No dishes yet
            </Text>

            <Text className="mt-2 text-center text-gray-500">
              Add the dishes you tried during the meal.
            </Text>
          </View>
        ) : (
          <View className="mt-8 gap-4">
            {items.map((item) => (
              <DishCard key={item.id} item={item} />
            ))}
          </View>
        )}

        <TouchableOpacity
          className="mt-6 rounded-2xl border border-black py-4"
          onPress={onAddDish}
        >
          <Text className="text-center font-bold text-black">+ Add dish</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`mt-4 rounded-2xl py-4 ${
            items.length > 0 ? "bg-black" : "bg-gray-200"
          }`}
          disabled={items.length === 0}
          onPress={onNext}
        >
          <Text
            className={`text-center font-bold ${
              items.length > 0 ? "text-white" : "text-gray-400"
            }`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
