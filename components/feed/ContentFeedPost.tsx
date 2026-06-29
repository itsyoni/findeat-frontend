import Avatar from "@/components/Avatar";
import { Post } from "@/types/post";
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
import Text from "../AppText";

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

export default function ContentFeedPost({
  post,
  height,
  onToggleLike,
  onOpenComments,
  onToggleWantToTry,
}: Props) {
  const userRestaurant = post.restaurant?.userSaves?.[0];
  const isWantToTry = !!userRestaurant?.wantToTry;
  const isBusinessPost = false;

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
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <View className="absolute inset-0 items-center justify-center bg-gray-900">
          <Text className="px-8 text-center text-2xl font-bold text-white">
            {post.description}
          </Text>
        </View>
      )}

      <View className="absolute bottom-8 left-4 right-20">
        <TouchableOpacity
          className="mb-3 flex-row items-center gap-3"
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: "/users/[id]",
              params: { id: post.author.id },
            });
          }}
        >
          <Avatar
            uri={post.author.avatarUrl}
            username={post.author.username}
            size={42}
          />

          <View>
            <Text className="font-bold text-white">
              @{post.author.username}
            </Text>

            {isBusinessPost && (
              <Text className="mt-1 text-xs font-semibold text-[#F7D786]">
                Official restaurant
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {!!post.restaurant?.name && (
          <Text className="mb-2 text-sm font-semibold text-white">
            <MapPinLineIcon size={20} color="#212121" weight="fill" />
            {post.restaurant.name}
          </Text>
        )}

        {!!post.description && (
          <Text className="text-base text-white">{post.description}</Text>
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

          <Text className="text-center text-lg text-white">
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
          <Text className="text-center text-lg text-white">
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
          <Text className="text-center text-lg text-white">
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
        </TouchableOpacity>
      </View>
    </View>
  );
}
