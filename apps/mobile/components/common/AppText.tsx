import { useAccessibilityPreferences } from "@/contexts/AccessibilityContext";
import { StyleSheet, Text as RNText, TextProps } from "react-native";

type Props = TextProps & {
  scaleWithAccessibility?: boolean;
  weight?:
    | "thin"
    | "light"
    | "regular"
    | "medium"
    | "bold"
    | "extrabold"
    | "black";
};

const classFontSizes: Record<string, number> = {
  "text-xs": 12,
  "text-sm": 14,
  "text-base": 16,
  "text-lg": 18,
  "text-xl": 20,
  "text-2xl": 24,
  "text-3xl": 30,
  "text-4xl": 36,
  "text-5xl": 48,
};

function classFontSize(className?: string) {
  if (!className) return undefined;
  const tokens = className.split(/\s+/);
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index];
    if (classFontSizes[token]) return classFontSizes[token];
    const arbitrary = token.match(/^text-\[(\d+(?:\.\d+)?)px\]$/);
    if (arbitrary) return Number(arbitrary[1]);
  }
  return undefined;
}

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

export default function Text({
  weight = "regular",
  scaleWithAccessibility = true,
  style,
  ...props
}: Props) {
  const { textScale, usesSystemTextSize, boldText } =
    useAccessibilityPreferences();
  const flattenedStyle = StyleSheet.flatten(style);
  const baseFontSize =
    flattenedStyle?.fontSize ?? classFontSize(props.className) ?? 14;
  const effectiveWeight = boldText && weight === "regular" ? "medium" : weight;

  return (
    <RNText
      {...props}
      allowFontScaling={scaleWithAccessibility && usesSystemTextSize}
      style={[
        {
          fontFamily: fonts[effectiveWeight],
        },
        style,
        scaleWithAccessibility && !usesSystemTextSize
          ? {
              fontSize: Math.round(baseFontSize * textScale),
              lineHeight: Math.round(baseFontSize * textScale * 1.35),
            }
          : null,
      ]}
    />
  );
}
