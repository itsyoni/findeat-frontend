import type { Dish, Menu } from "@findeat/types";
import type { AxiosInstance } from "axios";

export function createMenuApi(api: AxiosInstance) {
  return {
    async myMenus() {
      const { data } = await api.get<Menu[]>("/business/menus");
      return data;
    },

    async createMenu(payload: { title: string; description?: string | null }) {
      const { data } = await api.post<Menu>("/business/menus", payload);
      return data;
    },

    async getMenu(id: string) {
      const { data } = await api.get<Menu>(`/business/menus/${id}`);
      return data;
    },

    async getDish(dishId: string) {
      const { data } = await api.get<Dish>(`/menu-items/${dishId}`);
      return data;
    },

    async updateMenu(
      id: string,
      payload: { title?: string; description?: string | null },
    ) {
      const { data } = await api.patch<Menu>(`/business/menus/${id}`, payload);
      return data;
    },

    async deleteMenu(id: string) {
      const { data } = await api.delete<{ ok: boolean }>(
        `/business/menus/${id}`,
      );

      return data;
    },

    async createDish(
      menuId: string,
      payload: {
        name: string;
        description?: string | null;
        price?: number | null;
        imageUrl?: string | null;
        category?: string | null;
      },
    ) {
      const { data } = await api.post<Dish>(
        `/business/menus/${menuId}/dishes`,
        payload,
      );

      return data;
    },

    async updateDish(
      dishId: string,
      payload: {
        name?: string;
        description?: string | null;
        price?: number | null;
        imageUrl?: string | null;
        category?: string | null;
        isAvailable?: boolean;
        isFeatured?: boolean;
      },
    ) {
      const { data } = await api.patch<Dish>(
        `/business/menus/dishes/${dishId}`,
        payload,
      );

      return data;
    },

    async deleteDish(dishId: string) {
      const { data } = await api.delete<{ ok: boolean }>(
        `/business/menus/dishes/${dishId}`,
      );

      return data;
    },
  };
}
