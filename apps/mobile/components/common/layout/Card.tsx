import { View } from "react-native";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: Props) {
  return (
    <View
      className={`rounded-2xl border border-gray-100 bg-white p-4 ${className}`}
    >
      {children}
    </View>
  );
}
