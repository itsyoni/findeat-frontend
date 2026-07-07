import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { EyeClosedIcon, EyeIcon } from "phosphor-react-native";
import { ReactNode, useState } from "react";
import {
  TextInput as RNTextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

type Props = TextInputProps & {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
  useBottomSheetInput?: boolean;
};

function startsWithRtl(text?: string) {
  if (!text) return false;

  for (const char of text.trim()) {
    if (/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(char)) {
      return true;
    }

    if (/[A-Za-z0-9]/.test(char)) {
      return false;
    }
  }

  return false;
}

export default function TextInput({
  style,
  className,
  leftIcon,
  rightIcon,
  isPassword = false,
  useBottomSheetInput = false,
  value,
  onChangeText,
  placeholderTextColor,
  ...props
}: Props) {
  const [hidden, setHidden] = useState(isPassword);
  const isRtl = startsWithRtl(value);
  const Input = useBottomSheetInput ? BottomSheetTextInput : RNTextInput;
  const isMultiline = !!props.multiline;

  return (
    <View
      className={`flex-row rounded-2xl border border-gray-300 px-4 ${
        isMultiline ? "items-start" : "items-center"
      } ${className ?? ""}`}
    >
      {leftIcon && (
        <View className={`${isMultiline ? "mt-4" : ""} mr-3`}>{leftIcon}</View>
      )}

      <Input
        {...props}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword && hidden}
        placeholderTextColor={placeholderTextColor ?? "#9CA3AF"}
        textAlign={isRtl ? "right" : "left"}
        textAlignVertical={isMultiline ? "top" : "center"}
        style={[
          {
            flex: 1,
            paddingVertical: 16,
            fontSize: 16,
            color: "#000",
            fontFamily: "CabinetRegular",
            writingDirection: isRtl ? "rtl" : "ltr",
            minHeight: isMultiline ? 120 : undefined,
          },
          style,
        ]}
      />

      {isPassword ? (
        <TouchableOpacity onPress={() => setHidden((prev) => !prev)}>
          {hidden ? (
            <EyeIcon size={20} color="#000" />
          ) : (
            <EyeClosedIcon size={20} color="#000" />
          )}
        </TouchableOpacity>
      ) : (
        rightIcon && <View className="ml-3">{rightIcon}</View>
      )}
    </View>
  );
}
