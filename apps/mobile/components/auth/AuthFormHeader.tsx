import Text from "@/components/common/AppText";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

type Props = {
  title: string;
  subtitle: string;
};

export default function AuthFormHeader({ title, subtitle }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith("he");
  const directionStyle = {
    textAlign: isRtl ? ("auto" as const) : ("center" as const),
    writingDirection: isRtl ? ("rtl" as const) : ("ltr" as const),
  };

  return (
    <View>
      <Text
        weight="bold"
        className="text-2xl text-[#212121] dark:text-white"
        style={directionStyle}
      >
        {title}
      </Text>
      <Text
        className="mb-6 mt-1 text-gray-500"
        style={directionStyle}
      >
        {subtitle}
      </Text>
    </View>
  );
}
