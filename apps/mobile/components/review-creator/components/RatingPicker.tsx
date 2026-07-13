import Text from "@/components/common/AppText";
import { TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  value?: number;
  onChange: (value: number) => void;
};

const ratings = Array.from({ length: 10 }, (_, i) => i + 1);

export default function RatingPicker({ label, value = 0, onChange }: Props) {
  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-bold text-black dark:text-white">{label}</Text>

        <Text className="font-bold text-black dark:text-white">{value}/10</Text>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-2">
        {ratings.map((rating) => {
          const isActive = value != null && rating <= value;

          return (
            <TouchableOpacity
              key={rating}
              style={{ width: "18.5%" }}
              className={`h-11 items-center justify-center rounded-xl ${
                isActive ? "bg-black dark:bg-white" : "bg-gray-100 dark:bg-gray-800"
              }`}
              onPress={() => onChange(rating)}
            >
              <Text
                className={`font-bold ${
                  isActive ? "text-white dark:text-black" : "text-black dark:text-white"
                }`}
              >
                {rating}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
