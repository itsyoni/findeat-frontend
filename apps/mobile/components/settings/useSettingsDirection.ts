import { useTranslation } from "react-i18next";

export default function useSettingsDirection() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith("he");

  return {
    isRtl,
    rowStyle: { direction: isRtl ? ("rtl" as const) : ("ltr" as const) },
    textStyle: {
      textAlign: "auto" as const,
      writingDirection: isRtl ? ("rtl" as const) : ("ltr" as const),
    },
  };
}
