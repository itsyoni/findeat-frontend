import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolViewProps } from "expo-symbols";
import type { ComponentProps } from "react";
import type { ColorValue, StyleProp, TextStyle } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

type SymbolName = Extract<SymbolViewProps["name"], string>;

type IconMapping = Partial<Record<SymbolName, MaterialIconName>>;

const MAPPING: IconMapping = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
};

type IconSymbolProps = {
  name: SymbolName;
  size?: number;
  color: ColorValue;
  style?: StyleProp<TextStyle>;
};

export function IconSymbol({ name, size = 24, color, style }: IconSymbolProps) {
  const materialIconName = MAPPING[name];

  if (!materialIconName) {
    return null;
  }

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={materialIconName}
      style={style}
    />
  );
}
