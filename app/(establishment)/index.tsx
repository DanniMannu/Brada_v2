import Button from "@/components/ui/Button";

import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState(0);
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

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

  useEffect(() => {
    const fetchDataEffect = async () => {
      await fetchData();
    };

    void fetchDataEffect();
  }, []);

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
      <FlatList
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <Text style={styles.greeting}>Olá {name}</Text>

            <View
              style={[
                styles.cards,
                { flexDirection: isLargeScreen ? "row" : "column" },
              ]}
            >
              <View style={styles.card}>
                <Text style={styles.big}>{sales} MT</Text>
                <Text>Total de Vendas</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.big}>{count}</Text>
                <Text>Pedidos Hoje</Text>
              </View>
            </View>

            <Text style={styles.section}>Pedidos Ativos</Text>
          </>
        }
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>📭 Aguardando pedidos...</Text>
        }
      />

      {/* BOTÃO FIXO SEM SOBREPOSIÇÃO */}
      <View style={styles.floatingWrapper}>
        <Button
          title="Fala com o teu Brada"
          onPress={() => {}}
          style={{ marginTop: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    width: "100%",
  },

  greeting: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  cards: {
    gap: 12,
    marginBottom: 10,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  big: {
    fontSize: 22,
    fontWeight: "700",
  },

  section: {
    marginTop: 20,
    fontWeight: "700",
    fontSize: 19,
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
  },

  orderCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  orderTitle: {
    fontWeight: "700",
  },

  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  btn: {
    backgroundColor: "#782726",
    padding: 10,
    borderRadius: 8,
  },

  gray: {
    backgroundColor: "#ccc",
  },

  btnText: {
    color: "#fff",
  },

  floatingWrapper: {
    position: "absolute",
    bottom: 20,
    right: 20,
    left: 20,
  },
});
