import Text from "@/components/common/AppText";
import { useAppTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import {
  CameraIcon,
  NotePencilIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "phosphor-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { StyleProp, ViewStyle } from "react-native";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";

type Props = {
  style?: StyleProp<ViewStyle>;
};

export default function CreateLauncherButton({ style }: Props) {
  const { t } = useTranslation("create");
  const { isDark } = useAppTheme();
  const [open, setOpen] = useState(false);
  const iconColor = isDark ? "#FFF" : "#171717";

  function openCreator(path: "/create/content" | "/create/review") {
    setOpen(false);
    router.push(path);
  }

  return (
    <View
      className="items-center justify-center"
      style={[style, { zIndex: 100 }]}
    >
      {open && (
        <Animated.View
          entering={FadeInUp.springify().damping(16).stiffness(190)}
          exiting={FadeOutDown.duration(140)}
          className="absolute bottom-20 w-52 overflow-hidden rounded-2xl border border-line bg-surface p-2 dark:border-gray-700 dark:bg-gray-900"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 5 },
            elevation: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => openCreator("/create/content")}
            className="flex-row items-center rounded-xl px-3 py-3"
            activeOpacity={0.7}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-ink dark:bg-white">
              <CameraIcon
                size={20}
                color={isDark ? "#000" : "#FFF"}
                weight="fill"
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-black dark:text-white">
                {t("quickPost")}
              </Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                {t("quickPostSubtitle")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openCreator("/create/review")}
            className="flex-row items-center rounded-xl px-3 py-3"
            activeOpacity={0.7}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand">
              <NotePencilIcon size={20} color="#FFF" weight="fill" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-black dark:text-white">
                {t("review")}
              </Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                {t("reviewLauncherSubtitle")}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity
        onPress={() => setOpen((current) => !current)}
        hitSlop={8}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("create")}
      >
        {open ? (
          <XCircleIcon size={28} color={iconColor} weight="fill" />
        ) : (
          <PlusCircleIcon size={28} color={iconColor} weight="regular" />
        )}
      </TouchableOpacity>
    </View>
  );
}
