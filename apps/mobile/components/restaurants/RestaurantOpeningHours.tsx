import Text from "@/components/common/AppText";
import type {
  RestaurantOpeningHours as OpeningHours,
  RestaurantWeekday,
} from "@findeat/types";
import { RESTAURANT_WEEKDAYS } from "@findeat/types";
import { CaretDownIcon, ClockIcon } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

const weekdayByName: Record<string, RestaurantWeekday> = {
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  Saturday: "SATURDAY",
  Sunday: "SUNDAY",
};

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getCurrentRestaurantTime(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  const day = weekdayByName[part("weekday") ?? ""] ?? "MONDAY";
  return {
    day,
    minutes: Number(part("hour") ?? 0) * 60 + Number(part("minute") ?? 0),
  };
}

function getOpenState(hours: OpeningHours) {
  const now = getCurrentRestaurantTime(hours.timezone);
  const dayIndex = RESTAURANT_WEEKDAYS.indexOf(now.day);
  const previousDay = RESTAURANT_WEEKDAYS[(dayIndex + 6) % 7];

  for (const period of hours.weekly[now.day]) {
    const open = minutesFromTime(period.open);
    const close = minutesFromTime(period.close);
    if (
      (open < close && now.minutes >= open && now.minutes < close) ||
      (open > close && now.minutes >= open)
    ) {
      return { isOpen: true, closesAt: period.close, today: now.day };
    }
  }

  for (const period of hours.weekly[previousDay]) {
    const open = minutesFromTime(period.open);
    const close = minutesFromTime(period.close);
    if (open > close && now.minutes < close) {
      return { isOpen: true, closesAt: period.close, today: now.day };
    }
  }

  return { isOpen: false, closesAt: null, today: now.day };
}

function formatPeriods(periods: OpeningHours["weekly"][RestaurantWeekday]) {
  if (!periods.length) return null;
  return periods.map((period) => `${period.open}–${period.close}`).join(", ");
}

export default function RestaurantOpeningHours({ hours }: { hours?: OpeningHours | null }) {
  const { t, i18n } = useTranslation("restaurants");
  const [expanded, setExpanded] = useState(false);
  const [, setCurrentMinute] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentMinute(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!hours) return null;

  let state: ReturnType<typeof getOpenState>;
  try {
    state = getOpenState(hours);
  } catch {
    return null;
  }
  const todayHours = formatPeriods(hours.weekly[state.today]);

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      className="mt-3 w-full px-5"
    >
      <TouchableOpacity
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-900"
      >
        <View
          className="flex-row items-center"
          style={{ direction: i18n.language.startsWith("he") ? "rtl" : "ltr" }}
        >
          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${
              state.isOpen
                ? "bg-green-100 dark:bg-green-950"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            <ClockIcon
              size={19}
              color={state.isOpen ? "#16A34A" : "#6B7280"}
              weight="fill"
            />
          </View>
          <View className="mx-3 min-w-0 flex-1">
            <Text
              className={`font-bold ${
                state.isOpen
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {t(state.isOpen ? "openNow" : "closedNow")}
            </Text>
            <Text
              numberOfLines={1}
              className="mt-0.5 text-xs text-gray-500 dark:text-gray-400"
            >
              {state.isOpen && state.closesAt
                ? t("closesAt", { time: state.closesAt })
                : todayHours ?? t("closedToday")}
            </Text>
          </View>
          <CaretDownIcon
            size={18}
            color="#9CA3AF"
            weight="bold"
            style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
          />
        </View>

        {expanded ? (
          <View className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-800">
            {RESTAURANT_WEEKDAYS.map((day) => (
              <View
                key={day}
                className={`flex-row items-center justify-between rounded-lg px-2 py-2 ${
                  day === state.today ? "bg-white dark:bg-black" : ""
                }`}
                style={{
                  direction: i18n.language.startsWith("he") ? "rtl" : "ltr",
                }}
              >
                <Text
                  className={`text-sm ${
                    day === state.today
                      ? "font-bold text-black dark:text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {t(`weekdays.${day}`)}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                  {formatPeriods(hours.weekly[day]) ?? t("closed")}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function RestaurantOpeningHoursSummary({
  hours,
}: {
  hours?: OpeningHours | null;
}) {
  const { t } = useTranslation("restaurants");
  const [, setCurrentMinute] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentMinute(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!hours) return null;
  let state: ReturnType<typeof getOpenState> | null = null;
  try {
    state = getOpenState(hours);
  } catch {
    return null;
  }
  return (
    <View className="flex-row items-center">
      <View
        className={`mr-1.5 h-2 w-2 rounded-full ${
          state.isOpen ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      <Text
        className={`text-sm font-bold ${
          state.isOpen
            ? "text-green-700 dark:text-green-400"
            : "text-gray-600 dark:text-gray-300"
        }`}
      >
        {t(state.isOpen ? "openNow" : "closedNow")}
      </Text>
    </View>
  );
}
