import { Text, View, ImageBackground, Image } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedButton } from "@/components/ThemedButton";
import { useRouter } from "expo-router";
// import { Icon } from "@/components/Icon";
// import Settings from "@/assets/icons/Cog6ToothSolid.svg";
// import ArrowLeft from "@/assets/icons/ArrowLeft.svg";

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View className="flex-1 bg-white">
      <View>
        <ImageBackground
          source={require("@/assets/images/Cinderella_Castle_Perspectives_-_Banner_view.png")}
          className="w-full h-[200]"
          resizeMode="cover"
        />
        <Image
          source={require("@/assets/images/portrait-white-man-isolated.jpg")}
          className="w-32 h-32 rounded-full -mt-16 self-center border-8 border-white"
        />
      </View>
      <View className="px-10 flex-1 flex flex-col items-center gap-5">
        <View className="w-full items-center gap-2">
          <View>
            <Text className="text-[#212121] text-3xl font-cabinet-extrabold">
              {user?.displayName}
            </Text>
            <Text className="text-gray-500 text-xl font-cabinet-medium">
              @{user?.username}
            </Text>
          </View>
          <Text className="text-[#212121] text-xl font-cabinet">
            {user?.bio || "No bio yet."}
          </Text>
        </View>
        <View className="w-full flex-row justify-between">
          <View className="gap-1">
            <Text className="text-[#212121] text-center font-cabinet text-xl">
              Reviews
            </Text>
            <Text className="text-[#212121] text-center font-cabinet-bold text-xl">
              {user?.reviewsCount}
            </Text>
          </View>
          <View className="gap-1">
            <Text className="text-[#212121] text-center font-cabinet text-xl">
              Followers
            </Text>
            <Text className="text-[#212121] text-center font-cabinet-bold text-xl">
              {user?.followersCount}
            </Text>
          </View>
          <View className="gap-1">
            <Text className="text-[#212121] text-center font-cabinet text-xl">
              Following
            </Text>
            <Text className="text-[#212121] text-center font-cabinet-bold text-xl">
              {user?.followingCount}
            </Text>
          </View>
        </View>
        <ThemedButton
          className="mt-6 rounded-xl bg-[#f5f5f5] px-16 py-3"
          onPress={() => router.push("/settings")}
        >
          <Text className="text-[#212121] font-cabinet-bold text-xl">
            Edit Profile
          </Text>
        </ThemedButton>
      </View>
    </View>
  );
}
