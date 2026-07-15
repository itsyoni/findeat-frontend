import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import { Post } from "@findeat/types/post";
import { router } from "expo-router";
import {
  ChatCircleIcon,
  DotsThreeOutlineIcon,
  HeartIcon,
  ShareFatIcon,
  StarIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  I18nManager,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useAppTheme } from "@/contexts/ThemeContext";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";
import { useTranslation } from "react-i18next";
import PostVisibilityIcon from "@/components/posts/PostVisibilityIcon";
import PinchZoomImage from "@/components/common/PinchZoomImage";
import PlaceStatusBookmark, {
  getPlaceStatusLabelKey,
} from "@/components/restaurants/PlaceStatusBookmark";
import PostDate from "@/components/posts/PostDate";
import { isRtlText } from "@/lib/textDirection";

type Props = {
  post: Post;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
  onOpenSharePost: (postId: string) => void;
  onOpenPostOptions: (postId: string) => void;
  onToggleWantToTry: (
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) => void;
};

type ReviewSlide =
  | {
      type: "COVER";
      id: string;
      imageUrl?: string | null;
      text?: string | null;
      textEditedAt?: string | null;
    }
  | {
      type: "DISH";
      id: string;
      imageUrl?: string | null;
      text?: string | null;
      textEditedAt?: string | null;
      dishName: string;
      price?: number | null;
      rating?: number | null;
      menuItemId?: string | null;
      isLinkedToMenu: boolean;
    };

const reviewViewabilityConfig = { itemVisiblePercentThreshold: 60 };

function ReviewPaginationDot({
  active,
  isDark,
}: {
  active: boolean;
  isDark: boolean;
}) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.set(withSpring(active ? 1 : 0, { damping: 15, stiffness: 180 }));
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: 6 + progress.value * 16,
    opacity: 0.55 + progress.value * 0.45,
    transform: [{ scaleY: 1 + progress.value * 0.18 }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      isDark ? ["#4B5563", "#FFFFFF"] : ["#D1D5DB", "#111111"],
    ),
  }));

  return <Animated.View className="h-1.5 rounded-full" style={animatedStyle} />;
}

