import { AppAlert as Alert } from "@/lib/appAlert";
import { Skeleton, SkeletonList, SkeletonPulse } from "@/components/common";
import Text from "@/components/common/AppText";
import Tabs from "@/components/common/Tabs";
import RestaurantHeader from "@/components/restaurants/RestaurantHeader";
import RestaurantMenuSection from "@/components/restaurants/RestaurantMenuSection";
import RestaurantPostsSection from "@/components/restaurants/RestaurantPostsSection";
import { RestaurantCompatibilitySummary } from "@/components/restaurants/FoodCompatibility";
import ProfileActionsBottomSheet from "@/components/profile/ProfileActionsBottomSheet";
import ReportBottomSheet from "@/components/moderation/ReportBottomSheet";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useRestaurantPosts } from "@/hooks/useRestaurantPosts";
import { updateRestaurantStatusInFeedCache } from "@/hooks/useFeed";
import { api } from "@/lib/api";
import type { Restaurant, RestaurantPostSection } from "@findeat/types";
import { getErrorMessage } from "@findeat/utils";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Animated, ScrollView, TouchableOpacity, View } from "react-native";
import {
  BookmarkSimpleIcon,
  CheckCircleIcon,
  HeartIcon,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

type RestaurantTab = RestaurantPostSection | "MENU";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(["restaurants", "common"]);
  const queryClient = useQueryClient();
  const { restaurant, setRestaurant, loading } = useRestaurant(id);
  const [activeTab, setActiveTab] = useState<RestaurantTab>("OFFICIAL");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [scrollY] = useState(() => new Animated.Value(0));
  const postSection: RestaurantPostSection =
    activeTab === "MENU" ? "OFFICIAL" : activeTab;
  const sectionPosts = useRestaurantPosts(
    id,
    postSection,
    activeTab !== "MENU",
  );
  const visiblePosts = useMemo(() => {
    const paginatedPosts =
      sectionPosts.data?.pages.flatMap((page) => page.items) ?? [];

    if (paginatedPosts.length > 0 || activeTab !== "REVIEWS") {
      return paginatedPosts;
    }

    return restaurant?.posts.filter((post) => post.type === "REVIEW") ?? [];
  }, [activeTab, restaurant?.posts, sectionPosts.data]);

  async function toggleFollow() {
    if (!restaurant) return;

    const wasFollowing = restaurant.isFollowing;

    setRestaurant((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: !wasFollowing,
            followersCount: prev.followersCount + (wasFollowing ? -1 : 1),
          }
        : prev,
    );

    try {
      if (wasFollowing) {
        await api.restaurants.unfollow(restaurant.id);
      } else {
        await api.restaurants.follow(restaurant.id);
      }
    } catch {
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: wasFollowing,
              followersCount: prev.followersCount + (wasFollowing ? 1 : -1),
            }
          : prev,
      );
    }
  }

  function updateRestaurantStatus(
    nextStatus: Partial<NonNullable<Restaurant["userRestaurant"]>>,
  ) {
    if (!restaurant) return;

    updateRestaurantStatusInFeedCache(queryClient, restaurant.id, nextStatus);

    setRestaurant((prev) =>
      prev
        ? {
            ...prev,
            userRestaurant: {
              id: prev.userRestaurant?.id ?? "",
              wantToTry: prev.userRestaurant?.wantToTry ?? false,
              visited: prev.userRestaurant?.visited ?? false,
              favorite: prev.userRestaurant?.favorite ?? false,
              ...nextStatus,
            },
          }
        : prev,
    );
  }

  function confirmStatusChange(
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    destructive = false,
  ) {
    Alert.alert(title, message, [
      { text: t("common:cancel"), style: "cancel" },
      {
        text: t("restaurants:confirmStatusChange"),
        style: destructive ? "destructive" : "default",
        onPress: () => void onConfirm(),
      },
    ]);
  }

  async function toggleVisited() {
    if (!restaurant) return;
    const isVisited = restaurant.userRestaurant?.visited === true;

    const applyChange = async () => {
      try {
        if (isVisited) {
          await api.restaurants.removeVisited(restaurant.id);
          updateRestaurantStatus({ visited: false, favorite: false });
          return;
        }

        await api.restaurants.visited(restaurant.id);
        updateRestaurantStatus({
          visited: true,
          wantToTry: false,
        });
      } catch (error) {
        console.error(error);
        Alert.alert(
          t("restaurants:visitedLockedTitle"),
          t("restaurants:cannotRemoveVisitedWithReview"),
        );
      }
    };

    if (isVisited) {
      confirmStatusChange(
        t("restaurants:confirmRemoveVisitedTitle"),
        t(
          restaurant.userRestaurant?.favorite
            ? "restaurants:confirmRemoveVisitedFavoriteBody"
            : "restaurants:confirmRemoveVisitedBody",
        ),
        applyChange,
        true,
      );
      return;
    }

    await applyChange();
  }

  async function toggleWantToTry() {
    if (!restaurant) return;
    const isWantToTry = restaurant.userRestaurant?.wantToTry === true;
    const isVisited = restaurant.userRestaurant?.visited === true;

    const applyChange = async () => {
      try {
        if (isWantToTry) {
          await api.restaurants.removeWantToTry(restaurant.id);
          updateRestaurantStatus({ wantToTry: false });
        } else {
          await api.restaurants.wantToTry(restaurant.id);
          updateRestaurantStatus({
            wantToTry: true,
            visited: false,
            favorite: false,
          });
        }
      } catch (error) {
        console.error(error);
        Alert.alert(
          t("restaurants:visitedLockedTitle"),
          t("restaurants:cannotRemoveVisitedWithReview"),
        );
      }
    };

    if (!isWantToTry && isVisited) {
      confirmStatusChange(
        t("restaurants:confirmWantToTryTitle"),
        t("restaurants:confirmWantToTryBody"),
        applyChange,
      );
      return;
    }

    await applyChange();
  }

  async function toggleFavorite() {
    if (!restaurant) return;

    const isFavorite = restaurant.userRestaurant?.favorite === true;
    const isVisited = restaurant.userRestaurant?.visited === true;

    if (!isFavorite && !isVisited) return;

    const applyChange = async () => {
      if (isFavorite) {
        await api.restaurants.removeFavorite(restaurant.id);
        updateRestaurantStatus({ favorite: false });
      } else {
        await api.restaurants.favorite(restaurant.id);
        updateRestaurantStatus({
          favorite: true,
        });
      }
    };

    if (isFavorite) {
      confirmStatusChange(
        t("restaurants:confirmRemoveFavoriteTitle"),
        t("restaurants:confirmRemoveFavoriteBody"),
        applyChange,
      );
      return;
    }

    await applyChange();
  }

  async function claimRestaurant() {
    if (!restaurant) return;

    try {
      await api.restaurants.startClaim(restaurant.id);
      setOptionsOpen(false);

      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              status: "PENDING",
            }
          : prev,
      );

      Alert.alert(
        t("restaurants:requestSent"),
        t("restaurants:requestSentBody"),
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        t("common:error"),
        getErrorMessage(error, t("restaurants:claimError")),
      );
    }
  }

  function openCreateFlow(pathname: "/create/review" | "/create/content") {
    if (!restaurant) return;
    setOptionsOpen(false);
    requestAnimationFrame(() => {
      router.push({ pathname, params: { restaurantId: restaurant.id } });
    });
  }

  const featuredItems = useMemo(() => {
    if (!restaurant) return [];

    return restaurant.menus
      .flatMap((menu) => menu.items)
      .filter((item) => item.isFeatured);
  }, [restaurant]);

  if (loading) {
    return (
      <ScrollView className="flex-1 bg-canvas dark:bg-black">
        <RestaurantHeader restaurant={null} loading scrollY={scrollY} onToggleFollow={() => undefined} onOpenOptions={() => undefined} />
        <SkeletonPulse>
          <View className="flex-row gap-3 bg-surface px-5 pb-5 pt-2 dark:bg-black">
            {[0, 1, 2].map((item) => <Skeleton key={item} width="31%" height={62} radius={12} />)}
          </View>
        </SkeletonPulse>
        <Tabs activeTab="OFFICIAL" onChange={() => undefined} tabs={[{ label: t("restaurants:official"), value: "OFFICIAL" }, { label: t("restaurants:community"), value: "COMMUNITY" }, { label: t("common:reviews"), value: "REVIEWS" }, { label: t("restaurants:menu"), value: "MENU" }]} />
        <SkeletonList variant="grid" count={9} />
      </ScrollView>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas dark:bg-black">
        <Text className="text-black dark:text-white">
          {t("restaurants:notFound")}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Animated.ScrollView
        className="flex-1 bg-canvas dark:bg-black"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
      <RestaurantHeader
        restaurant={restaurant}
        scrollY={scrollY}
        onToggleFollow={toggleFollow}
        onOpenOptions={() => setOptionsOpen(true)}
      />

      <View className="bg-surface px-5 pb-5 pt-2 dark:bg-black">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={toggleWantToTry}
            className={`flex-1 items-center justify-center rounded-xl px-2 py-3 ${restaurant.userRestaurant?.wantToTry ? "bg-amber-500" : "bg-gray-100 dark:bg-gray-800"}`}
          >
            <BookmarkSimpleIcon
              size={20}
              color={restaurant.userRestaurant?.wantToTry ? "white" : "#6B7280"}
              weight={restaurant.userRestaurant?.wantToTry ? "fill" : "regular"}
            />
            <Text
              numberOfLines={1}
              className={`mt-1 text-center text-xs font-bold ${restaurant.userRestaurant?.wantToTry ? "text-white" : "text-black dark:text-white"}`}
            >
              {t("restaurants:wantToTry")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleVisited}
            className={`flex-1 items-center justify-center rounded-xl px-2 py-3 ${
              restaurant.userRestaurant?.visited
                ? "bg-green-600"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <CheckCircleIcon
              size={19}
              color={restaurant.userRestaurant?.visited ? "white" : "#6B7280"}
              weight={restaurant.userRestaurant?.visited ? "fill" : "regular"}
            />
            <Text
              className={`mt-1 text-center text-xs font-bold ${
                restaurant.userRestaurant?.visited
                  ? "text-white"
                  : "text-black dark:text-white"
              }`}
            >
              {t("restaurants:visited")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={!restaurant.userRestaurant?.visited}
            className={`flex-1 items-center justify-center rounded-xl px-2 py-3 ${
              restaurant.userRestaurant?.favorite
                ? "bg-red-500"
                : restaurant.userRestaurant?.visited
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-gray-100 opacity-40 dark:bg-gray-800"
            }`}
          >
            <HeartIcon
              size={19}
              color={restaurant.userRestaurant?.favorite ? "white" : "#6B7280"}
              weight={restaurant.userRestaurant?.favorite ? "fill" : "regular"}
            />
            <Text
              className={`mt-1 text-center text-xs font-bold ${
                restaurant.userRestaurant?.favorite
                  ? "text-white"
                  : "text-black dark:text-white"
              }`}
            >
              {t("restaurants:favorite")}
            </Text>
          </TouchableOpacity>
        </View>
        {!restaurant.userRestaurant?.visited && (
          <Text className="mt-2 text-center text-xs text-gray-500">
            {t("restaurants:favoriteAfterVisit")}
          </Text>
        )}
      </View>

      <RestaurantCompatibilitySummary compatibility={restaurant.compatibility} />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { label: t("restaurants:official"), value: "OFFICIAL" },
          { label: t("restaurants:community"), value: "COMMUNITY" },
          { label: t("common:reviews"), value: "REVIEWS" },
          { label: t("restaurants:menu"), value: "MENU" },
        ]}
      />

      <View className="px-6 pb-10">
        {activeTab !== "MENU" && (
          <RestaurantPostsSection
            posts={visiblePosts}
            loading={sectionPosts.isPending && visiblePosts.length === 0}
            loadingMore={sectionPosts.isFetchingNextPage}
            hasMore={sectionPosts.hasNextPage}
            onLoadMore={() => void sectionPosts.fetchNextPage()}
            onPressPost={(postId) =>
              router.push({
                pathname: "/restaurants/post-feed",
                params: {
                  restaurantId: restaurant.id,
                  section: activeTab,
                  postId,
                },
              })
            }
            emptyText={
              activeTab === "OFFICIAL"
                ? restaurant.status === "CLAIMED"
                  ? t("restaurants:noOfficialClaimed")
                  : t("restaurants:noOfficialUnclaimed")
                : activeTab === "COMMUNITY"
                  ? t("restaurants:noCommunity")
                  : t("restaurants:noReviews")
            }
          />
        )}

        {activeTab === "MENU" && (
          <RestaurantMenuSection
            restaurant={restaurant}
            featuredItems={featuredItems}
          />
        )}
      </View>
      </Animated.ScrollView>

      <ProfileActionsBottomSheet
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        type="RESTAURANT"
        canClaim={restaurant.status !== "CLAIMED"}
        onClaim={() => void claimRestaurant()}
        onCreateReview={() => openCreateFlow("/create/review")}
        onCreateContent={() => openCreateFlow("/create/content")}
        onReport={() => {
          setOptionsOpen(false);
          setTimeout(() => setReportOpen(true), 250);
        }}
      />
      <ReportBottomSheet
        open={reportOpen}
        targetType="RESTAURANT"
        targetId={restaurant.id}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}
