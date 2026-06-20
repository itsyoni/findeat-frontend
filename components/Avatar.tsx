import { Image, Text, View } from "react-native";

type Props = {
  uri?: string | null;
  username?: string | null;
  size?: number;
};

export default function Avatar({ uri, username, size = 80 }: Props) {
  const initial = username?.charAt(0).toUpperCase() || "?";

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      className="items-center justify-center bg-black"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text className="font-bold text-white" style={{ fontSize: size * 0.38 }}>
        {initial}
      </Text>
    </View>
  );
}
