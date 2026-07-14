import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import { Post } from "@findeat/types/post";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  BookmarkSimpleIcon,
  ChatCircleIcon,
  CheckIcon,
  HeartIcon,
  ShareFatIcon,
  DotsThreeOutlineIcon,
} from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";
import { useTranslation } from "react-i18next";
import PostVisibilityIcon from "@/components/posts/PostVisibilityIcon";
import PinchZoomImage from "@/components/common/PinchZoomImage";

type Props = {
  post: Post;
  height: number;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
  onOpenSharePost: (postId: string) => void;
  onOpenPostOptions: (postId: string) => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  onToggleWantToTry: (
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) => void;
};

export default function ContentPost({
  post,
  height,
  onToggleLike,
  onOpenComments,
  onToggleWantToTry,
  onOpenSharePost,
  onOpenPostOptions,
  onPinchStart,
  onPinchEnd,
}: Props) {
  const { t } = useTranslation("restaurants");
  const userRestaurant = post.restaurant?.userSaves?.[0];
  const isWantToTry = !!userRestaurant?.wantToTry;
  const isVisited = !!userRestaurant?.visited;
  const isFavorite = !!userRestaurant?.favorite;
  const content = post.contentPost;
  const isRestaurantPost = !!post.authorRestaurantId && !!post.authorRestaurant;
  const isOfficialPost = isRestaurantPost && !!post.restaurant;

  const displayAvatar = isRestaurantPost
    ? post.authorRestaurant?.logoUrl
    : post.author?.avatarUrl;

  const displayName = isRestaurantPost
    ? (post.authorRestaurant?.name ?? "")
    : (post.author?.username ?? "");

  const imageUrl = content?.imageUrl;
  const description = content?.description;

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

  const iconShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  };

  const textShadow = {
    textShadowColor: "#000",
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 8,
  };

  function handleDoubleTapLike(x: number, y: number) {
    heartOverlayX.set(x);
    heartOverlayY.set(y);

    const randomRotation = Math.random() * 30 - 15;
    heartOverlayRotation.set(randomRotation);

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

  const isPlaceSaved = isWantToTry || isVisited || isFavorite;
  const bookmarkColor = isPlaceSaved ? "#F7D786" : "#FFFFFFCC";

  return (
    <View style={{ height }}>
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
            style={iconShadow}
          />
        </Animated.View>
        {imageUrl ? (
          <PinchZoomImage
            uri={imageUrl}
            style={{ position: "absolute", inset: 0 }}
            resizeMode="cover"
            onDoubleTap={handleDoubleTapLike}
            onPinchStart={onPinchStart}
            onPinchEnd={onPinchEnd}
          />
        ) : (
          <View className="absolute inset-0 items-center justify-center bg-gray-900">
            <Text
              style={textShadow}
              className="px-8 text-center text-2xl font-bold text-white"
            >
              {description}
            </Text>
          </View>
        )}

        <LinearGradient
          pointerEvents="none"
          colors={[
            "transparent",
            "rgba(0,0,0,0.1)",
            "rgba(0,0,0,0.25)",
            "rgba(0,0,0,0.5)",
          ]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 280,
          }}
        />

        {post.canDelete && (
          <TouchableOpacity
            className="absolute right-4 top-4 z-10 p-1"
            activeOpacity={0.8}
            onPress={() => onOpenPostOptions(post.id)}
          >
            <DotsThreeOutlineIcon
              size={30}
              color="white"
              weight="fill"
              style={iconShadow}
            />
          </TouchableOpacity>
        )}
        <View className="absolute bottom-8 left-4 right-20">
          <TouchableOpacity
            className="mb-3 flex-row items-center gap-3"
            activeOpacity={0.8}
            onPress={() => {
              if (isOfficialPost && post.restaurant) {
                router.push({
                  pathname: "/restaurants/[id]",
                  params: { id: post.restaurant.id },
                });
                return;
              }

              if (!post.author?.id) return;

              router.push({
                pathname: "/(users)/[id]",
                params: { id: post.author.id },
              });
            }}
          >
            <Avatar
              uri={displayAvatar}
              username={displayName ?? ""}
              size={42}
              fallbackType={isOfficialPost ? "restaurant" : "user"}
            />

            <View>
              <View className="flex-row items-center">
                <Text className="font-bold text-white">
                  {isOfficialPost ? displayName : `@${displayName}`}
                </Text>
                {isOfficialPost ? <RestaurantBadge /> : null}
                {!isOfficialPost && post.visibility !== "PUBLIC" ? (
                  <View className="ml-1.5">
                    <PostVisibilityIcon
                      visibility={post.visibility}
                      color="#FFFFFFCC"
                    />
                  </View>
                ) : null}
              </View>

              {isOfficialPost && (
                <Text className="mt-1 text-xs font-semibold text-[#F7D786]">
                  Official restaurant
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {!!post.restaurant && (
            <TouchableOpacity
              className="mb-3 self-start rounded-full bg-[#00000080] px-3 py-2"
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/restaurants/[id]",
                  params: { id: post.restaurant!.id },
                })
              }
            >
              <View className="flex-row items-center">
                <Text className="font-semibold text-white">
                  {post.restaurant.name}
                </Text>
                <RestaurantBadge size={14} status={post.restaurant.status} />
              </View>
            </TouchableOpacity>
          )}

          {!!description && (
            <Text className="text-base text-white">{description}</Text>
          )}
        </View>

        <View className="absolute bottom-26 right-4 items-center gap-5">
          <TouchableOpacity onPress={handleLike}>
            <Animated.View style={likeAnimatedStyle}>
              <HeartIcon
                weight="fill"
                color={post.isLiked ? "#FF3040" : "#FFFFFFCC"}
                size={35}
                style={[
                  iconShadow,
                  post.isLiked && {
                    shadowColor: "#FF3040",
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                  },
                ]}
              />
            </Animated.View>

            <Text style={textShadow} className="text-center text-lg text-white">
              {post.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onOpenComments(post.id)}>
            <ChatCircleIcon
              weight="fill"
              color="#FFFFFFCC"
              size={35}
              style={iconShadow}
            />
            <Text style={textShadow} className="text-center text-lg text-white">
              {post.commentsCount}
            </Text>
          </TouchableOpacity>

          {post.visibility === "PUBLIC" && (
            <TouchableOpacity onPress={() => onOpenSharePost(post.id)}>
              <ShareFatIcon
                weight="fill"
                color="#FFFFFFCC"
                size={35}
                style={iconShadow}
              />
              <Text style={textShadow} className="text-center text-lg text-white">
                {post.sharesCount ?? 0}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity className="items-center" onPress={handleWantToTry}>
            <View className="relative h-[35px] w-[35px]">
              <BookmarkSimpleIcon
                weight="fill"
                color={bookmarkColor}
                size={35}
                style={iconShadow}
              />
              {isVisited && !isFavorite && (
                <View
                  className="absolute h-4 w-4 items-center justify-center rounded-full bg-green-500"
                  style={{ right: -2, top: -3 }}
                >
                  <CheckIcon size={11} color="white" weight="bold" />
                </View>
              )}
              {isFavorite && (
                <HeartIcon
                  size={16}
                  color="#FF3040"
                  weight="fill"
                  style={{ position: "absolute", right: -2, top: -3 }}
                />
              )}
            </View>

            <Text style={textShadow} className="mt-1 text-center text-xs font-bold text-white">
              {t(isPlaceSaved ? "savedPlace" : "savePlace")}
            </Text>
          </TouchableOpacity>
        </View>
    </View>
  );
}
