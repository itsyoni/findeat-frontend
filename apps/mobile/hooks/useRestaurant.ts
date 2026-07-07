import { api } from "@/lib/api";
import type { Restaurant } from "@findeat/types";
import { useCallback, useEffect, useState } from "react";

export function useRestaurant(id?: string) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRestaurant = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const restaurant = await api.restaurants.get(id);
      setRestaurant(restaurant);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadRestaurant();
  }, [loadRestaurant]);

  return {
    restaurant,
    setRestaurant,
    loading,
    refresh: loadRestaurant,
  };
}
