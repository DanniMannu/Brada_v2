import { Restaurant } from "@/app/types/restaurant";

const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Chicken Spot",
    description: "Frango grelhado, hambúrgueres e refeições rápidas.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",

    category: "Frango",

    cuisineType: "Fast Food",

    rating: 4.8,
    reviewsCount: 234,

    deliveryTime: "25-35 min",
    deliveryFee: 49,
    distanceKm: 2.3,

    isHalal: true,

    isFeatured: true,
    isOpen: true,

    tags: ["Frango", "Fast Food", "Halal"],

    products: [
      {
        id: "101",
        restaurantId: "1",
        name: "Frango Inteiro",
        description: "Frango grelhado com molho especial.",
        image:
          "https://images.unsplash.com/photo-1606755962773-d324e0a13086",
        price: 550,

        category: "Frango",

        isPopular: true,
        available: true,
      },
      {
        id: "102",
        restaurantId: "1",
        name: "Menu Chicken Burger",
        description: "Hambúrguer + batatas + refrigerante.",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        price: 350,

        category: "Hambúrgueres",

        isPopular: true,

        available: true,
      },
    ],
  },

  {
    id: "2",
    name: "Pizza House",
    description: "Pizzas artesanais feitas na hora.",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591",

    category: "Pizza",

    cuisineType: "Pizza",

    rating: 4.6,
    reviewsCount: 178,

    deliveryTime: "30-40 min",
    deliveryFee: 59,
    distanceKm: 3.8,

    isHalal: false,

    isFeatured: true,
    isOpen: true,

    tags: ["Pizza", "Italiana"],

    products: [
      {
        id: "201",
        restaurantId: "2",
        name: "Pizza Margherita",
        description: "Molho de tomate e queijo.",
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591",
        price: 650,

        category: "Pizza",

        isPopular: true,

        available: true,
      },
      {
        id: "202",
        restaurantId: "2",
        name: "Pizza Pepperoni",
        description: "Pepperoni e mozzarella.",
        image:
          "https://images.unsplash.com/photo-1548365328-9f547fb0953b",
        price: 790,

        category: "Pizza",

        available: true,
      },
    ],
  },

  {
    id: "3",
    name: "Burger Nation",
    description: "Hambúrgueres premium.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",

    category: "Hambúrgueres",

    cuisineType: "Fast Food",

    rating: 4.9,
    reviewsCount: 412,

    deliveryTime: "20-30 min",
    deliveryFee: 39,
    distanceKm: 1.5,

    isHalal: false,

    isFeatured: true,
    isOpen: true,

    tags: ["Hambúrgueres", "Fast Food"],

    products: [],
  },

  {
    id: "4",
    name: "Fresh Drinks",
    description: "Sumos naturais e bebidas.",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e",

    category: "Bebidas",

    cuisineType: "Bebidas",

    rating: 4.7,
    reviewsCount: 122,

    deliveryTime: "15-25 min",
    deliveryFee: 29,
    distanceKm: 1.1,

    isHalal: true,

    isFeatured: true,
    isOpen: true,

    tags: ["Bebidas", "Sumos"],

    products: [],
  },

  {
    id: "5",
    name: "Sweet Cake",
    description: "Sobremesas e bolos.",
    image:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e",

    category: "Sobremesas",

    cuisineType: "Pastelaria",

    rating: 4.8,
    reviewsCount: 311,

    deliveryTime: "20-35 min",
    deliveryFee: 35,
    distanceKm: 2.8,

    isHalal: true,

    isFeatured: false,
    isOpen: true,

    tags: ["Sobremesas", "Bolos"],

    products: [],
  },

  {
    id: "6",
    name: "Sushi Tokyo",
    description: "Sushi e cozinha japonesa.",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",

    category: "Asiático",

    cuisineType: "Japonesa",

    rating: 4.9,
    reviewsCount: 543,

    deliveryTime: "35-45 min",
    deliveryFee: 69,
    distanceKm: 4.7,

    isHalal: false,

    isFeatured: true,
    isOpen: true,

    tags: ["Asiático", "Sushi"],

    products: [],
  },

  {
    id: "7",
    name: "Healthy Bowl",
    description: "Comida saudável.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554",

    category: "Saudável",

    cuisineType: "Healthy",

    rating: 4.7,
    reviewsCount: 201,

    deliveryTime: "20-30 min",
    deliveryFee: 35,
    distanceKm: 2.0,

    isHalal: true,

    isFeatured: false,
    isOpen: true,

    tags: ["Saudável", "Vegan"],

    products: [],
  },

  {
    id: "8",
    name: "Coffee Corner",
    description: "Café, cappuccino e snacks.",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",

    category: "Café",

    cuisineType: "Coffee Shop",

    rating: 4.6,
    reviewsCount: 165,

    deliveryTime: "15-20 min",
    deliveryFee: 25,
    distanceKm: 1.4,

    isHalal: true,

    isFeatured: false,
    isOpen: true,

    tags: ["Café", "Pequeno-almoço"],

    products: [],
  },
];

export const RestaurantService = {
  getAll() {
    return restaurants;
  },

  getById(id: string) {
    return restaurants.find(
      (restaurant) => restaurant.id === id
    );
  },

  getFeatured() {
    return restaurants.filter(
      (restaurant) => restaurant.isFeatured
    );
  },

  getByCategory(category: string) {
    return restaurants.filter(
      (restaurant) =>
        restaurant.category === category
    );
  },
};

/*
====================================
SUPABASE / BACKEND REAL
====================================

const getAll = async () => {
  const { data } = await supabase
    .from("restaurants")
    .select(`
      *,
      products(*)
    `);

  return data;
};

const getByCategory = async (
  category: string
) => {
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("category", category);

  return data;
};
*/