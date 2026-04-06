import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

type IconProps = {
  Icon: ComponentType<SvgProps>;
  size?: number;
  color?: string;
  style?: object;
};

export function Icon({ Icon, size = 24, color, style }: IconProps) {
  return <Icon width={size} height={size} color={color} style={style} />;
}
