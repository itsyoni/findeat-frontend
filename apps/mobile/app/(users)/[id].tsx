import { Skeleton, SkeletonList, SkeletonPulse } from "@/components/common";
import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import FullScreenImageViewer from "@/components/common/FullScreenImageViewer";
import Tabs from "@/components/common/Tabs";
import ProfileManagedRestaurants from "@/components/profile/ProfileManagedRestaurants";
import ProfileDetails from "@/components/profile/ProfileDetails";
import ProfilePostGrid from "@/components/profile/ProfilePostGrid";
import ProfileActionsBottomSheet from "@/components/profile/ProfileActionsBottomSheet";
import ReportBottomSheet from "@/components/moderation/ReportBottomSheet";
import { useUserProfile } from "@/hooks/useUserProfile";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PostType } from "@findeat/types/post";
import {
  filterPostsByType,
  getRelationshipButtonColor,
  getRelationshipButtonText,
  isFollowingRelationship,
  isFriendRelationship,
} from "@findeat/utils";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import {
  DotsThreeIcon,
  ProhibitIcon,
} from "phosphor-react-native";
import DirectionalIcon from "@/components/common/icons/DirectionalIcon";
import { useMemo, useState } from "react";
import { Alert, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const { t } = useTranslation(["common", "profile"]);
  const queryClient = useQueryClient();
  const [activeFeed, setActiveFeed] = useState<PostType>("CONTENT");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const {
    profile: user,
    setProfile: setUser,
    loading,
  } = useUserProfile(id as string);

  const posts = useMemo(
    () => filterPostsByType(user?.posts, activeFeed),
    [user, activeFeed],
  );

  async function toggleFollow() {
    if (!user) return;

    try {
      const shouldUnfollow = isFollowingRelationship(user.relationship);

      const result = shouldUnfollow
        ? await api.users.unfollow(user.id)
        : await api.users.follow(user.id);

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              relationship: result.relationship,
              isFollowing: isFollowingRelationship(result.relationship),
              followersCount: shouldUnfollow
                ? Math.max(0, currentUser.followersCount - 1)
                : currentUser.followersCount + 1,
            }
          : currentUser,
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function startChat() {
    if (!user) return;

    try {
      const chat = await api.chats.startDirectConversation(user.id);

      router.push({
        pathname: "/chats/[id]",
        params: { id: chat.id },
      });
    } catch (error) {
      console.error(error);
    }
  }

  function confirmBlock() {
    if (!user) return;
    setOptionsOpen(false);

    Alert.alert(
      t("profile:blockUserTitle", { username: user.username }),
      t("profile:blockUserDescription"),
      [
        { text: t("common:cancel"), style: "cancel" },
        {
          text: t("profile:block"),
          style: "destructive",
          onPress: () => {
            void api.users
              .block(user.id)
              .then(() => {
                void queryClient.invalidateQueries({ queryKey: ["feed"] });
                router.back();
              })
              .catch((error) => {
                console.error("Could not block user", error);
                Alert.alert(t("common:error"), t("profile:blockUserError"));
              });
          },
        },
      ],
    );
  }

  if (currentUser?.id === id) {
    return <Redirect href="/(tabs)/profile" />;
  }

  if (loading) {
    return (
      <View className="flex-1 bg-canvas dark:bg-black">
        <SkeletonPulse>
          <View className="relative">
            <Skeleton height={240} radius={0} />
            <SafeAreaView edges={["top"]} style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
              <View className="mt-2 flex-row justify-between px-4"><Skeleton width={44} height={44} circle /><Skeleton width={44} height={44} circle /></View>
            </SafeAreaView>
          </View>
          <View className="-mt-7 items-center rounded-t-[30px] bg-white pb-5 dark:bg-black">
            <Skeleton width={112} height={112} circle style={{ marginTop: -48 }} />
            <Skeleton width="48%" height={23} radius={9} style={{ marginTop: 12 }} />
            <Skeleton width="28%" height={13} radius={6} style={{ marginTop: 8 }} />
            <View className="mt-5 w-full flex-row">{[0, 1, 2].map((item) => <View key={item} className="flex-1 items-center gap-2"><Skeleton width={38} height={19} radius={7} /><Skeleton width={58} height={11} radius={6} /></View>)}</View>
            <View className="mt-5 w-full flex-row gap-3 px-5"><Skeleton width="48%" height={44} radius={12} /><Skeleton width="48%" height={44} radius={12} /></View>
          </View>
        </SkeletonPulse>
        <Tabs activeTab="CONTENT" onChange={() => undefined} tabs={[{ label: t("common:content"), value: "CONTENT" }, { label: t("common:reviews"), value: "REVIEW" }]} />
        <SkeletonList variant="grid" count={9} />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-canvas dark:bg-black">
        <TouchableOpacity
          className="ml-4 mt-2 h-11 w-11 items-center justify-center"
          onPress={() => router.back()}
        >
          <DirectionalIcon direction="back" size={24} color="#6B7280" weight="bold" />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-8 pb-20">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
            <ProhibitIcon size={34} color="#6B7280" weight="bold" />
          </View>
          <Text className="mt-5 text-xl font-bold text-black dark:text-white">
            {t("profile:userUnavailable")}
          </Text>
          <Text className="mt-2 text-center text-gray-500">
            {t("profile:userUnavailableHint")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-canvas dark:bg-black">
      <View className="flex-1">
        <View className="relative">
          {user.coverUrl ? (
            <Image
              source={{ uri: user.coverUrl }}
              className="h-60 w-full bg-gray-200"
              resizeMode="cover"
            />
          ) : (
            <View className="h-60 w-full bg-gray-200 dark:bg-gray-800" />
          )}

          <SafeAreaView
            edges={["top"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <View className="mt-2 flex-row items-center justify-between px-4">
              <TouchableOpacity
                className="h-11 w-11 items-center justify-center rounded-full bg-black/30"
                onPress={() => router.back()}
              >
                <DirectionalIcon direction="back" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                className="h-11 w-11 items-center justify-center rounded-full bg-black/30"
                onPress={() => setOptionsOpen(true)}
              >
                <DotsThreeIcon size={25} color="white" weight="bold" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View className="-mt-7 flex-1 rounded-t-[30px] bg-white dark:bg-black">
          <View className="-mt-12 items-center px-5">
            <TouchableOpacity
              activeOpacity={user.avatarUrl ? 0.8 : 1}
              disabled={!user.avatarUrl}
              accessibilityRole={user.avatarUrl ? "imagebutton" : undefined}
              accessibilityLabel={user.avatarUrl ? "Open profile picture" : undefined}
              onPress={() => setAvatarOpen(true)}
              className="rounded-full bg-white p-1.5 dark:bg-black"
            >
              <Avatar uri={user.avatarUrl} username={user.username} size={100} />
            </TouchableOpacity>
          </View>
        <View className="items-center px-5">
          <Text className="mt-2 text-2xl font-bold text-black dark:text-white">
            {user.displayName || user.username}
          </Text>
          <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            @{user.username}
          </Text>

          <View className="w-full">
            <ProfileManagedRestaurants memberships={user.restaurantMemberships} />
          </View>

          {!!user.bio && (
            <Text className="mt-4 text-center text-base text-black dark:text-white">{user.bio}</Text>
          )}

          <ProfileDetails profile={user} />

          <View className="mt-5 w-full flex-row">
            <View className="flex-1">
              <Text className="text-center text-xl font-bold text-black dark:text-white">{user.posts.length}</Text>
              <Text className="mt-1 text-center text-sm text-gray-500">{t("profile:posts")}</Text>
            </View>

            <TouchableOpacity
              className="flex-1"
              onPress={() =>
                router.push({
                  pathname: "/(users)/connections",
                  params: { id: user.id, type: "followers" },
                })
              }
            >
              <Text className="text-center text-xl font-bold text-black dark:text-white">{user.followersCount}</Text>
              <Text className="mt-1 text-center text-sm text-gray-500">{t("profile:followers")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1"
              onPress={() =>
                router.push({
                  pathname: "/(users)/connections",
                  params: { id: user.id, type: "following" },
                })
              }
            >
              <Text className="text-center text-xl font-bold text-black dark:text-white">{user.followingCount}</Text>
              <Text className="mt-1 text-center text-sm text-gray-500">{t("profile:following")}</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-5 w-full flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 rounded-2xl py-4 ${getRelationshipButtonColor(user.relationship)}`}
              onPress={toggleFollow}
            >
              <Text
                className={`text-center font-bold ${
                  isFriendRelationship(user.relationship)
                    ? "text-black"
                    : "text-white dark:text-black"
                }`}
              >
                {getRelationshipButtonText(user.relationship)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-2xl border border-gray-200 py-4 dark:border-gray-700"
              onPress={startChat}
            >
              <Text className="text-center font-bold text-black dark:text-white">
                {t("profile:message")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Tabs
          activeTab={activeFeed}
          onChange={setActiveFeed}
          tabs={[
            { label: t("common:content"), value: "CONTENT" },
            { label: t("common:reviews"), value: "REVIEW" },
          ]}
        />

        <View style={{ flex: 1 }}>
          <ProfilePostGrid
            posts={posts}
            type={activeFeed}
            onPressPost={(postId) => {
              router.push({
                pathname:
                  activeFeed === "CONTENT"
                    ? "/(users)/content-feed"
                    : "/(users)/reviews-feed",
                params: {
                  userId: user.id,
                  postId,
                },
              });
            }}
          />
        </View>
        </View>
      </View>

      <ProfileActionsBottomSheet
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        type="USER"
        onBlock={confirmBlock}
        onReport={() => {
          setOptionsOpen(false);
          setTimeout(() => setReportOpen(true), 250);
        }}
      />
      <ReportBottomSheet
        open={reportOpen}
        targetType="USER"
        targetId={user.id}
        onClose={() => setReportOpen(false)}
      />
      <FullScreenImageViewer
        uri={user.avatarUrl}
        visible={avatarOpen}
        onClose={() => setAvatarOpen(false)}
      />
    </View>
  );
}
