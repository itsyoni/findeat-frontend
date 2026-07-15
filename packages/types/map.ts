import type { RestaurantMapFilter, RestaurantMapSort } from "./restaurant";

export type MapViewMode = "MAP" | "LIST";

export type MapPreferences = {
  filter: RestaurantMapFilter;
  sort: RestaurantMapSort;
  radiusKm: number | null;
};
