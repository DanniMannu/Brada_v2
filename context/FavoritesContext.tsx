import React, {
    createContext,
    useContext,
    useState,
} from "react";

const FavoritesContext =
  createContext<any>(null);

export function FavoritesProvider({
  children,
}: any) {
  const [favorites, setFavorites] =
    useState<string[]>([]);

  const toggleFavorite = (
    restaurantId: string
  ) => {
    setFavorites((prev) =>
      prev.includes(restaurantId)
        ? prev.filter(
            (id) =>
              id !== restaurantId
          )
        : [...prev, restaurantId]
    );
  };

  const isFavorite = (
    restaurantId: string
  ) =>
    favorites.includes(
      restaurantId
    );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () =>
  useContext(FavoritesContext);