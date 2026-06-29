import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import Text from "../AppText";

type Props = {
  accountId: string;
  postsCount: number;
  followersCount: number;
};

export default function RestaurantStats({
  accountId,
  postsCount,
  followersCount,
}: Props) {
  return (
    <View className="mt-5 flex-row">
      <View className="mr-8">
        <Text className="text-xl font-bold">{postsCount}</Text>
        <Text className="text-gray-500">Posts</Text>
      </View>

      <TouchableOpacity
        className="mr-8"
        onPress={() =>
          router.push({
            pathname: "/users/connections",
            params: { id: accountId, type: "followers" },
          })
        }
      >
        <Text className="text-xl font-bold">{followersCount}</Text>
        <Text className="text-gray-500">Followers</Text>
      </TouchableOpacity>
    </View>
  );
}
