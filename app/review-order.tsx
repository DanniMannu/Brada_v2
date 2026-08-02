import Button from "@/components/ui/Button";
import { useOrders } from "@/context/OrderContext";
import { useReviews } from "@/context/ReviewContext";
import { router, useLocalSearchParams } from "expo-router";

import React, { useState } from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function ReviewOrderScreen() {
  const { orderId } =
    useLocalSearchParams();

  const { getOrderById, fetchOrders } = useOrders();  

  //const { getOrderById } =
  //  useOrders();

  const { createReview } =
    useReviews();

  const order =
    getOrderById(orderId as string);

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  if (!order) return null;

async function submit() {
  if (!order || !order.restaurantId) return;

  
 const ok = await createReview(
  order.id,
  order.restaurantId!,
  rating,
  comment
);

if (!ok) return;

await fetchOrders();

router.replace("/tabs/orders");
  

}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Avaliar Pedido
      </Text>

      <Text>
        Restaurante
      </Text>

      <Text style={styles.restaurant}>
        {order.restaurantName}
      </Text>

      <View
      style={{
        flexDirection: "row",
        marginVertical: 20,
      }}
    >
      {[1,2,3,4,5].map((star)=>(
        <Text
          key={star}
          onPress={() => setRating(star)}
          style={{
            fontSize:42,
            marginRight:8,
          }}
        >
          {rating >= star ? "⭐" : "☆"}
        </Text>
      ))}
    </View>

      <Text>
        Comentário
      </Text>

      <TextInput
        multiline
        value={comment}
        onChangeText={setComment}
        style={[
          styles.input,
          { height: 120 },
        ]}
      />

      <Button
        title="Enviar Avaliação"
        onPress={submit}
        style={{ marginTop: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
  },

  restaurant: {
    fontSize: 20,
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginVertical: 15,
  },
});