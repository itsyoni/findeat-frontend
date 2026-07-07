import Text from "@/components/common/AppText";
import type { TextInputProps } from "react-native";

type Props = TextInputProps & {
  label: string;
  isPassword?: boolean;
};

export default function FormInput({
  label,
  multiline,
  isPassword,
  ...props
}: Props) {
  return (
    <>
      <Text className="mb-2 mt-5 text-sm text-gray-500" weight="bold">
        {label}
      </Text>

      <TextInput
        {...props}
        multiline={multiline}
        isPassword={isPassword}
        className={`border-0 bg-[#f8f8f8] ${multiline ? "min-h-32" : ""}`}
      />
    </>
  );
}