export default function ReviewPost({
  post,
  onToggleLike,
  onOpenComments,
  onToggleWantToTry,
  onOpenSharePost,
  onOpenPostOptions,
}: Props) {
  const { isDark } = useAppTheme();
  const { t } = useTranslation("restaurants");
  const { t: tCommon, i18n } = useTranslation("common");
  const isRtl = i18n.language.startsWith("he");
  const actionColor = isDark ? "#E5E7EB" : "#212121";
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPinchingMedia, setIsPinchingMedia] = useState(false);
  const review = post.reviewPost;
  const items = review?.items ?? [];

  const totalPrice = items.reduce((sum, item) => {
    const price = item.menuItem?.price ?? item.customPrice ?? 0;
    return sum + price;
  }, 0);

  const slides: ReviewSlide[] = [
    {
      type: "COVER",
      id: "cover",
      imageUrl: review?.coverImageUrl,
      text: review?.summary,
      textEditedAt: review?.summaryEditedAt,
    },
    ...items.map((item) => ({
      type: "DISH" as const,
      id: item.id,
      menuItemId: item.menuItemId,
      isLinkedToMenu: !!item.menuItemId,
      imageUrl: item.imageUrl ?? item.menuItem?.imageUrl,
      text: item.text,
      textEditedAt: item.textEditedAt,
      dishName: item.menuItem?.name ?? item.customDishName ?? "Dish",
      price: item.menuItem?.price ?? item.customPrice,
      rating: item.rating,
    })),
  ];

  const activeSlide = slides[activeIndex];
  const activeTextIsRtl = isRtlText(activeSlide?.text, isRtl);
  const indicatorSlides = I18nManager.isRTL ? [...slides].reverse() : slides;
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ReviewSlide>[] }) => {
      const nextIndex = viewableItems.find(
        (item) => item.isViewable && typeof item.index === "number",
      )?.index;
      if (typeof nextIndex === "number") setActiveIndex(nextIndex);
    },
    [setActiveIndex],
  );

  const isRestaurantPost = !!post.authorRestaurantId && !!post.authorRestaurant;

  const displayAvatar = isRestaurantPost
    ? post.authorRestaurant?.logoUrl
    : post.author?.avatarUrl;

  const displayName = isRestaurantPost
    ? post.authorRestaurant?.name
    : post.author?.username;

  const userRestaurant = post.restaurant?.userSaves?.[0];
  const isWantToTry = !!userRestaurant?.wantToTry;
  const isVisited = !!userRestaurant?.visited;
  const isFavorite = !!userRestaurant?.favorite;

  const heartOverlayScale = useSharedValue(0);
  const heartOverlayOpacity = useSharedValue(0);
  const heartOverlayX = useSharedValue(0);
  const heartOverlayY = useSharedValue(0);
  const heartOverlayRotation = useSharedValue(0);

  const heartOverlayStyle = useAnimatedStyle(() => ({
    opacity: heartOverlayOpacity.value,
    left: heartOverlayX.value - 55,
    top: heartOverlayY.value - 55,
    transform: [
      { rotate: `${heartOverlayRotation.value}deg` },
      { scale: heartOverlayScale.value },
    ],
  }));

  const likeScale = useSharedValue(1);

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  function handleDoubleTapLike(x: number, y: number) {
    heartOverlayX.set(x);
    heartOverlayY.set(y);
    heartOverlayRotation.set(Math.random() * 30 - 15);
    heartOverlayOpacity.set(1);
    heartOverlayScale.set(0.4);
    heartOverlayScale.set(
      withSequence(withSpring(1.25), withSpring(1), withSpring(0)),
    );
    heartOverlayOpacity.set(
      withSequence(withSpring(1), withSpring(1), withSpring(0)),
    );

    if (post.isLiked) return;

    likeScale.set(1);
    likeScale.set(withSequence(withSpring(1.35), withSpring(1)));
    onToggleLike(post.id, false);
  }

  function handleLike() {
    if (!post.isLiked) {
      likeScale.set(1);
      likeScale.set(withSequence(withSpring(1.25), withSpring(1)));
    } else {
      likeScale.set(1);
    }

    onToggleLike(post.id, post.isLiked);
  }

  function handleWantToTry() {
    if (!post.restaurant?.id) return;

    if (isVisited) {
      router.push({
        pathname: "/restaurants/[id]",
        params: { id: post.restaurant.id },
      });
      return;
    }

    onToggleWantToTry(post.id, post.restaurant.id, isWantToTry);
  }

  const bookmarkLabelKey = getPlaceStatusLabelKey(
    isWantToTry,
    isVisited,
    isFavorite,
  );
  function openAuthorProfile() {
    if (isRestaurantPost && post.authorRestaurant?.id) {
      router.push({
        pathname: "/restaurants/[id]",
        params: { id: post.authorRestaurant.id },
      });
      return;
    }

    if (!post.author?.id) return;
    router.push({
      pathname: "/(users)/[id]",
      params: { id: post.author.id },
    });
  }

  function openRestaurantProfile() {
    if (!post.restaurant?.id) return;
    router.push({
      pathname: "/restaurants/[id]",
      params: { id: post.restaurant.id },
    });
  }

  return (
    <View className="mb-6 bg-white pb-6 dark:bg-black">
      <View className="mb-3 flex-row items-center justify-between px-4">
        <View className="flex-1 flex-row items-center gap-3">
          <TouchableOpacity activeOpacity={0.8} onPress={openAuthorProfile}>
            <Avatar
              uri={displayAvatar}
              username={displayName ?? "User"}
              size={42}
              fallbackType={isRestaurantPost ? "restaurant" : "user"}
            />
          </TouchableOpacity>

          <View className="flex-1">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={openAuthorProfile}
              className="self-start flex-row items-center"
            >
              <Text className="font-bold text-black dark:text-white">
                {isRestaurantPost ? displayName : `@${displayName}`}
              </Text>
              {isRestaurantPost ? <RestaurantBadge /> : null}
              {!isRestaurantPost && post.visibility !== "PUBLIC" ? (
                <View className="ml-1.5">
                  <PostVisibilityIcon
                    visibility={post.visibility}
                    color={actionColor}
                  />
                </View>
              ) : null}
            </TouchableOpacity>

            {!!post.restaurant && (
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={6}
                onPress={openRestaurantProfile}
                className="mt-0.5 self-start flex-row items-center"
              >
                <Text className="text-xs text-gray-500">
                  {post.restaurant.name}
                  {post.restaurant.city ? ` · ${post.restaurant.city}` : ""}
                </Text>
                <RestaurantBadge size={12} status={post.restaurant.status} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          className="ml-3 p-2"
          activeOpacity={0.8}
          onPress={() => onOpenPostOptions(post.id)}
        >
          <DotsThreeOutlineIcon size={28} color="#6B7280" weight="fill" />
        </TouchableOpacity>
      </View>

      <View className="relative">
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              width: 110,
              height: 110,
              zIndex: 20,
              alignItems: "center",
              justifyContent: "center",
            },
            heartOverlayStyle,
          ]}
        >
          <HeartIcon
            size={110}
            color="#FF3040"
            weight="fill"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.35,
              shadowRadius: 4,
              elevation: 6,
            }}
          />
        </Animated.View>

        <FlatList
          horizontal
          pagingEnabled
          scrollEnabled={!isPinchingMedia}
          data={slides}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={reviewViewabilityConfig}
          renderItem={({ item }) => (
            <View style={{ width }} className="h-96 bg-gray-100">
              {item.imageUrl ? (
                <PinchZoomImage
                  uri={item.imageUrl}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                  onDoubleTap={handleDoubleTapLike}
                  onPinchStart={() => setIsPinchingMedia(true)}
                  onPinchEnd={() => setIsPinchingMedia(false)}
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-gray-900">
                  <Text className="text-white">No image</Text>
                </View>
              )}

              {item.type === "COVER" && (
                <View
                  pointerEvents="none"
                  className="absolute inset-0 justify-end p-5"
                  style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                >
                  <View className="flex-row items-center gap-2">
                    <StarIcon size={30} color="#F7D786" weight="fill" />
                    <Text className="text-3xl font-bold text-white">
                      {review?.overallRating ?? "-"}/10
                    </Text>
                  </View>

                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {review?.atmosphereRating != null && (
                      <View className="rounded-full bg-white/20 px-3 py-2">
                        <Text className="font-bold text-white">
                          Atmosphere {review.atmosphereRating}/10
                        </Text>
                      </View>
                    )}

                    {review?.serviceRating != null && (
                      <View className="rounded-full bg-white/20 px-3 py-2">
                        <Text className="font-bold text-white">
                          Service {review.serviceRating}/10
                        </Text>
                      </View>
                    )}

                    {review?.valueRating != null && (
                      <View className="rounded-full bg-white/20 px-3 py-2">
                        <Text className="font-bold text-white">
                          VFM {review.valueRating}/10
                        </Text>
                      </View>
                    )}

                    {totalPrice > 0 && (
                      <View className="rounded-full bg-white/20 px-3 py-2">
                        <Text className="font-bold text-white">
                          Total ₪{totalPrice}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {item.type === "DISH" && (
                <View
                  className="absolute bottom-0 left-0 right-0 p-5"
                  style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                >
                  <View className="flex-row items-end justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-white">
                        {item.dishName}
                      </Text>

                      {item.isLinkedToMenu && item.menuItemId && (
                        <TouchableOpacity
                          className="mt-2 self-start rounded-full bg-white/20 px-3 py-1"
                          onPress={() =>
                            router.push({
                              pathname: "/menu-items/[id]",
                              params: { id: item.menuItemId as string },
                            })
                          }
                        >
                          <Text className="text-xs font-bold text-white">
                            ✓ Official menu item
                          </Text>
                        </TouchableOpacity>
                      )}

                      {item.rating != null && (
                        <View className="mt-1 flex-row items-center gap-1">
                          <StarIcon size={15} color="#F7D786" weight="fill" />
                          <Text className="font-bold text-white">
                            {item.rating}/10
                          </Text>
                        </View>
                      )}
                    </View>

                    {item.price != null && (
                      <Text className="text-xl font-bold text-white">
                        ₪{item.price}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
        />
      </View>

      {slides.length > 1 && (
        <View className="mt-3 flex-row justify-center gap-1">
          {indicatorSlides.map((slide) => (
            <ReviewPaginationDot
              key={slide.id}
              active={slide.id === activeSlide?.id}
              isDark={isDark}
            />
          ))}
        </View>
      )}

      <View className="px-4 pt-3">
        <View className="flex-row justify-between gap-5">
          <View className="flex-row items-center gap-5">
            <TouchableOpacity
              onPress={handleLike}
              className="flex-col items-center gap-1"
            >
              <Animated.View style={likeAnimatedStyle}>
                <HeartIcon
                  weight={post.isLiked ? "fill" : "regular"}
                  color={post.isLiked ? "#FF3040" : actionColor}
                  size={28}
                />
              </Animated.View>

              <Text className="text-base text-black dark:text-white">
                {post.likesCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onOpenComments(post.id)}
              className="flex-col items-center gap-1"
            >
              <ChatCircleIcon weight="regular" color={actionColor} size={28} />
              <Text className="text-base text-black dark:text-white">
                {post.commentsCount}
              </Text>
            </TouchableOpacity>

            {post.visibility === "PUBLIC" && (
              <TouchableOpacity
                onPress={() => onOpenSharePost(post.id)}
                className="items-center justify-center"
              >
                <ShareFatIcon weight="regular" color={actionColor} size={28} />
                <Text className="text-base text-black dark:text-white">
                  {post.sharesCount ?? 0}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity className="items-center" onPress={handleWantToTry}>
            <PlaceStatusBookmark
              wantToTry={isWantToTry}
              visited={isVisited}
              favorite={isFavorite}
              size={28}
              defaultColor={actionColor}
            />

            <Text className="mt-1 text-center text-xs font-bold text-black dark:text-white">
              {t(bookmarkLabelKey)}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-3">
          {!!activeSlide?.text && (
            <>
              <Text
                className="text-gray-700 dark:text-gray-300"
                style={{
                alignSelf: "stretch",
                width: "100%",
                textAlign: "auto",
                writingDirection: activeTextIsRtl ? "rtl" : "ltr",
                }}
                >
                {activeSlide.text}
              </Text>
              {!!activeSlide.textEditedAt && (
                <Text
                  className="mt-0.5 text-xs text-gray-400"
                  style={{
                    alignSelf: "stretch",
                    width: "100%",
                    textAlign: "auto",
                    writingDirection: activeTextIsRtl ? "rtl" : "ltr",
                  }}
                >
                  {tCommon("edited")}
                </Text>
              )}
            </>
          )}
          <PostDate
            createdAt={post.createdAt}
            hasContentAbove={!!activeSlide?.text}
          />
        </View>
      </View>
    </View>
  );
}
