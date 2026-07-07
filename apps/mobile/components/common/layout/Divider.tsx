import { View } from "react-native";

type Props = {
  className?: string;
};

export default function Divider({ className = "" }: Props) {
  return <View className={`h-px bg-gray-100 ${className}`} />;
}
