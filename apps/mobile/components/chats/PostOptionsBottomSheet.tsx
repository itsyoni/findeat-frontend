import AppBottomSheet from "@/components/common/AppBottomSheet";
import Text from "@/components/common/AppText";
import { useAppTheme } from "@/contexts/ThemeContext";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  CaretRightIcon,
  NotePencilIcon,
  TrashIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

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

  function editPost() {
    if (!postId) return;
    const id = postId;
    closeSheet();
    router.push({ pathname: "/posts/edit/[id]", params: { id } });
  }

  return (
    <AppBottomSheet
      open={!!postId}
      snapPoints={["40%"]}
      onClose={closeSheet}
    >
      <BottomSheetView className="flex-1 px-4 pb-5 pt-1">
        {confirmingDelete ? (
          <View className="flex-1 items-center px-2">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/70">
                <WarningCircleIcon size={28} color="#EF4444" weight="fill" />
              </View>
            </View>
            <Text className="mt-4 text-center text-2xl font-bold text-black dark:text-white">
              {t("deletePostTitle")}
            </Text>
            <Text className="mt-2 max-w-sm px-3 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
              {t("deletePostDescription")}
            </Text>

            <View className="mt-auto w-full flex-row gap-3">
              <TouchableOpacity
                disabled={deleting}
                onPress={() => setConfirmingDelete(false)}
                activeOpacity={0.75}
                className="flex-1 items-center rounded-2xl border border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <Text className="font-bold text-black dark:text-white">
                  {t("cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={deleting}
                onPress={() => void confirmDelete()}
                activeOpacity={0.8}
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
            <View className="items-center px-4 pb-4">
              <Text className="text-xl font-bold text-black dark:text-white">
                {t("postOptions")}
              </Text>
              <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("managePost")}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.72}
              accessibilityRole="button"
              className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 dark:border-gray-700 dark:bg-gray-900"
              onPress={editPost}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/40">
                <NotePencilIcon size={21} color="#FF5B35" weight="fill" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-bold text-black dark:text-white">
                  {t("editPost")}
                </Text>
                <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {t("editPostHint")}
                </Text>
              </View>
              <CaretRightIcon
                size={18}
                color={isDark ? "#6B7280" : "#9CA3AF"}
                weight="bold"
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.72}
              accessibilityRole="button"
              className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 dark:border-gray-700 dark:bg-gray-900"
              onPress={() => setConfirmingDelete(true)}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                <TrashIcon size={21} color="#EF4444" weight="fill" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-bold text-black dark:text-white">
                  {t("deletePost")}
                </Text>
                <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {t("deletePostHint")}
                </Text>
              </View>
              <CaretRightIcon
                size={18}
                color={isDark ? "#6B7280" : "#9CA3AF"}
                weight="bold"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeSheet}
              activeOpacity={0.75}
              className="mt-3 items-center rounded-2xl bg-gray-100 py-4 dark:bg-gray-800"
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
