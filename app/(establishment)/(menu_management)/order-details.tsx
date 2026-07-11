import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetails() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
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
      .eq("id", orderId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await loadOrder();
    };

    init();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        () => {
          loadOrder();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const updateStatus = async (status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.log(error);
      return;
    }

    await loadOrder();

    if (
      status === "completed" ||
      status === "rejected" ||
      status === "cancelled"
    ) {
      router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Pedido não encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Pedido #{order.id.slice(0, 5)}</Text>

          <Text style={styles.label}>Cliente</Text>

          <Text>{order.customer?.full_name ?? "Cliente desconhecido"}</Text>

          {!!order.customer?.phone && <Text>{order.customer.phone}</Text>}

          <Text style={styles.productsTitle}>Produtos</Text>

          {order.order_items?.map((item: any) => (
            <View key={item.id} style={styles.productRow}>
              <Text>
                {item.quantity}x {item.product_name}
              </Text>

              <Text>{item.price} MT</Text>
            </View>
          ))}

          <Text style={styles.total}>Total: {order.total} MT</Text>

          <Text style={styles.status}>Estado: {order.status}</Text>
        </View>

        {order.status === "accepted" && (
          <Button
            title="Em Preparação"
            onPress={() => updateStatus("preparing")}
            style={{ marginTop: 10 }}
          />
        )}

        {order.status === "preparing" && (
          <Button
            title="Marcar Como Pronto"
            onPress={() => updateStatus("ready")}
            style={{ marginTop: 10 }}
          />
        )}

        {order.status === "ready" && (
          <Button
            title="Marcar Como Entregue"
            onPress={() => updateStatus("completed")}
            style={{ marginTop: 10 }}
          />
        )}

        <View style={{ height: 12 }} />

        <Button
          title="Pedir Suporte"
          onPress={() => router.push("/(establishment)/support")}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  label: {
    fontWeight: "700",
    marginBottom: 4,
  },
  productsTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#782726",
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  total: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
  },
  status: {
    marginTop: 12,
    color: "#782726",
    fontWeight: "700",
  },
});
