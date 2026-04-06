import {
  View,
  Text,
  Image,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useState } from "react";
import wuk8phsl66h11 from "@/assets/images/wuk8phsl66h11.jpg";
import Fire from "@/assets/icons/FireSolid.svg";
import FaceUp from "@/assets/icons/FaceSmileSolid.svg";
import FaceDown from "@/assets/icons/FaceFrownSolid.svg";
import Comments from "@/assets/icons/ChatBubbleOvalLeftEllipsisSolid.svg";
import Send from "@/assets/icons/PaperAirplaneSolid.svg";
import Save from "@/assets/icons/BookmarkSolid.svg";
import SpeedDial from "@/components/SpeedDial";
import { Icon } from "@/components/Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "../ThemedButton";

type PostProps = {
  item: { id: string; text: string };
  height: number;
};

const DATA = [
  { id: "1", title: "Item 1", source: wuk8phsl66h11 },
  { id: "2", title: "Item 2", source: wuk8phsl66h11 },
  { id: "3", title: "Item 3", source: wuk8phsl66h11 },
  { id: "4", title: "Item 4", source: wuk8phsl66h11 },
  { id: "5", title: "Item 5", source: wuk8phsl66h11 },
  { id: "6", title: "Item 6", source: wuk8phsl66h11 },
];

export default function Post({ item, height }: PostProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);

    setActiveIndex((prev) => (prev === index ? prev : index));
  };

  return (
    <View style={{ height }} className="relative bg-white">
      <View pointerEvents="none" className="bg-white p-5 pt-20">
        <Text className="text-black text-2xl font-cabinet-bold">Yoni</Text>
      </View>

      <View className="flex-1 relative">
        <FlatList
          data={DATA}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <Image source={item.source} style={{ width, height: "100%" }} />
          )}
        />

        <View
          pointerEvents="box-none"
          className="absolute inset-0 p-5 justify-end"
        >
          <View className="flex-1 justify-between">
            <View className="gap-5 justify-end flex-1">
              <View className="items-end">
                <View className="gap-5">
                  <SpeedDial
                    mainIcon={Fire}
                    direction="horizontal"
                    actions={[
                      {
                        key: "hot",
                        label: "Hot",
                        icon: Fire,
                        onPress: () => console.log("Hot"),
                      },
                      {
                        key: "up",
                        label: "Like",
                        icon: FaceUp,
                        onPress: () => console.log("Like"),
                      },
                      {
                        key: "down",
                        label: "Nah",
                        icon: FaceDown,
                        onPress: () => console.log("Nah"),
                      },
                    ]}
                  />
                  <View className="items-center justify-center">
                    <Icon Icon={Comments} color="white" size={35} />
                    <Text className="text-white font-cabinet-bold text-lg mt-1">
                      120
                    </Text>
                  </View>

                  <View className="items-center justify-center">
                    <Icon Icon={Save} color="white" size={35} />
                    <Text className="text-white font-cabinet-bold text-lg mt-1">
                      120
                    </Text>
                  </View>

                  <View className="items-center justify-center">
                    <View
                      style={{ width: 35, height: 35 }}
                      className="items-center justify-center"
                    >
                      <Icon
                        Icon={Send}
                        color="white"
                        size={35}
                        style={{
                          transform: [{ rotate: "-25deg" }, { translateX: 4 }],
                        }}
                      />
                    </View>
                    <Text className="text-white font-cabinet-bold text-lg mt-1">
                      120
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="bg-white p-5 gap-5">
        <View pointerEvents="none">
          <Text className="text-black text-xl font-cabinet-medium">
            Really liked it
          </Text>
        </View>

        <View pointerEvents="none" className="flex-row w-full gap-2">
          {DATA.map((_, index) => (
            <View
              key={index}
              className="flex-1 h-1.5 rounded-full bg-black"
              style={{ opacity: index === activeIndex ? 1 : 0.5 }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
