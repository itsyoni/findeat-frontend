import { ActivityIndicator, View } from "react-native";

type Props = {
  backgroundColor?: string;
};

export default function LoadingScreen({ backgroundColor = "bg-white" }: Props) {
  return (
    <View className={`flex-1 items-center justify-center ${backgroundColor}`}>
      <ActivityIndicator />
    </View>
  );
}
