import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import { Post } from "@findeat/types/post";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  BookBookmarkIcon,
  ChatCircleIcon,
  HeartIcon,
  MapPinLineIcon,
  ShareFatIcon,
} from "phosphor-react-native";
import { Image, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

type Props = {
  post: Post;
  height: number;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
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
}: Props) {
  const userRestaurant = post.restaurant?.userSaves?.[0];
  const isWantToTry = !!userRestaurant?.wantToTry;
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
    textShadowColor: "#00000080",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  };

  function handleLike() {
    if (!post.isLiked) {
      likeScale.value = 1;

      likeScale.value = withSequence(withSpring(1.25), withSpring(1));
    } else {
      // Reset immediately if unliking
      likeScale.value = 1;
    }

    onToggleLike(post.id, post.isLiked);
  }

  function handleWantToTry() {
    if (!post.restaurant?.id) return;

    onToggleWantToTry(post.id, post.restaurant.id, isWantToTry);
  }

  return (
    <View style={{ height }}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
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
        colors={[
          "transparent",
          "rgba(0,0,0,0.01)",
          "rgba(0,0,0,0.05)",
          "rgba(0,0,0,0.1)",
        ]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 280,
        }}
      />

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
          <Avatar uri={displayAvatar} username={displayName ?? ""} size={42} />

          <View>
            <Text className="font-bold text-white">
              {isOfficialPost ? displayName : `@${displayName}`}
            </Text>

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
              <MapPinLineIcon size={16} color="white" weight="fill" />
              <Text className="ml-2 font-semibold text-white">
                {post.restaurant.name}
              </Text>
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

        <TouchableOpacity>
          <ShareFatIcon
            weight="fill"
            color="#FFFFFFCC"
            size={35}
            style={iconShadow}
          />
          <Text style={textShadow} className="text-center text-lg text-white">
            {post.commentsCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleWantToTry}>
          <BookBookmarkIcon
            weight="fill"
            color={isWantToTry ? "#F7D786" : "#FFFFFFCC"}
            size={35}
            style={iconShadow}
          />

          <Text style={textShadow} className="text-center text-lg text-white">
            {post.restaurantSavesCount}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
