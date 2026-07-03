import { Post } from "@findeat/types/post";
import { FlatList } from "react-native";
import ContentPost from "./ContentPost";

type Props = {
  posts: Post[];
  height: number;
  refreshing: boolean;
  onRefresh: () => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
  onToggleWantToTry: (
    postId: string,
    restaurantId: string,
    isWantToTry: boolean,
  ) => void;
  initialIndex?: number;
};

export default function ContentFeed({
  posts,
  height,
  refreshing,
  onRefresh,
  onToggleLike,
  onOpenComments,
  onToggleWantToTry,
  initialIndex = 0,
}: Props) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      decelerationRate="fast"
      initialScrollIndex={initialIndex}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
      renderItem={({ item }) => (
        <ContentPost
          post={item}
          height={height}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
          onToggleWantToTry={onToggleWantToTry}
        />
      )}
    />
  );
}
