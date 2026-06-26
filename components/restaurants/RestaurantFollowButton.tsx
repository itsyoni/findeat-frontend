import { Text, TouchableOpacity } from "react-native";

type Props = {
  isFollowing: boolean;
  onPress: () => void;
};

export default function RestaurantFollowButton({
  isFollowing,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      className={`mt-6 rounded-2xl py-4 ${
        isFollowing ? "bg-gray-200" : "bg-black"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-center font-bold ${
          isFollowing ? "text-black" : "text-white"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </Text>
    </TouchableOpacity>
  );
}
