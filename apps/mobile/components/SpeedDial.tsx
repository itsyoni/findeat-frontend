import { useState } from "react";
import { Text, View } from "react-native";
import { ThemedButton } from "@/components/ThemedButton";
import { Icon } from "@/components/Icon";
import Plus from "@/assets/icons/Plus.svg";

type SpeedDialAction = {
  key: string;
  label: string;
  icon: any;
  onPress: () => void;
};

type SpeedDialProps = {
  actions: SpeedDialAction[];
  mainIcon?: any;
};

const MAIN_SIZE = 50;
const ACTION_SIZE = 40;
const ACTION_RIGHT_OFFSET = (MAIN_SIZE - ACTION_SIZE) / 2;

export default function SpeedDial({
  actions,
  mainIcon = Plus,
}: SpeedDialProps) {
  const [open, setOpen] = useState(false);

  return (
    <View className="relative items-end">
      {open && (
        <View className="absolute bottom-20 right-0 gap-3">
          {actions.map((action) => (
            <View
              key={action.key}
              className="flex-row items-center justify-end"
            >
              <View className="w-20 justify-center items-center">
                <Text className="text-white text-xl font-cabinet-medium">
                  {action.label}
                </Text>
              </View>

              <View style={{ marginRight: ACTION_RIGHT_OFFSET }}>
                <ThemedButton
                  onPress={() => {
                    action.onPress();
                    setOpen(false);
                  }}
                  className="bg-white rounded-full items-center justify-center"
                  style={{ width: ACTION_SIZE, height: ACTION_SIZE }}
                >
                  <Icon Icon={action.icon} color="black" size={22} />
                </ThemedButton>
              </View>
            </View>
          ))}
        </View>
      )}

      <ThemedButton
        onPress={() => setOpen((prev) => !prev)}
        className="bg-white rounded-full items-center justify-center"
        style={{ width: MAIN_SIZE, height: MAIN_SIZE }}
      >
        <Icon Icon={mainIcon} color="black" size={30} />
      </ThemedButton>
    </View>
  );
}
