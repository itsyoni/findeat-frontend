import { useAppTheme } from "@/contexts/ThemeContext";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function SkeletonPulse({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.42, {
        duration: 850,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

export function Skeleton({
  width = "100%",
  height,
  radius = 12,
  circle = false,
  style,
}: {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { isDark } = useAppTheme();
  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: circle ? height / 2 : radius,
          backgroundColor: isDark ? "#242426" : "#E8E4DD",
        },
        style,
      ]}
    />
  );
}
