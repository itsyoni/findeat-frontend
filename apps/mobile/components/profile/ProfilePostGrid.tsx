import { Post, PostType } from "@findeat/types/post";
import { Image, Pressable, TouchableOpacity, View } from "react-native";
import Text from "../common/AppText";
import { ImagesSquareIcon, StarIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/contexts/ThemeContext";

type Props = {
  posts: Post[];
  type: PostType;
  onPressPost: (postId: string) => void;
  onCreatePost?: () => void;
};

function getPostImage(post: Post) {
  if (post.type === "REVIEW") {
    return post.reviewPost?.coverImageUrl ?? null;
  }

  return post.contentPost?.imageUrl ?? null;
}

function getPostText(post: Post) {
  if (post.type === "REVIEW") {
    return post.reviewPost?.summary ?? null;
  }

  return post.contentPost?.description ?? null;
}

export default function ProfilePostGrid({ posts, type, onPressPost, onCreatePost }: Props) {
  const { t } = useTranslation("profile");
  const { isDark } = useAppTheme();

  if (posts.length === 0) {
    const isReview = type === "REVIEW";
    const Icon = isReview ? StarIcon : ImagesSquareIcon;

    return (
      <View className="flex-1 items-center justify-center px-10 pb-16 pt-14">
        <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700">
          <Icon size={36} color={isDark ? "#FFF" : "#111"} />
        </View>
        <Text weight="bold" className="mt-5 text-xl text-black dark:text-white">
          {isReview ? t("noReviewsTitle") : t("noContentTitle")}
        </Text>
        <Text className="mt-2 text-center text-gray-500">
          {onCreatePost
            ? isReview
              ? t("noReviewsOwnBody")
              : t("noContentOwnBody")
            : isReview
              ? t("noReviewsBody")
              : t("noContentBody")}
        </Text>
        {onCreatePost ? (
          <TouchableOpacity onPress={onCreatePost} className="mt-5 rounded-xl bg-ink px-6 py-3 dark:bg-white">
            <Text weight="bold" className="text-white dark:text-black">
              {isReview ? t("createReview") : t("createPost")}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap">
      {posts.map((post) => {
        const imageUrl = getPostImage(post);
        const text = getPostText(post);

        return (
          <Pressable
            key={post.id}
            onPress={() => onPressPost(post.id)}
            className="aspect-square w-1/3 border-[0.5px] border-line bg-gray-200 dark:border-gray-900"
          >
            {imageUrl ? (
              <>
                <Image
                  source={{ uri: imageUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />

                {post.type === "REVIEW" && (
                  <>
                    <View className="absolute inset-0 bg-[#0000004D]" />

                    <View className="absolute right-2 top-2 rounded-full bg-[#00000099] px-3 py-1">
                      <Text className="text-xs font-bold text-white">
                        ⭐ {post.reviewPost?.overallRating}
                      </Text>
                    </View>
                  </>
                )}
              </>
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-900 px-2">
                <Text
                  className="text-center text-xs text-white"
                  numberOfLines={3}
                >
                  {text}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
