import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function History() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const currentEstablishmentId = await getEstablishmentId();
    if (!currentEstablishmentId) return;

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("establishment_id", currentEstablishmentId)
      .order("created_at", { ascending: false });

    setOrders(data || []);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico</Text>

      {orders.length === 0 ? (
        <Text style={styles.empty}>Sem pedidos ainda</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.orderTitle}>
                Pedido #{item.id.slice(0, 6)}
              </Text>

              <Text>Total: {item.total} MT</Text>
              <Text>Status: {item.status}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 420,
    alignSelf: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },

  orderTitle: {
    fontWeight: "700",
  },
});
