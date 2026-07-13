import { SafeAreaView } from "react-native-safe-area-context";

type Edge = "top" | "right" | "bottom" | "left";

type Props = {
  children: React.ReactNode;
  className?: string;
  edges?: Edge[];
};

export default function Screen({
  children,
  className = "",
  edges = ["top"],
}: Props) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 bg-canvas dark:bg-black ${className}`}
    >
      {children}
    </SafeAreaView>
  );
}
