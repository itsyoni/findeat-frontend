import Text from "@/components/common/AppText";
import type { ProfileTagKey } from "@findeat/types";
import { TagIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import ProfileTagDetailsBottomSheet from "./ProfileTagDetailsBottomSheet";

export default function ProfileTagBadge({ tag }: { tag?: ProfileTagKey | null }) {
  const { t } = useTranslation("profile");
  const [detailsOpen, setDetailsOpen] = useState(false);
  if (!tag) return null;

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t(`profileTags.${tag}.name`)}
        activeOpacity={0.7}
        onPress={() => setDetailsOpen(true)}
        className="mt-2 flex-row items-center rounded-full bg-amber-100 px-3 py-1.5 dark:bg-amber-950"
      >
        <TagIcon size={14} color="#D97706" weight="fill" />
        <Text className="ml-1.5 text-xs font-bold text-amber-800 dark:text-amber-200">
          {t(`profileTags.${tag}.name`)}
        </Text>
      </TouchableOpacity>
      <ProfileTagDetailsBottomSheet
        tag={detailsOpen ? tag : null}
        unlocked
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
}
