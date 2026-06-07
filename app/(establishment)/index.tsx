import Button from "@/components/ui/Button";

import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState(0);
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const currentEstablishmentId = await getEstablishmentId();
    if (!currentEstablishmentId) return;

    const { data: est } = await supabase
      .from("establishments")
      .select("name")
      .eq("id", currentEstablishmentId)
      .single();

    setName(est?.name || "");

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("establishment_id", currentEstablishmentId);

    setOrders(data || []);
    setCount(data?.length || 0);

    const total = data?.reduce((acc, o) => acc + Number(o.total), 0) || 0;
    setSales(total);
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchData();
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderTitle}>Pedido #{item.id.slice(0, 5)}</Text>
      <Text>Cliente: {item.customer_name}</Text>
      <Text>Total: {item.total} MT</Text>

      <View style={styles.buttons}>
        {item.status === "pending" && (
          <>
            <Pressable
              style={styles.btn}
              onPress={() => updateStatus(item.id, "accepted")}
            >
              <Text style={styles.btnText}>Aceitar</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.gray]}
              onPress={() => updateStatus(item.id, "rejected")}
            >
              <Text>Rejeitar</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* CONTEÚDO CENTRAL */}
      <View style={styles.centerWrapper}>
        <View style={styles.content}>
          <Text style={styles.greeting}>Olá {name}</Text>

          {/* CARDS */}
          <View style={styles.cards}>
            <View style={styles.card}>
              <Text style={styles.big}>{sales} MT</Text>
              <Text>Total de Vendas</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.big}>{count}</Text>
              <Text>Pedidos Hoje</Text>
            </View>
          </View>

          {/* PEDIDOS */}
          <Text style={styles.section}>Pedidos Ativos</Text>

          {orders.length === 0 ? (
            <Text style={styles.empty}>📭 Aguardando pedidos...</Text>
          ) : (
            <FlatList
              data={orders}
              renderItem={renderOrder}
              keyExtractor={(item) => item.id}
            />
          )}

          {/* SUPORTE */}

          <View style={styles.floatingWrapper}>
            <Button
              title="Fala com o teu Brada"
              onPress={() => {
                // Handle support button press
              }}
              style={{
                marginBottom: 80,
                marginRight: 40,
                alignSelf: "flex-end",
              }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  topBar: {
    backgroundColor: "#782726",
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  floatingWrapper: {
    position: "absolute",
    bottom: -500,
    right: -15,

    width: 280, // ✅ controlar largura do botão
  },

  logo: { color: "#fff", fontSize: 25, fontWeight: "700" },
  icon: { color: "#fff", fontSize: 25 },

  centerWrapper: {
    flex: 1,
    alignItems: "center",
    paddingTop: 15,
  },

  content: {
    width: "100%",
    maxWidth: 420,
    paddingHorizontal: 16,
  },

  greeting: {
    textAlign: "left",
    marginBottom: 20,
    fontSize: 22,
    fontWeight: "700",
    marginTop: -25,
  },

  cards: { flexDirection: "row", gap: 10 },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  big: { fontSize: 22, fontWeight: "700" },

  section: { marginTop: 20, fontWeight: "700", fontSize: 19 },

  empty: { textAlign: "center", marginTop: 20 },

  orderCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  orderTitle: { fontWeight: "700" },

  buttons: { flexDirection: "row", gap: 10, marginTop: 10 },

  btn: {
    backgroundColor: "#782726",
    padding: 10,
    borderRadius: 8,
  },

  gray: { backgroundColor: "#ccc" },
  btnText: { color: "#fff" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },

  supportBtn: {
    marginTop: 25,
    padding: 14,
    backgroundColor: "#eee",
    borderRadius: 10,
    alignItems: "center",
  },

  supportText: {
    fontWeight: "600",
  },
});
