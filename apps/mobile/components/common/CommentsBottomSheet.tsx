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
import { useCallback, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "./Avatar";
import Text from "./AppText";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/contexts/ThemeContext";
import SkeletonList from "./feedback/SkeletonList";
import { HeartIcon } from "phosphor-react-native";

type Props = {
  postId: string | null;
  onClose: () => void;
  onCommentAdded?: (postId: string) => void;
};

type CommentFooterProps = BottomSheetFooterProps & {
  bottomInset: number;
  replyingTo: Comment | null;
  onCancelReply: () => void;
  onAddComment: (content: string, replyToId?: string) => Promise<void>;
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
  replyingTo,
  onCancelReply,
  onAddComment,
  ...footerProps
}: CommentFooterProps) {
  const { t } = useTranslation("chat");
  const { isDark } = useAppTheme();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitComment() {
    const trimmed = content.trim();

    if (!trimmed || submitting) return;

    try {
      setSubmitting(true);
      await onAddComment(trimmed, replyingTo?.id);
      setContent("");
      onCancelReply();
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = !content.trim() || submitting;

  return (
    <BottomSheetFooter
      {...footerProps}
      bottomInset={0}
      style={{
        backgroundColor: isDark ? "#111827" : "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <View className="bg-white dark:bg-gray-900">
        <View
          className="border-t border-gray-200 bg-white px-4 pt-3 dark:border-gray-700 dark:bg-gray-900"
          style={{
            backgroundColor: isDark ? "#111827" : "white",
            paddingBottom: bottomInset,
          }}
        >
          {replyingTo ? (
            <View className="mb-2 flex-row items-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              <View className="h-full w-1 bg-brand" />
              <View className="min-w-0 flex-1 px-3 py-2">
                <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {t("replyingTo", { username: replyingTo.user.username })}
                </Text>
                <Text numberOfLines={1} className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {replyingTo.content}
                </Text>
              </View>
              <TouchableOpacity onPress={onCancelReply} hitSlop={8} className="h-10 w-10 items-center justify-center">
                <Text className="text-xl text-gray-500 dark:text-gray-300">×</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View className="flex-row items-center gap-2">
            <BottomSheetTextInput
              className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-black dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder={t("addComment")}
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
                {submitting ? t("sending") : t("send")}
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
  const { t } = useTranslation("chat");
  const { comments, loading, addComment, toggleCommentLike } = useComments(postId);
  const insets = useSafeAreaInsets();
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const threadedComments = useMemo(() => {
    const roots = comments.filter((comment) => !comment.parentId);
    const repliesByParent = new Map<string, Comment[]>();
    comments.forEach((comment) => {
      if (!comment.parentId) return;
      const replies = repliesByParent.get(comment.parentId) ?? [];
      replies.push(comment);
      repliesByParent.set(comment.parentId, replies);
    });
    const arranged = roots.flatMap((root) => [
      root,
      ...(repliesByParent.get(root.id) ?? []),
    ]);
    const arrangedIds = new Set(arranged.map((comment) => comment.id));
    return [...arranged, ...comments.filter((comment) => !arrangedIds.has(comment.id))];
  }, [comments]);

  const listRef =
    useRef<React.ElementRef<typeof BottomSheetFlatList<Comment>>>(null);

  const handleAddComment = useCallback(
    async (content: string, replyToId?: string): Promise<void> => {
      if (!postId) return;

      await addComment(content, replyToId);
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
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onAddComment={handleAddComment}
      />
    ),
    [handleAddComment, insets.bottom, replyingTo],
  );

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <View
        className="mb-5 flex-row gap-3"
        style={{ marginLeft: item.parentId ? 44 : 0 }}
      >
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/(users)/[id]", params: { id: item.user.id } })}
        >
          <Avatar uri={item.user.avatarUrl} size={item.parentId ? 34 : 40} />
        </TouchableOpacity>

        <View className="min-w-0 flex-1">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push({ pathname: "/(users)/[id]", params: { id: item.user.id } })}
          >
            <Text className="font-bold text-black dark:text-white">
              @{item.user.username}
            </Text>

            <Text className="ml-2 text-xs text-gray-400">
              {formatCommentTime(item.createdAt)}
            </Text>
          </TouchableOpacity>

          {item.parent ? (
            <Text className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
              {t("replyingTo", { username: item.parent.user.username })}
            </Text>
          ) : null}

          <Text className="mt-1 text-gray-700 dark:text-gray-300">
            {item.content}
          </Text>

          <View className="mt-2 flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => setReplyingTo(item)}
              hitSlop={8}
            >
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {t("reply")}
              </Text>
            </TouchableOpacity>
            {item.likedByAuthor ? (
              <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {t("likedByAuthor")}
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => void toggleCommentLike(item).catch(console.error)}
          hitSlop={8}
          className="w-9 items-center pt-1"
          accessibilityRole="button"
          accessibilityLabel={item.isLiked ? "Unlike comment" : "Like comment"}
        >
          <HeartIcon
            size={19}
            color={item.isLiked ? "#EF4444" : "#9CA3AF"}
            weight={item.isLiked ? "fill" : "regular"}
          />
          {item.likesCount > 0 ? (
            <Text className="mt-1 text-[11px] font-bold text-gray-500 dark:text-gray-400">
              {item.likesCount}
            </Text>
          ) : null}
        </TouchableOpacity>
      </View>
    ),
    [t, toggleCommentLike],
  );

  const closeSheet = useCallback(() => {
    setReplyingTo(null);
    onClose();
  }, [onClose]);

  return (
    <AppBottomSheet
      open={!!postId}
      snapPoints={["70%"]}
      onClose={closeSheet}
      footerComponent={renderFooter}
    >
      <BottomSheetFlatList
        ref={listRef}
        data={threadedComments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 130 + insets.bottom,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <Text className="mb-5 text-xl font-bold text-black dark:text-white">
            {t("comments")}
          </Text>
        }
        ListEmptyComponent={
          loading ? (
            <SkeletonList variant="comments" count={5} />
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-center text-base text-gray-400">
                {t("noComments")}
              </Text>

              <Text className="mt-1 text-center text-sm text-gray-400">
                {t("firstComment")}
              </Text>
            </View>
          )
        }
      />
    </AppBottomSheet>
  );
}
