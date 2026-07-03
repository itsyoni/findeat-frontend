import { Text as RNText, TextProps } from "react-native";

type Props = TextProps & {
  weight?:
    | "thin"
    | "light"
    | "regular"
    | "medium"
    | "bold"
    | "extrabold"
    | "black";
};

const fonts = {
  thin: "CabinetThin",
  extralight: "CabinetExtraLight",
  light: "CabinetLight",
  regular: "CabinetRegular",
  medium: "CabinetMedium",
  bold: "CabinetBold",
  extrabold: "CabinetExtraBold",
  black: "CabinetBlack",
};

export default function Text({ weight = "regular", style, ...props }: Props) {
  return (
    <RNText
      {...props}
      style={[
        {
          fontFamily: fonts[weight],
        },
        style,
      ]}
    />
  );
}
