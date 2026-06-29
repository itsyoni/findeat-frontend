import Avatar from "@/components/Avatar";
import { Post } from "@/types/post";
import {
  BookBookmarkIcon,
  ChatCircleIcon,
  HeartIcon,
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
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
  onToggleWantToTry: (
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) => void;
};

export default function FeedPostCard({
  post,
  onToggleLike,
  onOpenComments,
  onToggleWantToTry,
}: Props) {
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
      <View className="mb-3 flex-row items-center gap-3 px-4">
        <Avatar
          uri={post.author.avatarUrl}
          username={post.author.username}
          size={42}
        />

        <View>
          <Text className="font-bold text-black">@{post.author.username}</Text>
          <Text className="text-xs text-gray-400">Content post</Text>

          {!!post.restaurant && (
            <Text className="text-xs text-gray-500">
              📍 {post.restaurant.name}
              {post.restaurant.city ? ` · ${post.restaurant.city}` : ""}
            </Text>
          )}

          {post.type === "REVIEW" && post.rating != null && (
            <Text className="mt-2 text-lg font-bold text-black">
              ⭐ {post.rating}/10
            </Text>
          )}
        </View>
      </View>

      {!!post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          className="h-96 w-full bg-gray-100"
          resizeMode="cover"
        />
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

          <TouchableOpacity
            onPress={handleWantToTry}
            className="flex-col items-center gap-1"
          >
            <BookBookmarkIcon
              weight={isWantToTry ? "fill" : "regular"}
              color={isWantToTry ? "#F7D786" : "#212121"}
              size={28}
            />
          </TouchableOpacity>
        </View>

        {!!post.title && (
          <Text className="mt-3 text-base font-bold text-black">
            {post.title}
          </Text>
        )}

        {!!post.description && (
          <Text className="mt-1 text-gray-700">{post.description}</Text>
        )}
      </View>
    </View>
  );
}
