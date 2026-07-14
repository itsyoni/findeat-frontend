import { Portal } from "@gorhom/portal";
import {
  Image,
  ImageProps,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { FullWindowOverlay } from "react-native-screens";
import Animated, {
  Extrapolation,
  interpolate,
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  resizeMode?: ImageProps["resizeMode"];
  maxScale?: number;
};

const resetSpring = {
  damping: 18,
  stiffness: 220,
  mass: 0.7,
};

export default function PinchZoomImage({
  uri,
  style,
  resizeMode = "cover",
  maxScale = 4,
}: Props) {
  const imageRef = useAnimatedRef<View>();
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const overlayActive = useSharedValue(0);

  const pinch = Gesture.Pinch()
    // The callback is a UI-thread gesture handler; it does not run during render.
    // eslint-disable-next-line react-hooks/refs
    .onBegin(() => {
      const measurement = measure(imageRef);
      if (!measurement) return;

      originX.value = measurement.pageX;
      originY.value = measurement.pageY;
      width.value = measurement.width;
      height.value = measurement.height;
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      overlayActive.value = 1;
    })
    .onUpdate((event) => {
      if (!overlayActive.value) return;

      const nextScale = Math.min(Math.max(event.scale, 1), maxScale);
      scale.value = nextScale;
      translateX.value =
        (width.value / 2 - event.focalX) * (nextScale - 1);
      translateY.value =
        (height.value / 2 - event.focalY) * (nextScale - 1);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, resetSpring, (finished) => {
        if (finished) overlayActive.value = 0;
      });
      translateX.value = withSpring(0, resetSpring);
      translateY.value = withSpring(0, resetSpring);
    });

  const sourceStyle = useAnimatedStyle(() => ({
    opacity: overlayActive.value ? 0 : 1,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity:
      overlayActive.value *
      interpolate(scale.value, [1, 2], [0, 0.62], Extrapolation.CLAMP),
  }));

  const overlayImageStyle = useAnimatedStyle(() => ({
    left: originX.value,
    top: originY.value,
    width: width.value,
    height: height.value,
    opacity: overlayActive.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const overlay = (
    <View pointerEvents="none" style={styles.overlayRoot}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <Animated.View style={[styles.overlayImage, overlayImageStyle]}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
        />
      </Animated.View>
    </View>
  );

  return (
    <>
      <GestureDetector gesture={pinch}>
        <Animated.View ref={imageRef} style={[style, sourceStyle]}>
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            resizeMode={resizeMode}
          />
        </Animated.View>
      </GestureDetector>

      <Portal hostName="pinch-zoom">
        {Platform.OS === "ios" ? (
          <FullWindowOverlay>{overlay}</FullWindowOverlay>
        ) : (
          overlay
        )}
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10000,
    elevation: 10000,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#000000",
  },
  overlayImage: {
    position: "absolute",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 24,
  },
});
