import { FlatList, useWindowDimensions } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Post from "./post";

const DATA = [
  { id: "1", text: "Post 1" },
  { id: "2", text: "Post 2" },
  { id: "3", text: "Post 3" },
];

export default function MainFeed() {
  const tabBarHeight = useBottomTabBarHeight();
  const { height } = useWindowDimensions();

  const usableHeight = height - tabBarHeight;
  return (
    <FlatList
      data={DATA}
      renderItem={({ item }) => <Post item={item} height={usableHeight} />}
      keyExtractor={(item) => item.id}
      snapToInterval={usableHeight}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      windowSize={3}
      initialNumToRender={1}
    />
  );
}
