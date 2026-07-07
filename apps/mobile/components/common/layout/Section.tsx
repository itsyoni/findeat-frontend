import Text from "@/components/common/AppText";
import { View } from "react-native";

type Props = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export default function Section({ title, children, className = "" }: Props) {
  return (
    <View className={`mt-6 ${className}`}>
      {!!title && (
        <Text className="mb-3 text-lg font-bold text-black">{title}</Text>
      )}

      {children}
    </View>
  );
}
