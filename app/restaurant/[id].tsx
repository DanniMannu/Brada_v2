import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useCart } from "@/context/CartContext";
import { useRestaurants } from "@/context/RestaurantContext";
import { router, useLocalSearchParams } from "expo-router";

import React, { useState } from "react";

import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();

  const { addToCart, totalItems } =
    useCart();

  const { getRestaurantById } =
    useRestaurants();

  const restaurant =
    getRestaurantById(id as string);

  const [search, setSearch] =
    useState("");

  if (!restaurant) {
    return (
      <View style={styles.center}>
        <Text>
          Restaurante não encontrado
        </Text>
      </View>
    );
  }

  /*
    Depois iremos calcular através
    do opening_hours.
  */
  const isOpen = true;

  const products =
    restaurant.products ?? [];

  const filteredProducts =
    products.filter((product: any) => {
      const name =
        product.name?.toLowerCase() ?? "";

      const description =
        product.description?.toLowerCase() ??
        "";

      const text =
        search.toLowerCase();

      return (
        name.includes(text) ||
        description.includes(text)
      );
    });

  const groupedProducts =
    filteredProducts.reduce(
      (
        acc: Record<string, any[]>,
        product: any
      ) => {
        const category =
          product.category || "Outros";

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push(product);

        return acc;
      },
      {}
    );

  const categories =
    Object.keys(groupedProducts);

  const coverImage =
    restaurant.cover_url ||
    "https://placehold.co/1200x500?text=Restaurant";
    return (
  <ScrollView
    style={styles.safe}
    contentContainerStyle={styles.container}
  >
    <Image
      source={{
        uri: coverImage,
      }}
      style={styles.cover}
    />

    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 16,
      }}
    >
      <Text style={styles.name}>
        {restaurant.name}
      </Text>

      <Text
        style={{
          fontWeight: "700",
          color: isOpen
            ? "#16A34A"
            : "#DC2626",
        }}
      >
        {isOpen ? "Aberto" : "Fechado"}
      </Text>
    </View>

    <Text style={styles.meta}>
      ⭐ Novo
    </Text>

    <Text style={styles.meta}>
      📍 {restaurant.address ?? "--"}
    </Text>

    <Text style={styles.meta}>
      📞 {restaurant.contact}
    </Text>

    <Text style={styles.meta}>
      🚚 30-45 min
    </Text>

    <Text style={styles.meta}>
      Taxa entrega: 0 MT
    </Text>

    <InfoBox
      type="info"
      message="Os preços apresentados já correspondem aos valores definidos pelo estabelecimento."
    />

    <TextInput
      placeholder="Pesquisar no menu..."
      value={search}
      onChangeText={setSearch}
      style={{
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 15,
        paddingVertical: 12,
      }}
    />

    {categories.length > 0 && (
      <>
        <Text style={styles.section}>
          Categorias
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={styles.categoryChip}
            >
              <Text
                style={styles.categoryChipText}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </>
    )}

    <Text style={styles.section}>
      Menu
    </Text>

    {Object.entries(groupedProducts).map(
      ([category, products]: any) => (
        <View
          key={category}
          style={{
            marginBottom: 20,
          }}
        >
          <Text
            style={styles.categoryTitle}
          >
            {category}
          </Text>

          {products.map((product: any) => (
            <View
              key={product.id}
              style={styles.productCard}
            >
              <Image
                source={{
                  uri:
                    product.image_url ??
                    "https://placehold.co/500x300?text=Produto",
                }}
                style={styles.productImage}
              />

              <View
                style={styles.productInfo}
              >
                <View
                  style={styles.productHeader}
                >
                  <Text
                    style={styles.productName}
                  >
                    {product.name}
                  </Text>
                </View>

                <Text
                  style={
                    styles.productDescription
                  }
                >
                  {product.description}
                </Text>

                <Text
                  style={styles.productPrice}
                >
                  {Number(product.price).toFixed(
                    2
                  )}{" "}
                  MT
                </Text>

                <Button
                  title={
                    product.active
                      ? "Adicionar"
                      : "Indisponível"
                  }
                  variant="primary"
                  disabled={!product.active}
                  style={{
                    marginTop: 10,
                    opacity: product.active
                      ? 1
                      : 0.5,
                  }}
                  onPress={() => {
                    if (!isOpen) {
                      Alert.alert(
                        "Restaurante fechado",
                        "Este restaurante não está a aceitar pedidos neste momento."
                      );
                      return;
                    }

                    if (!product.active) {
                      Alert.alert(
                        "Produto indisponível",
                        "Este produto não está disponível."
                      );
                      return;
                    }

                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: Number(
                        product.price
                      ),
                      image:
                        product.image_url ??
                        "",
                      restaurantId:
                        restaurant.id,
                      restaurantName:
                        restaurant.name,
                    });
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      )
    )}

    {totalItems > 0 && (
      <View
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 20,
        }}
      >
        <Button
          title={`Ver Carrinho (${totalItems})`}
          onPress={() =>
            router.push("/cart")
          }
          variant="primary"
        />
      </View>
    )}
  </ScrollView>
);
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  container: {
    paddingBottom: 120,
  },

  cover: {
    width: "100%",
    height: 250,
    backgroundColor: "#E5E7EB",
  },

  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1C1C",
  },

  meta: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    marginHorizontal: 20,
  },

  section: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C1C1C",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },

  categories: {
    paddingLeft: 20,
    marginBottom: 20,
  },

  categoryChip: {
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  categoryChipText: {
    fontWeight: "700",
    color: "#333",
  },

  categoryTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginHorizontal: 20,
    marginBottom: 12,
    color: "#1C1C1C",
  },

  productCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  productImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#F3F4F6",
  },

  productInfo: {
    padding: 16,
  },

  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1C",
  },

  productDescription: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },

  productPrice: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 20,
    fontWeight: "800",
    color: "#782726",
  },

  popularBadge: {
    backgroundColor: "#FFE9B3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  popularText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1C1C1C",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});