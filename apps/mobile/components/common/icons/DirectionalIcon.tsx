import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "phosphor-react-native";
import type { IconProps } from "phosphor-react-native";
import { I18nManager } from "react-native";

type Props = {
  direction: "back" | "forward";
  variant?: "arrow" | "caret";
  size?: number;
  color?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
};

export default function DirectionalIcon({
  direction,
  variant = "caret",
  size = 24,
  color = "currentColor",
  weight = "regular",
}: Props) {
  const pointsRight = direction === "back" ? I18nManager.isRTL : !I18nManager.isRTL;

  if (variant === "arrow") {
    const Icon = pointsRight ? ArrowRightIcon : ArrowLeftIcon;
    return <Icon size={size} color={color} weight={weight} />;
  }

  const Icon = pointsRight ? CaretRightIcon : CaretLeftIcon;
  return <Icon size={size} color={color} weight={weight} />;
}

export function DirectionalBackIcon(props: IconProps) {
  const Icon = I18nManager.isRTL ? CaretRightIcon : CaretLeftIcon;
  return <Icon {...props} />;
}
