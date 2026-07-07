import Text from "@/components/common/AppText";
import type { IconProps } from "phosphor-react-native";
import type { ComponentType } from "react";
import { View } from "react-native";

type Props = {
  title: string;
  description?: string;
  icon?: ComponentType<IconProps>;
};

export default function EmptyState({ title, description, icon: Icon }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {Icon && <Icon size={56} color="#9CA3AF" weight="light" />}

      <Text className="mt-4 text-center text-xl font-bold text-black">
        {title}
      </Text>

      {!!description && (
        <Text className="mt-2 text-center text-gray-500">{description}</Text>
      )}
    </View>
  );
}
