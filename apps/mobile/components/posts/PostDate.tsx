import Text from "@/components/common/AppText";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const HOUR_IN_MS = 60 * 60 * 1000;

function isSameCalendarDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

type Props = {
  createdAt: string;
  tone?: "overlay" | "surface";
  hasContentAbove?: boolean;
};

export default function PostDate({
  createdAt,
  tone = "surface",
  hasContentAbove = false,
}: Props) {
  const { t, i18n } = useTranslation("common");
  const isRtl = i18n.language.startsWith("he");

  const dateLabel = useMemo(() => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return null;

    const now = new Date();

    if (isSameCalendarDay(date, now)) {
      const elapsedHours = Math.max(
        0,
        Math.floor((now.getTime() - date.getTime()) / HOUR_IN_MS),
      );

      return elapsedHours === 0
        ? t("justNow")
        : t("hoursAgo", { count: elapsedHours });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (isSameCalendarDay(date, yesterday)) return t("yesterday");

    const formattedDate = new Intl.DateTimeFormat(
      isRtl ? "he-IL" : "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ).format(date);

    return t("postedOn", { date: formattedDate });
  }, [createdAt, isRtl, t]);

  if (!dateLabel) return null;

  return (
    <Text
      className={
        tone === "overlay"
          ? `${hasContentAbove ? "mt-2 " : ""}text-xs text-white/70`
          : `${hasContentAbove ? "mt-2 " : ""}text-xs text-gray-400 dark:text-gray-500`
      }
      style={{
        alignSelf: "stretch",
        textAlign: "auto",
        writingDirection: isRtl ? "rtl" : "ltr",
      }}
    >
      {dateLabel}
    </Text>
  );
}
