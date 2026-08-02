export interface Restaurant {
  id: string;

  name: string;

  description: string;

  image: string;

  category: string;

  cuisineType: string;

  rating: number;

  reviewsCount: number;

  deliveryTime: string;

  deliveryFee: number;

  distanceKm: number;

  isHalal: boolean;

  isFeatured?: boolean;

  isOpen?: boolean;
  
  isFavorite?: boolean;

  tags: string[];

  products: RestaurantProduct[];
}

export interface RestaurantProduct {
  id: string;

  restaurantId: string;

  name: string;

  description: string;

  image: string;

  price: number;

  category: string;

  available: boolean;

  isPopular?: boolean;
}