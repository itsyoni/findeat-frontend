import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import { Post } from "@/types/post";
import { router } from "expo-router";
import {
  BookBookmarkIcon,
  ChatCircleIcon,
  HeartIcon,
  ShareFatIcon,
} from "phosphor-react-native";
import { useState } from "react";
import {
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

type Props = {
  post: Post;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
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
    }
  | {
      type: "DISH";
      id: string;
      imageUrl?: string | null;
      text?: string | null;
      dishName: string;
      price?: number | null;
      rating?: number | null;
      menuItemId?: string | null;
      isLinkedToMenu: boolean;
    };

export default function ReviewPost({
  post,
  onToggleLike,
  onOpenComments,
  onToggleWantToTry,
}: Props) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

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
    },
    ...items.map((item) => ({
      type: "DISH" as const,
      id: item.id,
      menuItemId: item.menuItemId,
      isLinkedToMenu: !!item.menuItemId,
      imageUrl: item.imageUrl,
      text: item.text,
      dishName: item.menuItem?.name ?? item.customDishName ?? "Dish",
      price: item.menuItem?.price ?? item.customPrice,
      rating: item.rating,
    })),
  ];

  const activeSlide = slides[activeIndex];

  const isRestaurantPost = !!post.authorRestaurantId && !!post.authorRestaurant;

  const displayAvatar = isRestaurantPost
    ? post.authorRestaurant?.logoUrl
    : post.author?.avatarUrl;

  const displayName = isRestaurantPost
    ? post.authorRestaurant?.name
    : post.author?.username;

  const userRestaurant = post.restaurant?.userSaves?.[0];
  const isWantToTry = !!userRestaurant?.wantToTry;

  const likeScale = useSharedValue(1);

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  function handleLike() {
    if (!post.isLiked) {
      likeScale.value = 1;
      likeScale.value = withSequence(withSpring(1.25), withSpring(1));
    } else {
      likeScale.value = 1;
    }

    onToggleLike(post.id, post.isLiked);
  }

  function handleWantToTry() {
    if (!post.restaurant?.id) return;
    onToggleWantToTry(post.id, post.restaurant.id, isWantToTry);
  }

  return (
    <View className="mb-6 bg-white pb-6">
      <TouchableOpacity
        className="mb-3 flex-row items-center gap-3 px-4"
        activeOpacity={0.8}
        onPress={() => {
          if (isRestaurantPost && post.authorRestaurant?.id) {
            router.push({
              pathname: "/restaurants/[id]",
              params: { id: post.authorRestaurant.id },
            });
            return;
          }

          if (!post.author?.id) return;

          router.push({
            pathname: "/users/[id]",
            params: { id: post.author.id },
          });
        }}
      >
        <Avatar
          uri={displayAvatar}
          username={displayName ?? "User"}
          size={42}
        />

        <View>
          <Text className="font-bold text-black">
            {isRestaurantPost ? displayName : `@${displayName}`}
          </Text>

          {!!post.restaurant && (
            <Text className="text-xs text-gray-500">
              📍 {post.restaurant.name}
              {post.restaurant.city ? ` · ${post.restaurant.city}` : ""}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <FlatList
        horizontal
        pagingEnabled
        data={slides}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x /
              event.nativeEvent.layoutMeasurement.width,
          );
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width }} className="h-96 bg-gray-100">
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-900">
                <Text className="text-white">No image</Text>
              </View>
            )}

            {item.type === "COVER" && (
              <View
                className="absolute inset-0 justify-end p-5"
                style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
              >
                <Text className="text-3xl font-bold text-white">
                  ⭐ {review?.overallRating ?? "-"}/10
                </Text>

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
                        Value {review.valueRating}/10
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
                            params: { id: item.menuItemId },
                          })
                        }
                      >
                        <Text className="text-xs font-bold text-white">
                          ✓ Official menu item
                        </Text>
                      </TouchableOpacity>
                    )}

                    {item.rating != null && (
                      <Text className="mt-1 font-bold text-white">
                        ⭐ {item.rating}/10
                      </Text>
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

      {slides.length > 1 && (
        <View className="mt-3 flex-row justify-center gap-1">
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              className={`h-1.5 rounded-full ${
                index === activeIndex ? "w-5 bg-black" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </View>
      )}

      <View className="px-4 pt-3">
        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={handleLike}
            className="flex-col items-center gap-1"
          >
            <Animated.View style={likeAnimatedStyle}>
              <HeartIcon
                weight={post.isLiked ? "fill" : "regular"}
                color={post.isLiked ? "#FF3040" : "#212121"}
                size={28}
              />
            </Animated.View>

            <Text className="text-base text-black">{post.likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onOpenComments(post.id)}
            className="flex-col items-center gap-1"
          >
            <ChatCircleIcon weight="regular" color="#212121" size={28} />
            <Text className="text-base text-black">{post.commentsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-col items-center gap-1">
            <ShareFatIcon weight="regular" color="#212121" size={28} />
            <Text className="text-base text-black">{post.commentsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleWantToTry}>
            <BookBookmarkIcon
              weight={isWantToTry ? "fill" : "regular"}
              color={isWantToTry ? "#F7D786" : "#212121"}
              size={35}
            />

            <Text className="text-center text-lg text-black">
              {post.restaurantSavesCount}
            </Text>
          </TouchableOpacity>
        </View>

        {!!activeSlide?.text && (
          <Text className="mt-3 text-gray-700">{activeSlide.text}</Text>
        )}
      </View>
    </View>
  );
}
