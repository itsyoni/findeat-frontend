import AppBottomSheet from "@/components/common/AppBottomSheet";
import { useComments } from "@/hooks/useComments";
import type { Comment } from "@findeat/types";
import {
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "./Avatar";
import Text from "./AppText";

type Props = {
  postId: string | null;
  onClose: () => void;
  onCommentAdded?: (postId: string) => void;
};

type CommentFooterProps = BottomSheetFooterProps & {
  bottomInset: number;
  onAddComment: (content: string) => Promise<void>;
};

function formatCommentTime(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();

  const diffInSeconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  );

  if (diffInSeconds < 60) {
    return "עכשיו";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `לפני ${diffInMinutes} דק׳`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `לפני ${diffInHours} שע׳`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7) {
    return `לפני ${diffInDays} ימים`;
  }

  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function CommentFooter({
  bottomInset,
  onAddComment,
  ...footerProps
}: CommentFooterProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitComment() {
    const trimmed = content.trim();

    if (!trimmed || submitting) return;

    try {
      setSubmitting(true);
      await onAddComment(trimmed);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = !content.trim() || submitting;

  return (
    <BottomSheetFooter
      {...footerProps}
      bottomInset={bottomInset}
      style={{
        backgroundColor: "white",
      }}
    >
      <View style={{ backgroundColor: "white" }}>
        <View className="border-t border-gray-200 bg-white px-4 pb-3 pt-3">
          <View className="flex-row items-center gap-2">
            <BottomSheetTextInput
              className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-black"
              placeholder="Add a comment..."
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              onSubmitEditing={submitComment}
              returnKeyType="send"
              blurOnSubmit={false}
              editable={!submitting}
            />

            <TouchableOpacity
              className="rounded-2xl bg-black px-4 py-3"
              onPress={submitComment}
              disabled={disabled}
              style={{
                opacity: disabled ? 0.4 : 1,
              }}
            >
              <Text className="font-bold text-white">
                {submitting ? "Sending..." : "Send"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BottomSheetFooter>
  );
}

export default function CommentsBottomSheet({
  postId,
  onClose,
  onCommentAdded,
}: Props) {
  const { comments, loading, addComment } = useComments(postId);
  const insets = useSafeAreaInsets();

  const listRef =
    useRef<React.ElementRef<typeof BottomSheetFlatList<Comment>>>(null);

  const handleAddComment = useCallback(
    async (content: string): Promise<void> => {
      if (!postId) return;

      await addComment(content);
      onCommentAdded?.(postId);

      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({
          animated: true,
        });
      });
    },
    [postId, addComment, onCommentAdded],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <CommentFooter
        {...props}
        bottomInset={insets.bottom}
        onAddComment={handleAddComment}
      />
    ),
    [handleAddComment, insets.bottom],
  );

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <TouchableOpacity
        className="mb-5 flex-row gap-3"
        onPress={() =>
          router.push({
            pathname: "/(users)/[id]",
            params: {
              id: item.user.id,
            },
          })
        }
      >
        <Avatar uri={item.user.avatarUrl} size={40} />

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center">
            <Text className="font-bold text-black">@{item.user.username}</Text>

            <Text className="ml-2 text-xs text-gray-400">
              {formatCommentTime(item.createdAt)}
            </Text>
          </View>

          <Text className="mt-1 text-gray-700">{item.content}</Text>
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  return (
    <AppBottomSheet
      open={!!postId}
      snapPoints={["70%"]}
      onClose={onClose}
      footerComponent={renderFooter}
    >
      <BottomSheetFlatList
        ref={listRef}
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100 + insets.bottom,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <Text className="mb-5 text-xl font-bold text-black">Comments</Text>
        }
        ListEmptyComponent={
          loading ? (
            <View className="flex-1 items-center justify-center py-10">
              <ActivityIndicator />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-center text-base text-gray-400">
                No comments yet.
              </Text>

              <Text className="mt-1 text-center text-sm text-gray-400">
                Be the first to comment!
              </Text>
            </View>
          )
        }
      />
    </AppBottomSheet>
  );
}
