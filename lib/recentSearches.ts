import { RecentSearchItem } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "findeat_recent_searches";

export async function getRecentSearches() {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? (JSON.parse(data) as RecentSearchItem[]) : [];
}

export async function addRecentSearch(item: RecentSearchItem) {
  const current = await getRecentSearches();

  const filtered = current.filter(
    (search) => !(search.id === item.id && search.type === item.type),
  );

  const updated = [item, ...filtered].slice(0, 10);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return updated;
}

export async function removeRecentSearch(
  id: string,
  type: RecentSearchItem["type"],
) {
  const items = await getRecentSearches();

  const updated = items.filter(
    (item) => !(item.id === id && item.type === type),
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return updated;
}

export async function clearRecentSearches() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
