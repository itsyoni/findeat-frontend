import { MagnifyingGlassIcon } from "phosphor-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import TextInput from "./AppTextInput";

type SearchBarProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
  onPress?: () => void;
  rightAccessory?: React.ReactNode;
};

export default function SearchBar({
  value = "",
  onChangeText,
  placeholder = "Search...",
  autoFocus = false,
  editable = true,
  onPress,
  rightAccessory,
}: SearchBarProps) {
  function startsWithRtl(text: string) {
    const firstStrongChar = text.trim().match(/[\p{L}\p{N}]/u)?.[0];

    if (!firstStrongChar) return false;

    return /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(firstStrongChar);
  }

  const isRtl = startsWithRtl(value);

  const input = (
    <TextInput
      editable={editable}
      className="border-0 bg-[#F5F4F5] h-full"
      style={{
        textAlign: isRtl ? "right" : "left",
        writingDirection: isRtl ? "rtl" : "ltr",
      }}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      leftIcon={<MagnifyingGlassIcon size={20} color="#9CA3AF" />}
    />
  );

  return (
    <View className="flex-row items-center gap-3 p-5 h-24">
      <View className="flex-1">
        {!editable ? (
          <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <View pointerEvents="none">{input}</View>
          </TouchableOpacity>
        ) : (
          input
        )}
      </View>

      {rightAccessory}
    </View>
  );
}
