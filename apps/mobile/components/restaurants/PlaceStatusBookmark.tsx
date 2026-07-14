import {
  BookmarkSimpleIcon,
  CheckIcon,
  HeartIcon,
} from "phosphor-react-native";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  wantToTry: boolean;
  visited: boolean;
  favorite: boolean;
  size: number;
  defaultColor: string;
  style?: StyleProp<ViewStyle>;
};

export function getPlaceStatusLabelKey(
  wantToTry: boolean,
  visited: boolean,
  favorite: boolean,
) {
  if (favorite) return "favorite";
  if (visited) return "visited";
  if (wantToTry) return "wantToTry";
  return "savePlace";
}

export default function PlaceStatusBookmark({
  wantToTry,
  visited,
  favorite,
  size,
  defaultColor,
  style,
}: Props) {
  const color = favorite
    ? "#FF3040"
    : visited
      ? "#22C55E"
      : wantToTry
        ? "#F7D786"
        : defaultColor;
  const indicatorSize = Math.round(size * 0.43);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <BookmarkSimpleIcon size={size} color={color} weight="fill" />
      {(visited || favorite) && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: size * 0.16,
            },
          ]}
        >
          {favorite ? (
            <HeartIcon
              size={indicatorSize}
              color="white"
              weight="fill"
            />
          ) : (
            <CheckIcon
              size={indicatorSize}
              color="white"
              weight="bold"
            />
          )}
        </View>
      )}
    </View>
  );
}
