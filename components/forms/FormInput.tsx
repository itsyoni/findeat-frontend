import Text from "@/components/common/AppText";
import TextInput from "@/components/common/AppTextInput";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad" | "url" | "email-address";
};

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  autoCapitalize,
  keyboardType,
}: Props) {
  return (
    <>
      <Text className="mb-2 mt-5 text-sm text-gray-500" weight="bold">
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        className={`border-0 bg-[#f8f8f8] ${multiline ? "min-h-32" : ""}`}
      />
    </>
  );
}
