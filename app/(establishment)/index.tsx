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

  const autoCancelExpiredOrders = async () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    await supabase
      .from("orders")
      .update({
        status: "cancelled",
      })
      .eq("status", "pending")
      .lt("created_at", oneMinuteAgo);
  };

  const fetchData = async () => {
    const currentEstablishmentId = await getEstablishmentId();

    if (!currentEstablishmentId) return;

    await autoCancelExpiredOrders();

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
        customer:customers (
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
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    setOrders(data || []);
    setCount(data?.length || 0);

    const total =
      data?.reduce((acc, order) => acc + Number(order.total || 0), 0) || 0;

    setSales(total);

    console.log("DATA:", data);
  };

  useEffect(() => {
    let channel: any;

    const initialize = async () => {
      const currentEstablishmentId = await getEstablishmentId();

      if (!currentEstablishmentId) return;

      await fetchData();

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
          async () => {
            await fetchData();
          },
        )
        .subscribe();
    };

    initialize();

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => {
      clearInterval(interval);

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.log(error);
      return;
    }

    await fetchData();
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderTitle}>Pedido #{item.id.slice(0, 5)}</Text>

      <Text>Cliente: {item.customer?.full_name || "Cliente desconhecido"}</Text>

      {!!item.customer?.phone && <Text>Telefone: {item.customer.phone}</Text>}

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
        item.order_items.map((product: any) => (
          <Text key={product.id} style={{ marginTop: 4 }}>
            • {product.quantity}x {product.product_name}
          </Text>
        ))
      ) : (
        <Text
          style={{
            color: "#999",
            marginTop: 4,
          }}
        >
          Sem produtos
        </Text>
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
        <Pressable
          style={styles.btn}
          onPress={async () => {
            await updateStatus(item.id, "accepted");

            router.push({
              pathname: "./(establishment)/(menu-management)/order-details",
              params: {
                orderId: item.id,
              },
            });
          }}
        >
          <Text style={styles.btnText}>Aceitar</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.gray]}
          onPress={async () => {
            await updateStatus(item.id, "rejected");
          }}
        >
          <Text>Rejeitar</Text>
        </Pressable>
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
                {
                  flexDirection: isLargeScreen ? "row" : "column",
                },
              ]}
            >
              <View style={styles.card}>
                <Text style={styles.big}>{sales} MT</Text>
                <Text>Total de Vendas</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.big}>{count}</Text>
                <Text>Novos Pedidos</Text>
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
    marginBottom: 6,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
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
    left: 20,
    right: 20,
  },
});
