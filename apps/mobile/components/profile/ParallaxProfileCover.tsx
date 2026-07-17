import { Animated, StyleSheet, View } from "react-native";

export const PROFILE_COVER_HEIGHT = 240;

type Props = {
  uri?: string | null;
  scrollY: Animated.Value;
};

export default function ParallaxProfileCover({ uri, scrollY }: Props) {
  const translateY = scrollY.interpolate({
    inputRange: [-PROFILE_COVER_HEIGHT, 0, PROFILE_COVER_HEIGHT],
    outputRange: [-PROFILE_COVER_HEIGHT / 2, 0, PROFILE_COVER_HEIGHT * 0.55],
    extrapolate: "clamp",
  });
  const scale = scrollY.interpolate({
    inputRange: [-PROFILE_COVER_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolateRight: "clamp",
  });

  return (
    <View style={styles.frame}>
      {uri ? (
        <Animated.Image
          source={{ uri }}
          resizeMode="cover"
          style={[styles.cover, { transform: [{ translateY }, { scale }] }]}
        />
      ) : (
        <Animated.View
          className="bg-gray-200 dark:bg-gray-800"
          style={[styles.cover, { transform: [{ translateY }, { scale }] }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: PROFILE_COVER_HEIGHT,
    width: "100%",
    overflow: "hidden",
  },
  cover: {
    height: PROFILE_COVER_HEIGHT,
    width: "100%",
  },
});
