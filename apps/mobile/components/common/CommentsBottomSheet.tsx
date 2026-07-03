import { api } from "@/lib/api";
import { Comment } from "@findeat/types";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "./AppText";

type Props = {
  postId: string | null;
};

export const CommentsBottomSheet = forwardRef<BottomSheet, Props>(
  ({ postId }, ref) => {
    const snapPoints = useMemo(() => ["60%", "90%"], []);

    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState("");

    useEffect(() => {
      if (postId) {
        loadComments();
      }
    }, [postId]);

    async function loadComments() {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data);
    }

    async function submitComment() {
      if (!postId || !content.trim()) return;

      await api.post(`/posts/${postId}/comments`, {
        content: content.trim(),
      });

      setContent("");
      await loadComments();
    }

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        <BottomSheetView className="flex-1 bg-white px-5 py-4">
          <Text className="mb-4 text-xl font-bold text-black">Comments</Text>

          <BottomSheetFlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mb-4">
                <Text className="font-bold text-black">
                  @{item.user.username}
                </Text>
                <Text className="mt-1 text-gray-700">{item.content}</Text>
              </View>
            )}
          />

          <View className="flex-row items-center gap-2 border-t border-gray-200 pt-3">
            <BottomSheetTextInput
              className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-black"
              placeholder="Add a comment..."
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
            />

            <TouchableOpacity
              className="rounded-2xl bg-black px-4 py-3"
              onPress={submitComment}
            >
              <Text className="font-bold text-white">Send</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

CommentsBottomSheet.displayName = "CommentsBottomSheet";
