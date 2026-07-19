import Text from "@/components/common/AppText";
import { getCreatorLevel } from "@findeat/types";
import { MedalIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";

type Props = {
  score?: number;
  onPress?: () => void;
};

function badgeColors(score: number) {
  if (score >= 1000) return { background: "#4C1D95", foreground: "#F5F3FF" };
  if (score >= 300) return { background: "#9A3412", foreground: "#FFF7ED" };
  if (score >= 75) return { background: "#B45309", foreground: "#FFFBEB" };
  if (score >= 10) return { background: "#166534", foreground: "#F0FDF4" };
  return { background: "#E5E7EB", foreground: "#374151" };
}

export default function CreatorLevelBadge({ score = 0, onPress }: Props) {
  const { t } = useTranslation("profile");
  const level = getCreatorLevel(score);
  const colors = badgeColors(score);

  return (
    <TouchableOpacity
      accessibilityRole={onPress ? "button" : "text"}
      disabled={!onPress}
      activeOpacity={0.75}
      onPress={onPress}
      className="mt-2 flex-row items-center rounded-full px-3 py-1.5"
      style={{ backgroundColor: colors.background }}
    >
      <MedalIcon size={14} color={colors.foreground} weight="fill" />
      <Text className="ml-1.5 text-xs font-bold" style={{ color: colors.foreground }}>
        {t(`creatorLevels.${level.key}`)}
      </Text>
    </TouchableOpacity>
  );
}
