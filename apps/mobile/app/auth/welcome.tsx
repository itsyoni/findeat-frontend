import { ThemedButton } from "@/components/ThemedButton";
import { useRouter } from "expo-router";
import { Text, View, Image } from "react-native";
import Welcome from "@/assets/images/welcome.png";
import { Icon } from "@/components/Icon";
import Arrow from "@/assets/icons/ArrowRight.svg";

export default function LoginScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-[#F7D786]">
      <Image source={Welcome} style={{ width: "100%", height: 400 }} />
      <View className="flex-1 justify-center items-center px-5">
        <View className="w-full flex-col items-center gap-5 mt-10">
          <ThemedButton
            className="w-full rounded-full bg-[#212121] py-5"
            onPress={() => router.push("/auth/login")}
          >
            <Text className="text-white text-2xl font-cabinet-extrabold">
              Log In
            </Text>
          </ThemedButton>

          <ThemedButton
            className="w-full rounded-full border-2 border-[#212121] py-5"
            onPress={() => router.push("/auth/register")}
          >
            <Text className="text-2xl text-[#212121] font-cabinet-extrabold">
              Sign Up
            </Text>
          </ThemedButton>
          <View className="flex-row items-center">
            <Text className="text-2xl text-[#212121] font-cabinet">
              continue as guest
            </Text>
            <Icon Icon={Arrow} />
          </View>
        </View>
      </View>
      <View className="items-center py-10">
        <Text className="text-2xl text-[#212121] font-cabinet">
          Business? Add your business now!
        </Text>
      </View>
    </View>
  );
}
