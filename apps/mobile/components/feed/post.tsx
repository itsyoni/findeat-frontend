import { View, Text, Image } from "react-native";
import wuk8phsl66h11 from "@/assets/images/wuk8phsl66h11.jpg";

type PostProps = {
  item: { id: string; text: string };
  height: number;
};

export default function Post({ item, height }: PostProps) {
  return (
    <View style={{ height }} className="justify-between items-center">
      <Image
        source={wuk8phsl66h11}
        style={{ width: "100%", height: "100%" }}
      ></Image>
      <View className="absolute inset-0 p-5 justify-end">
        <View className="gap-5">
          <View>
            <Text className="text-white text-2xl font-cabinet-bold">Yoni</Text>
          </View>

          <View>
            <Text className="text-white text-2xl font-cabinet-bold">Yoni</Text>
            <Text className="text-white text-xl font-cabinet">
              Really liked it
            </Text>
          </View>

          <View className="flex-row w-full gap-2">
            <View className="bg-white flex-1 h-1.5 rounded-full" />
            <View className="bg-white/50 flex-1 h-1.5 rounded-full" />
            <View className="bg-white/50 flex-1 h-1.5 rounded-full" />
            <View className="bg-white/50 flex-1 h-1.5 rounded-full" />
            <View className="bg-white/50 flex-1 h-1.5 rounded-full" />
            <View className="bg-white/50 flex-1 h-1.5 rounded-full" />
          </View>
        </View>
      </View>
    </View>
  );
}
