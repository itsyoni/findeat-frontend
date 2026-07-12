import { TextInput } from "@/components/common";
import Text from "@/components/common/AppText";
import { View } from "react-native";

type Props = {
  label: string;
  value?: number;
  onChange: (value?: number) => void;
};

export default function PriceInput({ label, value, onChange }: Props) {
  return (
    <View>
      <Text className="mb-3 font-bold text-black dark:text-white">{label}</Text>

      <TextInput
        className="rounded-2xl border border-gray-200 px-4 py-4 text-base text-black dark:border-gray-700 dark:text-white"
        placeholder="₪0"
        keyboardType="decimal-pad"
        value={value != null ? String(value) : ""}
        onChangeText={(text) => {
          const clean = text.replace(/[^\d.]/g, "");

          if (!clean) {
            onChange(undefined);
            return;
          }

          const number = Number(clean);

          if (!Number.isNaN(number)) {
            onChange(number);
          }
        }}
      />
    </View>
  );
}
