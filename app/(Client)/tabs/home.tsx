import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useAuth } from "@/context/AuthContext";
import { useRestaurants } from "@/context/RestaurantContext";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/*const categories = [
  "Todos",
  "Halal",
  "Pizza",
  "Fast Food",
  "Vegan",
  "Gluten Free",
  "Asiático",
  "Indiana",
];*/

const categories = [
  "Todos",

  "Pizza",

  "Hambúrgueres",

  "Frango",

  "Bebidas",

  "Pequeno-almoço",

  "Sobremesas",

  "Café",

  "Asiático",

  "Sushi",

  "Saudável",

  "Vegan",

  "Fast Food",

  "Halal",
];

export default function HomeScreen() {
  const { user } = useAuth();

  const {
  restaurants,
  loading,
} = useRestaurants();

const normalizedRestaurants = useMemo(() => {
  return restaurants.map((restaurant: any) => ({
    ...restaurant,

    image:
      restaurant.cover_url ||
      restaurant.logo_url ||
      "https://placehold.co/800x500?text=Restaurant",

    cuisineType:
      restaurant.products?.[0]?.category ||
      "Restaurante",

    rating: 4.5,

    deliveryFee: 0,

    deliveryTime: "30-45 min",

    distanceKm: 0,

    tags: [
      ...new Set(
        (restaurant.products || [])
          .map((p: any) => p.category)
          .filter(Boolean)
      ),
    ],
  }));
}, [restaurants]);
  //eu
const categories = useMemo(() => {
  const allTags =
    normalizedRestaurants.flatMap(
    (restaurant) => restaurant.tags || []
  );

  return [
    "Todos",
    ...Array.from(new Set(allTags)),
  ];
  }, [normalizedRestaurants]);
  //ate
  
  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("Todos");

  const [deliveryType, setDeliveryType] =
    useState<"delivery" | "pickup">(
      "delivery"
    );

  const filteredRestaurants = useMemo(() => {
    return normalizedRestaurants.filter(
      (restaurant) => {
        const matchesSearch =
          restaurant.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          restaurant.cuisineType
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesCategory =
          selectedCategory ===
            "Todos" ||
          restaurant.tags.includes(
            selectedCategory
          );

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    restaurants,
    search,
    selectedCategory,
  ]);

  /*const featuredRestaurants =
    filteredRestaurants.slice(0, 5);
  */
  //eu
  const featuredRestaurants =
  [...filteredRestaurants]
    .sort(
      (a, b) =>
        b.rating - a.rating
    )
    .slice(0, 5);

  const nearbyRestaurants =
    [...filteredRestaurants].sort(
      (a, b) =>
        a.distanceKm -
        b.distanceKm
    );

  //eu
  const pizzaRestaurants =
  filteredRestaurants.filter(
    (restaurant) =>
      restaurant.tags?.includes(
        "Pizza"
      )
  );

const fastFoodRestaurants =
  filteredRestaurants.filter(
    (restaurant) =>
      restaurant.tags?.includes(
        "Fast Food"
      )
  );

const halalRestaurants =
  filteredRestaurants.filter(
    (restaurant) =>
      restaurant.tags?.includes(
        "Halal"
      )
  );

const asianRestaurants =
  filteredRestaurants.filter(
    (restaurant) =>
      restaurant.tags?.includes(
        "Asiático"
      )
  );  

  //eu
  const RestaurantCard = ({
  restaurant,
}: any) => (
  <Pressable
    style={styles.card}
    onPress={() =>
      router.push(
        `/restaurant/${restaurant.id}`
      )
    }
  >
  <Image
    source={{
      uri:
        restaurant.image ||
        "https://placehold.co/700x450?text=Restaurante",
    }}
    style={styles.image}
  />

    <View style={styles.cardContent}>
      <View style={styles.row}>
        <Text style={styles.name}>
          {restaurant.name}
        </Text>

        <View style={styles.rating}>
          <Text
            style={styles.ratingText}
          >
            {restaurant.rating}
          </Text>
        </View>
      </View>

      <Text style={styles.meta}>
          {restaurant.cuisineType || "Restaurante"}
      </Text>

      <Text style={styles.meta}>
        {restaurant.deliveryTime}
        {" • "}
        Entrega{" "}
        {restaurant.deliveryFee}
        MT
      </Text>

      <Text style={styles.meta}>
        📍 {restaurant.distanceKm} km
      </Text>

      <View style={styles.tags}>
        {restaurant.tags?.length > 0 &&
            restaurant.tags.map((tag: string) => (
            <View
              key={tag}
              style={styles.tag}
            >
              <Text
                style={styles.tagText}
              >
                {tag}
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  </Pressable>
);


if (loading) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>A carregar restaurantes...</Text>
    </View>
  );
}

  return (
    <ScrollView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.location}>
          Entrega agora
        </Text>

        <Text style={styles.address}>
          Avuxeni,{" "}
          {user?.full_name || "Cliente"}
        </Text>

        <InfoBox
          message={
            deliveryType ===
            "delivery"
              ? "Os restaurantes são apresentados para entrega."
              : "Os restaurantes são apresentados para recolha no estabelecimento."
          }
        />

        <View
          style={styles.deliverySelector}
        >
          <Button
            title="Entrega"
            onPress={() =>
              setDeliveryType(
                "delivery"
              )
            }
            variant={
              deliveryType ===
              "delivery"
                ? "primary"
                : "secondary"
            }
            style={{
              flex: 1,
            }}
          />

          <Button
            title="Recolha"
            onPress={() =>
              setDeliveryType(
                "pickup"
              )
            }
            variant={
              deliveryType ===
              "pickup"
                ? "primary"
                : "secondary"
            }
            style={{
              flex: 1,
            }}
          />
        </View>

        <TextInput
          placeholder="O que te apetece comer?"
          placeholderTextColor="#777"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={styles.categories}
        >
          {categories.map((cat) => {
            const selected =
              selectedCategory ===
              cat;

            return (
              <Pressable
                key={cat}
                style={[
                  styles.category,
                  selected &&
                    styles.categorySelected,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    cat
                  )
                }
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>


       <Text style={styles.section}>
          🔥 Em Destaque
        </Text>

        {featuredRestaurants.map(
          (restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          )
        )}

        <Text style={styles.section}>
          🍕 Pizza
        </Text>

        {pizzaRestaurants.map(
          (restaurant) => (
            <RestaurantCard
              key={`pizza-${restaurant.id}`}
              restaurant={restaurant}
            />
          )
        )}

        <Text style={styles.section}>
          🍔 Fast Food
        </Text>

        {fastFoodRestaurants.map(
          (restaurant) => (
            <RestaurantCard
              key={`fast-${restaurant.id}`}
              restaurant={restaurant}
            />
          )
        )}

        <Text style={styles.section}>
          🕌 Halal
        </Text>

        {halalRestaurants.map(
          (restaurant) => (
            <RestaurantCard
              key={`halal-${restaurant.id}`}
              restaurant={restaurant}
            />
          )
        )}

        <Text style={styles.section}>
          🍜 Asiático
        </Text>

        {asianRestaurants.map(
          (restaurant) => (
            <RestaurantCard
              key={`asian-${restaurant.id}`}
              restaurant={restaurant}
            />
          )
        )}

        <Text style={styles.section}>
          Restaurantes próximos
        </Text>

        {nearbyRestaurants.map(
          (restaurant) => (
            <Pressable
              key={`near-${restaurant.id}`}
              style={
                styles.nearbyCard
              }
              onPress={() =>
                router.push(
                  `/restaurant/${restaurant.id}`
                )
              }
            >
              <Text
                style={
                  styles.nearbyName
                }
              >
                {
                  restaurant.name
                }
              </Text>

              <Text>
                📍{" "}
                {
                  restaurant.distanceKm
                }
                km
              </Text>
            </Pressable>
          )
        )}

        {filteredRestaurants.length ===
          0 && (
          <InfoBox
            type="warning"
            message="Nenhum restaurante encontrado."
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  location: {
    color: "#666",
    fontSize: 13,
  },

  address: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },

  deliverySelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  search: {
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  categories: {
    marginBottom: 25,
  },

  category: {
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },

  categorySelected: {
    backgroundColor: "#000",
  },

  categoryText: {
    color: "#111",
    fontWeight: "600",
  },

  categoryTextSelected: {
    color: "#fff",
  },

  section: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 20,
  },

  image: {
    width: "100%",
    height: 220,
  },

  cardContent: {
    padding: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
  },

  rating: {
    backgroundColor: "#F2F2F2",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  ratingText: {
    fontWeight: "700",
  },

  meta: {
    marginTop: 5,
    color: "#666",
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  tag: {
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },

  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },

  nearbyCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    marginBottom: 10,
  },

  nearbyName: {
    fontWeight: "700",
    marginBottom: 4,
  },
});