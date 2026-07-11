import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

export default function History() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatDate = (date: string) => {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "cancelled" | "rejected"
  >("all");

  const [sortTotal, setSortTotal] = useState<"none" | "asc" | "desc">("none");

  const filteredOrders = useMemo(() => {
    let data = [...orders];

    if (statusFilter !== "all") {
      data = data.filter((o) => o.status === statusFilter);
    }

    if (sortTotal === "asc") {
      data.sort((a, b) => Number(a.total) - Number(b.total));
    }

    if (sortTotal === "desc") {
      data.sort((a, b) => Number(b.total) - Number(a.total));
    }

    return data;
  }, [orders, statusFilter, sortTotal]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#16a34a";

      case "cancelled":
        return "#f59e0b";

      case "rejected":
        return "#dc2626";

      default:
        return "#666";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";

      case "cancelled":
        return "Cancelado";

      case "rejected":
        return "Rejeitado";

      default:
        return status;
    }
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);

    try {
      const establishmentId = await getEstablishmentId();

      if (!establishmentId) return;

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
        id,
        status,
        total,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          price
        )
      `,
        )
        .eq("establishment_id", establishmentId)
        .in("status", ["completed", "cancelled", "rejected"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders((data as Order[]) ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Pedidos</Text>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            style={[
              styles.filterButton,
              statusFilter === "all" && styles.filterSelected,
            ]}
            onPress={() => setStatusFilter("all")}
          >
            <Text>Todos</Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              statusFilter === "completed" && styles.filterSelected,
            ]}
            onPress={() => setStatusFilter("completed")}
          >
            <Text>Concluídos</Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              statusFilter === "cancelled" && styles.filterSelected,
            ]}
            onPress={() => setStatusFilter("cancelled")}
          >
            <Text>Cancelados</Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              statusFilter === "rejected" && styles.filterSelected,
            ]}
            onPress={() => setStatusFilter("rejected")}
          >
            <Text>Rejeitados</Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              sortTotal === "asc" && styles.filterSelected,
            ]}
            onPress={() => setSortTotal("asc")}
          >
            <Text>Total ↑</Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              sortTotal === "desc" && styles.filterSelected,
            ]}
            onPress={() => setSortTotal("desc")}
          >
            <Text>Total ↓</Text>
          </Pressable>
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum pedido encontrado.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: getStatusColor(item.status),
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.date}>Data: {formatDate(item.created_at)}</Text>

            <Text style={styles.total}>
              Total: {Number(item.total).toFixed(2)} MT
            </Text>

            <View style={styles.divider} />

            <Text style={styles.productsTitle}>Produtos</Text>

            <ScrollView
              style={styles.productsList}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {item.order_items?.map((product) => (
                <View key={product.id} style={styles.productRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>
                      {product.product_name}
                    </Text>

                    <Text style={styles.productInfo}>
                      {product.quantity} × {Number(product.price).toFixed(2)} MT
                    </Text>
                  </View>

                  <Text style={styles.productTotal}>
                    {(product.quantity * Number(product.price)).toFixed(2)} MT
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
  },

  empty: {
    marginTop: 80,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    height: 280,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontWeight: "700",
    fontSize: 17,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  date: {
    marginTop: 10,
    color: "#6b7280",
  },

  total: {
    marginTop: 6,
    fontWeight: "700",
    fontSize: 18,
    color: "#111827",
  },

  divider: {
    height: 1,
    backgroundColor: "#ececec",
    marginVertical: 14,
  },

  productsTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
  },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  productName: {
    fontWeight: "600",
    fontSize: 15,
  },

  productInfo: {
    color: "#6b7280",
    marginTop: 2,
  },

  productTotal: {
    fontWeight: "700",
    color: "#16a34a",
  },
  filtersContainer: {
    marginBottom: 15,
  },

  filterButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  filterSelected: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },

  productsList: {
    maxHeight: 120,
  },
});
