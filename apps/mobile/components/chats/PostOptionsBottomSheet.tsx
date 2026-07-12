import AppBottomSheet from "@/components/common/AppBottomSheet";
import Text from "@/components/common/AppText";
import { TrashIcon } from "phosphor-react-native";
import { TouchableOpacity } from "react-native";

type Props = {
  postId: string | null;
  onClose: () => void;
  onDelete: (postId: string) => void;
};

export default function PostOptionsBottomSheet({
  postId,
  onClose,
  onDelete,
}: Props) {
  return (
    <AppBottomSheet open={!!postId} snapPoints={["22%"]} onClose={onClose}>
      <Text className="mb-4 text-xl font-bold">Post options</Text>

      <TouchableOpacity
        className="flex-row items-center rounded-2xl bg-red-50 px-4 py-4"
        onPress={() => {
          if (!postId) return;
          onDelete(postId);
          onClose();
        }}
      >
        <TrashIcon size={22} color="#DC2626" weight="fill" />
        <Text className="ml-3 text-base font-bold text-red-600">
          Delete post
        </Text>
      </TouchableOpacity>
    </AppBottomSheet>
  );
}
