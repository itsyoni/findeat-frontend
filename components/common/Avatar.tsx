import { Image, StyleProp, View, ViewStyle } from "react-native";
import { SvgUri } from "react-native-svg";

type Props = {
  uri?: string | null;
  username?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Avatar({ uri, size = 40, style }: Props) {
  if (!uri) return null;

  const isSvg = uri.startsWith("data:image/svg+xml") || uri.endsWith(".svg");

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {isSvg ? (
        <SvgUri width={size} height={size} uri={uri} />
      ) : (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      )}
    </View>
  );
}
