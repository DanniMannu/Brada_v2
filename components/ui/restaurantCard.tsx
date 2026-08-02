import React from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface Props {
  restaurant: any;
  onPress: () => void;
}

export default function RestaurantCard({
  restaurant,
  onPress,
}: Props) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <Image
        source={{
          uri: restaurant.image,
        }}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name}>
            {restaurant.name}
          </Text>

          <View style={styles.rating}>
            <Text style={styles.ratingText}>
              {restaurant.rating || 4.8}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>
          {restaurant.type}
        </Text>

        <Text style={styles.meta}>
          {restaurant.eta} • Entrega{" "}
          {restaurant.deliveryFee} MT
        </Text>

        <View style={styles.tags}>
          {restaurant.tags?.map(
            (tag: string) => (
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
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  image: {
    width: "100%",
    height: 180,
  },

  content: {
    padding: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  meta: {
    marginTop: 4,
    color: "#6B7280",
  },

  rating: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  ratingText: {
    fontWeight: "700",
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },

  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
});