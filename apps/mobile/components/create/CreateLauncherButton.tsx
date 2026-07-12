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
import { TouchableOpacity, View } from "react-native";

export default function CreateLauncherButton() {
  const { t } = useTranslation("create");
  const { isDark } = useAppTheme();
  const [open, setOpen] = useState(false);
  const iconColor = isDark ? "#FFF" : "#000";

  function openCreator(path: "/create/content" | "/create/review") {
    setOpen(false);
    router.push(path);
  }

  return (
    <View className="flex-1 items-center justify-center" style={{ zIndex: 100 }}>
      {open && (
        <View
          className="absolute bottom-14 w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
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
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-black dark:bg-white">
              <CameraIcon size={20} color={isDark ? "#000" : "#FFF"} weight="fill" />
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
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F7D786]">
              <NotePencilIcon size={20} color="#111" weight="fill" />
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
        </View>
      )}

      <TouchableOpacity
        onPress={() => setOpen((current) => !current)}
        hitSlop={8}
      >
        {open ? (
          <XCircleIcon size={30} color={iconColor} weight="fill" />
        ) : (
          <PlusCircleIcon size={30} color={iconColor} weight="regular" />
        )}
      </TouchableOpacity>
    </View>
  );
}
