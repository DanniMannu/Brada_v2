import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { RestaurantRepository } from "@/repositories/RestaurantRepository";

interface RestaurantContextType {
  restaurants: any[];

  loading: boolean;

  refreshRestaurants: () => Promise<void>;

  getRestaurantById: (
    id: string
  ) => any | undefined;
}

const RestaurantContext =
  createContext(
    {} as RestaurantContextType
  );

export function RestaurantProvider({
  children,
}: any) {
  const [restaurants, setRestaurants] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    refreshRestaurants();
  }, []);

  async function refreshRestaurants() {
    try {
      setLoading(true);

      const data =
        await RestaurantRepository.getAll();

      setRestaurants(data ?? []);
    } catch (error) {
      console.log(
        "Erro ao carregar restaurantes:",
        error
      );

      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }

  function getRestaurantById(
    id: string
  ) {
    return restaurants.find(
      (restaurant) =>
        restaurant.id === id
    );
  }

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        loading,
        refreshRestaurants,
        getRestaurantById,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurants =
  () => useContext(
    RestaurantContext
  );