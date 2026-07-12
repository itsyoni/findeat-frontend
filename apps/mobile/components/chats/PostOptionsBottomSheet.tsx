import AppBottomSheet from "@/components/common/AppBottomSheet";
import Text from "@/components/common/AppText";
import { useAppTheme } from "@/contexts/ThemeContext";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  DotsThreeOutlineIcon,
  TrashIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

type Props = {
  postId: string | null;
  onClose: () => void;
  onDelete: (postId: string) => void | Promise<void>;
};

export default function PostOptionsBottomSheet({
  postId,
  onClose,
  onDelete,
}: Props) {
  const { t } = useTranslation("common");
  const { isDark } = useAppTheme();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function closeSheet() {
    setConfirmingDelete(false);
    setDeleting(false);
    onClose();
  }

  async function confirmDelete() {
    if (!postId || deleting) return;

    try {
      setDeleting(true);
      await onDelete(postId);
      closeSheet();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppBottomSheet open={!!postId} snapPoints={["36%"]} onClose={closeSheet}>
      <BottomSheetView className="flex-1 px-5 pb-7 pt-1">
        {confirmingDelete ? (
          <View className="flex-1">
            <View className="items-center">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                <WarningCircleIcon size={29} color="#EF4444" weight="fill" />
              </View>
              <Text className="mt-3 text-xl font-bold text-black dark:text-white">
                {t("deletePostTitle")}
              </Text>
              <Text className="mt-2 px-4 text-center text-sm leading-5 text-gray-500">
                {t("deletePostDescription")}
              </Text>
            </View>

            <View className="mt-auto flex-row gap-3">
              <TouchableOpacity
                disabled={deleting}
                onPress={() => setConfirmingDelete(false)}
                className="flex-1 items-center rounded-2xl bg-gray-100 py-4 dark:bg-gray-800"
              >
                <Text className="font-bold text-black dark:text-white">
                  {t("cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={deleting}
                onPress={() => void confirmDelete()}
                className="flex-1 items-center rounded-2xl bg-red-500 py-4"
              >
                {deleting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-bold text-white">
                    {t("deletePost")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-1">
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <DotsThreeOutlineIcon
                  size={23}
                  color={isDark ? "#FFF" : "#111"}
                  weight="fill"
                />
              </View>
              <View className="ml-3">
                <Text className="text-xl font-bold text-black dark:text-white">
                  {t("postOptions")}
                </Text>
                <Text className="mt-0.5 text-sm text-gray-500">
                  {t("managePost")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="mt-5 flex-row items-center rounded-2xl bg-red-50 px-4 py-4 dark:bg-red-950/30"
              onPress={() => setConfirmingDelete(true)}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/70">
                <TrashIcon size={21} color="#DC2626" weight="fill" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-bold text-red-600 dark:text-red-400">
                  {t("deletePost")}
                </Text>
                <Text className="mt-0.5 text-sm text-red-500/70">
                  {t("deletePostHint")}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeSheet}
              className="mt-auto items-center rounded-2xl bg-gray-100 py-4 dark:bg-gray-800"
            >
              <Text className="font-bold text-black dark:text-white">
                {t("cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetView>
    </AppBottomSheet>
  );
}
