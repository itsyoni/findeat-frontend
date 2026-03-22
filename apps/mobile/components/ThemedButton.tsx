import { Pressable, PressableProps } from "react-native";
import { ReactNode } from "react";

type ThemedButtonProps = PressableProps & {
  children: ReactNode;
  className?: string;
};

export function ThemedButton({
  children,
  className = "",
  ...props
}: ThemedButtonProps) {
  return (
    <Pressable
      className={`items-center justify-center rounded-2xl active:opacity-70 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </Pressable>
  );
}
