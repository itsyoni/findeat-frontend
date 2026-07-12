import { LoadingScreen } from "@/components/common";
import Text from "@/components/common/AppText";
import Tabs from "@/components/common/Tabs";
import RestaurantHeader from "@/components/restaurants/RestaurantHeader";
import RestaurantMenuSection from "@/components/restaurants/RestaurantMenuSection";
import RestaurantPostsSection from "@/components/restaurants/RestaurantPostsSection";
import ProfileActionsBottomSheet from "@/components/profile/ProfileActionsBottomSheet";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useRestaurantPosts } from "@/hooks/useRestaurantPosts";
import { updateRestaurantStatusInFeedCache } from "@/hooks/useFeed";
import { api } from "@/lib/api";
import type { Restaurant, RestaurantPostSection } from "@findeat/types";
import { getErrorMessage } from "@findeat/utils";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import {
  BookmarkSimpleIcon,
  CheckCircleIcon,
  StarIcon,
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
  const postSection: RestaurantPostSection =
    activeTab === "MENU" ? "OFFICIAL" : activeTab;
  const sectionPosts = useRestaurantPosts(
    id,
    postSection,
    activeTab !== "MENU",
  );
  const visiblePosts = useMemo(
    () => sectionPosts.data?.pages.flatMap((page) => page.items) ?? [],
    [sectionPosts.data],
  );

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

  async function toggleVisited() {
    if (!restaurant) return;
    const isVisited = restaurant.userRestaurant?.visited === true;

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
  }

  async function toggleWantToTry() {
    if (!restaurant) return;
    const isWantToTry = restaurant.userRestaurant?.wantToTry === true;

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
  }

  async function toggleFavorite() {
    if (!restaurant) return;

    const isFavorite = restaurant.userRestaurant?.favorite === true;
    const isVisited = restaurant.userRestaurant?.visited === true;

    if (!isFavorite && !isVisited) return;

    if (isFavorite) {
      await api.restaurants.removeFavorite(restaurant.id);
      updateRestaurantStatus({ favorite: false });
    } else {
      await api.restaurants.favorite(restaurant.id);
      updateRestaurantStatus({
        favorite: true,
      });
    }
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

  const featuredItems = useMemo(() => {
    if (!restaurant) return [];

    return restaurant.menus
      .flatMap((menu) => menu.items)
      .filter((item) => item.isFeatured);
  }, [restaurant]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-black dark:text-white">
          {t("restaurants:notFound")}
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-white dark:bg-black">
      <RestaurantHeader
        restaurant={restaurant}
        onToggleFollow={toggleFollow}
        onOpenOptions={() => setOptionsOpen(true)}
      />

      <View className="px-5 py-4">
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
            <StarIcon
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
            loading={sectionPosts.isPending}
            loadingMore={sectionPosts.isFetchingNextPage}
            hasMore={sectionPosts.hasNextPage}
            onLoadMore={() => void sectionPosts.fetchNextPage()}
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
      </ScrollView>

      <ProfileActionsBottomSheet
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        type="RESTAURANT"
        canClaim={
          restaurant.status !== "CLAIMED" && restaurant.status !== "PENDING"
        }
        onClaim={() => void claimRestaurant()}
      />
    </>
  );
}
