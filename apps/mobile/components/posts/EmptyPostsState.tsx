import Text from "@/components/common/AppText";
import { router } from "expo-router";
import { PlusIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

type Props = {
  type: "CONTENT" | "REVIEW";
};

export default function EmptyPostsState({ type }: Props) {
  function openCreatePage() {
    router.push({
      pathname: "/create",
      params: {
        type,
      },
    });
  }

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-2xl font-bold text-black">
        עדיין אין פוסטים
      </Text>

      <Text className="mt-2 text-center text-base text-gray-500">
        תהיה הראשון להעלות פוסט
      </Text>

      <TouchableOpacity
        className="mt-6 flex-row items-center rounded-full bg-black px-6 py-3"
        activeOpacity={0.8}
        onPress={openCreatePage}
      >
        <PlusIcon size={20} color="white" weight="bold" />

        <Text className="ml-2 font-bold text-white">העלאת פוסט</Text>
      </TouchableOpacity>
    </View>
  );
}
