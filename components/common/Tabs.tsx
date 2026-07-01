import { TouchableOpacity, View } from "react-native";
import Text from "./AppText";

export type TabItem<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (value: T) => void;
};

export default function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: Props<T>) {
  return (
    <View className="flex-row border-b border-gray-100 bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <TouchableOpacity
            key={tab.value}
            className="flex-1 py-4"
            onPress={() => onChange(tab.value)}
          >
            <Text
              weight="bold"
              className={`text-center ${
                isActive ? "text-black" : "text-gray-400"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
