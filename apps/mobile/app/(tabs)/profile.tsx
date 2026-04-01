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
        {/* <View className="absolute top-0 left-0 w-full flex-row justify-between px-5 pt-15 z-10">
          <ThemedButton
            className="rounded-full bg-[#00000050] h-10 w-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <Icon Icon={ArrowLeft} color="white" size={20} />
          </ThemedButton>
          <ThemedButton
            className="rounded-full bg-[#00000050] h-10 w-10 items-center justify-center"
            onPress={() => router.push("/settings")}
          >
            <Icon Icon={Settings} color="white" size={20} />
          </ThemedButton>
        </View> */}
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
      <View className="px-10 flex-1 flex flex-col items-center gap-7">
        <View className="w-full items-center">
          <Text className="text-black text-3xl font-cabinet-bold">
            {user?.username}
          </Text>
          <Text className="text-black text-xl font-cabinet">
            Here for the food
          </Text>
        </View>
        <View className="h-5 w-full flex-row justify-between">
          <View className="gap-1">
            <Text className="text-black text-center font-cabinet text-xl">
              Reviews
            </Text>
            <Text className="text-black text-center font-cabinet-bold text-xl">
              12
            </Text>
          </View>
          <View className="gap-1">
            <Text className="text-black text-center font-cabinet text-xl">
              Followers
            </Text>
            <Text className="text-black text-center font-cabinet-bold text-xl">
              12
            </Text>
          </View>
          <View className="gap-1">
            <Text className="text-black text-center font-cabinet text-xl">
              Following
            </Text>
            <Text className="text-black text-center font-cabinet-bold text-xl">
              12
            </Text>
          </View>
        </View>
        <ThemedButton
          className="mt-6 rounded-xl bg-[#f5f5f5] px-16 py-3"
          onPress={() => router.push("/settings")}
        >
          <Text className="text-black font-cabinet-bold text-xl">
            Edit Profile
          </Text>
        </ThemedButton>
      </View>
    </View>
  );
}
