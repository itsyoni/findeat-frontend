import AppBottomSheet from "@/components/common/AppBottomSheet";
import Text from "@/components/common/AppText";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/lib/api";
import { AppAlert as Alert } from "@/lib/appAlert";
import type { PlaceListSummary } from "@findeat/types";
import { BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import {
  BookmarkSimpleIcon,
  CheckIcon,
  FolderSimpleIcon,
  PlusIcon,
} from "phosphor-react-native";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SaveToListsContextValue = {
  openSaveToLists: (restaurantId: string) => void;
};

const SaveToListsContext = createContext<SaveToListsContextValue | null>(null);

export function SaveToListsProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation("common");
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [lists, setLists] = useState<PlaceListSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState("");

  const close = useCallback(() => {
    setRestaurantId(null);
    setShowCreate(false);
    setNewListName("");
  }, []);

  const openSaveToLists = useCallback(
    (nextRestaurantId: string) => {
      setRestaurantId(nextRestaurantId);
      setLoading(true);
      setShowCreate(false);
      setNewListName("");
      void api.placeLists
        .forRestaurant(nextRestaurantId)
        .then((result) => {
          setLists(result.lists);
          setSelectedIds(new Set(result.selectedListIds));
        })
        .catch(() => {
          Alert.alert(t("listsLoadError"));
          close();
        })
        .finally(() => setLoading(false));
    },
    [close, t],
  );

  const toggleList = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const createList = useCallback(async () => {
    const name = newListName.trim();
    if (!name || !restaurantId || creating) return;
    try {
      setCreating(true);
      const list = await api.placeLists.create({
        name,
        restaurantId,
      });
      setLists((current) => [list, ...current]);
      setSelectedIds((current) => new Set(current).add(list.id));
      setNewListName("");
      setShowCreate(false);
      showToast(t("listCreated"));
    } catch {
      Alert.alert(t("listCreateError"));
    } finally {
      setCreating(false);
    }
  }, [creating, newListName, restaurantId, showToast, t]);

  const save = useCallback(async () => {
    if (!restaurantId || saving) return;
    try {
      setSaving(true);
      await api.placeLists.setRestaurantLists(
        restaurantId,
        Array.from(selectedIds),
      );
      showToast(t("savedToLists"));
      close();
    } catch {
      Alert.alert(t("listsSaveError"));
    } finally {
      setSaving(false);
    }
  }, [close, restaurantId, saving, selectedIds, showToast, t]);

  const value = useMemo(() => ({ openSaveToLists }), [openSaveToLists]);

  return (
    <SaveToListsContext.Provider value={value}>
      {children}
      <AppBottomSheet
        open={!!restaurantId}
        snapPoints={["72%"]}
        onClose={close}
      >
        <View className="flex-1 px-5 pt-1">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
              <BookmarkSimpleIcon size={22} color="#D97706" weight="fill" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xl font-bold text-black dark:text-white">
                {t("saveToLists")}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {t("saveToListsHint")}
              </Text>
            </View>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#D97706" />
            </View>
          ) : (
            <BottomSheetScrollView
              className="mt-5"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-row items-center rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-700">
                  <BookmarkSimpleIcon size={20} color="#D97706" weight="fill" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-black dark:text-white">
                    {t("allSavedPlaces")}
                  </Text>
                  <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {t("allSavedPlacesHint")}
                  </Text>
                </View>
                <View className="h-7 w-7 items-center justify-center rounded-full bg-amber-500">
                  <CheckIcon size={15} color="white" weight="bold" />
                </View>
              </View>

              {lists.map((list) => {
                const selected = selectedIds.has(list.id);
                return (
                  <TouchableOpacity
                    key={list.id}
                    activeOpacity={0.75}
                    disabled={!list.canEdit}
                    onPress={() => toggleList(list.id)}
                    className="mt-3 flex-row items-center rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
                    style={{ opacity: list.canEdit ? 1 : 0.65 }}
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60">
                      <FolderSimpleIcon
                        size={21}
                        color="#D97706"
                        weight={selected ? "fill" : "regular"}
                      />
                    </View>
                    <View className="ml-3 min-w-0 flex-1">
                      <Text
                        numberOfLines={1}
                        className="font-bold text-black dark:text-white"
                      >
                        {list.name}
                      </Text>
                      <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {list.canEdit
                          ? t("placesCount", { count: list.itemCount })
                          : t("sharedListViewOnly")}
                      </Text>
                    </View>
                    <View
                      className={`h-7 w-7 items-center justify-center rounded-full border ${
                        selected
                          ? "border-amber-500 bg-amber-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {selected ? (
                        <CheckIcon size={15} color="white" weight="bold" />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {showCreate ? (
                <View className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                  <BottomSheetTextInput
                    autoFocus
                    value={newListName}
                    onChangeText={setNewListName}
                    placeholder={t("listNamePlaceholder")}
                    placeholderTextColor="#9CA3AF"
                    maxLength={80}
                    returnKeyType="done"
                    onSubmitEditing={() => void createList()}
                    className="rounded-xl bg-white px-4 py-3 text-base text-black dark:bg-gray-900 dark:text-white"
                  />
                  <View className="mt-3 flex-row justify-end gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        setShowCreate(false);
                        setNewListName("");
                      }}
                      className="rounded-full px-4 py-2.5"
                    >
                      <Text className="font-bold text-gray-600 dark:text-gray-300">
                        {t("cancel")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={!newListName.trim() || creating}
                      onPress={() => void createList()}
                      className="rounded-full bg-amber-500 px-5 py-2.5"
                      style={{ opacity: !newListName.trim() || creating ? 0.45 : 1 }}
                    >
                      <Text className="font-bold text-white">
                        {creating ? t("saving") : t("create")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowCreate(true)}
                  className="mt-3 flex-row items-center justify-center rounded-2xl border border-dashed border-amber-300 p-4 dark:border-amber-800"
                >
                  <PlusIcon size={18} color="#D97706" weight="bold" />
                  <Text className="ml-2 font-bold text-amber-700 dark:text-amber-300">
                    {t("createNewList")}
                  </Text>
                </TouchableOpacity>
              )}
            </BottomSheetScrollView>
          )}

          <TouchableOpacity
            disabled={loading || saving}
            onPress={() => void save()}
            className="mb-2 mt-3 items-center rounded-2xl bg-black py-4 dark:bg-white"
            style={{
              marginBottom: Math.max(insets.bottom, 8),
              opacity: loading || saving ? 0.5 : 1,
            }}
          >
            <Text className="font-bold text-white dark:text-black">
              {saving ? t("saving") : t("done")}
            </Text>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>
    </SaveToListsContext.Provider>
  );
}

export function useSaveToLists() {
  const context = useContext(SaveToListsContext);
  if (!context) {
    throw new Error("useSaveToLists must be used inside SaveToListsProvider");
  }
  return context;
}
