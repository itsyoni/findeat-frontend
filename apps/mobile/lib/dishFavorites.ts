type DishFavoriteChange = {
  dishId: string;
  isFavorite: boolean;
  favoriteCount: number;
};

type DishFavoriteListener = (change: DishFavoriteChange) => void;

const listeners = new Set<DishFavoriteListener>();

export function publishDishFavoriteChange(change: DishFavoriteChange) {
  listeners.forEach((listener) => listener(change));
}

export function subscribeToDishFavoriteChanges(listener: DishFavoriteListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
