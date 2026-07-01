import Text from "@/components/AppText";
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
        <Text className="font-bold text-black">{label}</Text>

        <Text className="font-bold text-black">{value}/10</Text>
      </View>

      <View className="flex-row gap-2">
        {ratings.map((rating) => {
          const isActive = value != null && rating <= value;

          return (
            <TouchableOpacity
              key={rating}
              className={`h-11 flex-1 items-center justify-center rounded-xl ${
                isActive ? "bg-black" : "bg-gray-100"
              }`}
              onPress={() => onChange(rating)}
            >
              <Text
                className={`font-bold ${
                  isActive ? "text-white" : "text-black"
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
