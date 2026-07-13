import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RestaurantMapFilter, RestaurantMapSort } from "@findeat/types";

export type MapPreferences = {
  filter: RestaurantMapFilter;
  sort: RestaurantMapSort;
  radiusKm: number | null;
};

export const DEFAULT_MAP_PREFERENCES: MapPreferences = {
  filter: "ALL",
  sort: "BEST",
  radiusKm: 50,
};

const FILTERS: RestaurantMapFilter[] = [
  "ALL",
  "SAVED",
  "WANT_TO_TRY",
  "VISITED",
  "FAVORITE",
  "CLAIMED",
];
const SORTS: RestaurantMapSort[] = [
  "BEST",
  "DISTANCE",
  "RATING",
  "MOST_REVIEWED",
];
const RADII = [10, 50, 100, 200, null];

function storageKey(userId: string) {
  return `findeat_map_preferences_${userId}`;
}

export async function getMapPreferences(userId: string) {
  try {
    const stored = await AsyncStorage.getItem(storageKey(userId));
    if (!stored) return DEFAULT_MAP_PREFERENCES;

    const parsed = JSON.parse(stored) as Partial<MapPreferences>;
    return {
      filter: FILTERS.includes(parsed.filter as RestaurantMapFilter)
        ? (parsed.filter as RestaurantMapFilter)
        : DEFAULT_MAP_PREFERENCES.filter,
      sort: SORTS.includes(parsed.sort as RestaurantMapSort)
        ? (parsed.sort as RestaurantMapSort)
        : DEFAULT_MAP_PREFERENCES.sort,
      radiusKm: RADII.includes(parsed.radiusKm as number | null)
        ? (parsed.radiusKm as number | null)
        : DEFAULT_MAP_PREFERENCES.radiusKm,
    };
  } catch {
    return DEFAULT_MAP_PREFERENCES;
  }
}

export async function saveMapPreferences(
  userId: string,
  preferences: MapPreferences,
) {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(preferences));
}
