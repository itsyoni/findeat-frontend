import { useAppTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = {
  count?: number;
  variant?: "rows" | "comments" | "grid" | "menu";
};

export default function SkeletonList({ count = 5, variant = "rows" }: Props) {
  const { isDark } = useAppTheme();
  const opacity = useSharedValue(1);
  const color = isDark ? "#242426" : "#E8E4DD";

  useEffect(() => {
    opacity.set(
      withRepeat(
        withTiming(0.48, {
          duration: 850,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (variant === "grid") {
    return (
      <Animated.View style={[styles.grid, animatedStyle]}>
        {Array.from({ length: count }, (_, index) => (
          <View key={index} style={[styles.gridItem, { backgroundColor: color }]} />
        ))}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.rows, animatedStyle]}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.row}>
          <View
            style={[
              variant === "menu" ? styles.menuImage : styles.avatar,
              { backgroundColor: color },
            ]}
          />
          <View style={styles.copy}>
            <View style={[styles.title, { backgroundColor: color }]} />
            <View style={[styles.subtitle, { backgroundColor: color }]} />
            {variant === "comments" ? (
              <View style={[styles.commentLine, { backgroundColor: color }]} />
            ) : null}
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 16, paddingHorizontal: 16, paddingVertical: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  menuImage: { width: 88, height: 72, borderRadius: 14 },
  copy: { flex: 1, gap: 8 },
  title: { width: "64%", height: 14, borderRadius: 7 },
  subtitle: { width: "42%", height: 11, borderRadius: 6 },
  commentLine: { width: "88%", height: 11, borderRadius: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 2 },
  gridItem: { width: "33%", aspectRatio: 1 },
});
