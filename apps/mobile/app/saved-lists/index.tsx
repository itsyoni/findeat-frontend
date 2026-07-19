import { EmptyState, Skeleton, SkeletonPulse } from "@/components/common";
import Text from "@/components/common/AppText";
import DirectionalIcon from "@/components/common/icons/DirectionalIcon";
import PlaceListCard from "@/components/lists/PlaceListCard";
import Avatar from "@/components/common/Avatar";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/lib/api";
import type { PlaceListInvitation, PlaceListSummary } from "@findeat/types";
import { router, useFocusEffect } from "expo-router";
import { FolderSimpleIcon, PlusIcon, UserPlusIcon } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedListsScreen() {
  const { t } = useTranslation("common");
  const { isDark } = useAppTheme();
  const { showToast } = useToast();
  const [lists, setLists] = useState<PlaceListSummary[]>([]);
  const [invitations, setInvitations] = useState<PlaceListInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    try {
      const [nextLists, nextInvitations] = await Promise.all([
        api.placeLists.mine(),
        api.placeLists.invitations(),
      ]);
      setLists(nextLists);
      setInvitations(nextInvitations);
    } catch {
      showToast(t("listsLoadError"), { kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function createList() {
    const trimmed = name.trim();
    if (!trimmed || creating) return;
    try {
      setCreating(true);
      const created = await api.placeLists.create({ name: trimmed });
      setLists((current) => [created, ...current]);
      setName("");
      setShowCreate(false);
      showToast(t("listCreated"));
    } catch {
      showToast(t("listCreateError"), { kind: "error" });
    } finally {
      setCreating(false);
    }
  }

  async function respondToInvitation(
    invitation: PlaceListInvitation,
    accept: boolean,
  ) {
    try {
      await api.placeLists.respondToInvitation(invitation.id, accept);
      setInvitations((current) =>
        current.filter((item) => item.id !== invitation.id),
      );
      if (accept) await load();
      showToast(t(accept ? "listInvitationAccepted" : "listInvitationDeclined"));
    } catch {
      showToast(t("listInvitationError"), { kind: "error" });
    }
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FBFAF8" }}
    >
      <View className="h-14 flex-row items-center px-4">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          hitSlop={12}
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
        >
          <DirectionalIcon
            direction="back"
            variant="arrow"
            size={24}
            color={isDark ? "#FFF" : "#171717"}
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-black dark:text-white">
          {t("myLists")}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("createNewList")}
          hitSlop={12}
          onPress={() => setShowCreate((current) => !current)}
          className="h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950"
        >
          <PlusIcon size={22} color="#D97706" weight="bold" />
        </TouchableOpacity>
      </View>

      {showCreate ? (
        <View className="mx-5 mb-3 mt-2 flex-row items-center rounded-2xl border border-amber-200 bg-white p-2 dark:border-amber-900 dark:bg-gray-900">
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder={t("listNamePlaceholder")}
            placeholderTextColor="#9CA3AF"
            maxLength={80}
            returnKeyType="done"
            onSubmitEditing={() => void createList()}
            style={{
              flex: 1,
              minHeight: 42,
              paddingHorizontal: 10,
              color: isDark ? "#FFF" : "#111",
              fontSize: 16,
              textAlign: "auto",
            }}
          />
          <TouchableOpacity
            disabled={!name.trim() || creating}
            onPress={() => void createList()}
            className="h-10 min-w-20 items-center justify-center rounded-xl bg-amber-500 px-4"
            style={{ opacity: !name.trim() || creating ? 0.45 : 1 }}
          >
            {creating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-bold text-white">{t("create")}</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <SkeletonPulse>
          <View className="flex-row flex-wrap justify-between px-5 pt-4">
            {[0, 1, 2, 3].map((item) => (
              <View key={item} className="mb-5 w-[48%]">
                <Skeleton height={160} radius={22} />
                <Skeleton width="75%" height={17} radius={6} style={{ marginTop: 10 }} />
                <Skeleton width="40%" height={13} radius={6} style={{ marginTop: 7 }} />
              </View>
            ))}
          </View>
        </SkeletonPulse>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 28,
          }}
          renderItem={({ item }) => (
            <PlaceListCard
              list={item}
              onPress={() =>
                router.push({
                  pathname: "/saved-lists/[id]",
                  params: { id: item.id },
                })
              }
            />
          )}
          ListHeaderComponent={
            invitations.length ? (
              <View className="mb-4">
                <View className="mb-2 flex-row items-center">
                  <UserPlusIcon size={19} color="#D97706" weight="fill" />
                  <Text className="ml-2 text-lg font-bold text-black dark:text-white">
                    {t("listInvitations")}
                  </Text>
                </View>
                {invitations.map((invitation) => (
                  <View
                    key={invitation.id}
                    className="mb-2 flex-row items-center rounded-2xl border border-amber-100 bg-white p-3 dark:border-amber-950 dark:bg-gray-900"
                  >
                    <Avatar
                      uri={invitation.invitedBy.avatarUrl}
                      username={invitation.invitedBy.username}
                      size={42}
                    />
                    <View className="ml-3 min-w-0 flex-1">
                      <Text numberOfLines={1} className="font-bold text-black dark:text-white">
                        {invitation.list.name}
                      </Text>
                      <Text numberOfLines={1} className="mt-0.5 text-xs text-gray-500">
                        {t("listInvitedBy", {
                          name:
                            invitation.invitedBy.displayName ||
                            invitation.invitedBy.username,
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => void respondToInvitation(invitation, false)}
                      className="rounded-xl bg-gray-100 px-3 py-2 dark:bg-gray-800"
                    >
                      <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        {t("decline")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => void respondToInvitation(invitation, true)}
                      className="ml-2 rounded-xl bg-amber-500 px-3 py-2"
                    >
                      <Text className="text-xs font-bold text-white">{t("accept")}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon={FolderSimpleIcon}
              title={t("noLists")}
              description={t("noListsHint")}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
