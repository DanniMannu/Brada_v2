import Button from "@/components/ui/Button";

import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types";
import { useRouter } from "expo-router";
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
  const router = useRouter();

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
    let channel: any;

    const loadData = async () => {
      const currentEstablishmentId = await getEstablishmentId();
      if (!currentEstablishmentId) return;

      const { data: est } = await supabase
        .from("establishments")
        .select("name")
        .eq("id", currentEstablishmentId)
        .single();

      setName(est?.name || "");

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
    *,
    customer:customers!orders_customer_fk (
      id,
      full_name,
      phone
    ),
    order_items (
      id,
      product_name,
      quantity,
      price
    )
  `,
        )
        .eq("establishment_id", currentEstablishmentId)
        .order("created_at", { ascending: false });

      console.log("ERROR:", error);
      console.log("DATA:", JSON.stringify(data, null, 2));

      if (error) {
        console.log(error);
        return;
      }

      setOrders(data || []);
      setCount(data?.length || 0);

      const total =
        data?.reduce((acc, order) => acc + Number(order.total || 0), 0) || 0;

      setSales(total);

      channel = supabase
        .channel(`orders-${currentEstablishmentId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `establishment_id=eq.${currentEstablishmentId}`,
          },
          () => {
            console.log("Pedido atualizado em realtime");
            loadData();
          },
        )
        .subscribe();
    };

    loadData();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from("orders").update({ status }).eq("id", id);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderTitle}>Pedido #{item.id.slice(0, 5)}</Text>

      <Text>Cliente: {item.customer?.full_name ?? "Cliente desconhecido"}</Text>

      {item.customer?.phone && <Text>Telefone: {item.customer.phone}</Text>}

      <Text
        style={{
          marginTop: 10,
          fontWeight: "700",
          color: "#782726",
        }}
      >
        Produtos
      </Text>

      {item.order_items?.length ? (
        item.order_items.map((product) => (
          <Text key={product.id} style={{ marginTop: 4 }}>
            • {product.quantity}x {product.product_name}
          </Text>
        ))
      ) : (
        <Text style={{ color: "#999", marginTop: 4 }}>Sem produtos</Text>
      )}

      <Text
        style={{
          marginTop: 12,
          fontWeight: "700",
          fontSize: 16,
        }}
      >
        Total: {item.total} MT
      </Text>

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
          onPress={() => router.push("/(establishment)/support")}
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
