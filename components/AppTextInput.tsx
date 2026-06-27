import { EyeClosedIcon, EyeIcon } from "phosphor-react-native";
import { ReactNode, forwardRef, useState } from "react";
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
};

const TextInput = forwardRef<RNTextInput, Props>(
  (
    {
      style,
      className,
      leftIcon,
      rightIcon,
      isPassword = false,
      value,
      onChangeText,
      placeholderTextColor,
      ...props
    },
    ref,
  ) => {
    const [hidden, setHidden] = useState(isPassword);

    return (
      <View
        className={`flex-row items-center rounded-2xl border border-gray-300 px-4 ${className ?? ""}`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <RNTextInput
          ref={ref}
          {...props}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && hidden}
          placeholderTextColor={placeholderTextColor ?? "#9CA3AF"}
          style={[
            {
              flex: 1,
              paddingVertical: 16,
              fontSize: 16,
              color: "#000",
              fontFamily: "CabinetRegular",
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
  },
);

TextInput.displayName = "TextInput";

export default TextInput;
