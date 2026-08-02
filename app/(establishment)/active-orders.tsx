import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ActiveOrder = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer?: { full_name: string } | { full_name: string }[] | null;
  order_items: { id: string; quantity: number }[];
};

const BRAND = "#782726";
const labels: Record<string, string> = {
  accepted: "Pedido aceite", preparing: "Em preparação", ready: "Pronto para recolha",
  assigned: "Estafeta atribuído", picked_up: "Recolhido", out_for_delivery: "Em entrega",
};

export default function ActiveOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();

  const loadOrders = useCallback(async () => {
    const establishmentId = await getEstablishmentId();
    if (!establishmentId) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("orders")
      .select("id, status, total, created_at, customer:customers(full_name), order_items(id, quantity)")
      .eq("establishment_id", establishmentId)
      .in("status", ["accepted", "preparing", "ready"])
      .order("created_at", { ascending: false });
    if (!error) setOrders((data || []) as unknown as ActiveOrder[]);
    setLoading(false); setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { loadOrders(); }, [loadOrders]));

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={BRAND} /></SafeAreaView>;
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingHorizontal: width < 600 ? 14 : 28 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} />}
        ListHeaderComponent={<View><Text style={styles.eyebrow}>OPERAÇÃO</Text><Text style={styles.title}>Pedidos em curso</Text><Text style={styles.subtitle}>Acompanha a preparação e a entrega de cada pedido.</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>Sem pedidos em curso</Text><Text style={styles.emptyText}>Pedidos aceites vão aparecer aqui automaticamente.</Text><Pressable onPress={() => router.replace("/(establishment)")} style={styles.homeButton}><Text style={styles.homeButtonText}>Voltar ao início</Text></Pressable></View>}
        renderItem={({ item }) => {
          const quantity = item.order_items.reduce((sum, line) => sum + line.quantity, 0);
          return <Pressable onPress={() => router.push({ pathname: "/(establishment)/(menu_management)/order-details", params: { orderId: item.id } })} style={styles.card}>
            <View><Text style={styles.orderId}>Pedido #{item.id.slice(0, 6).toUpperCase()}</Text><Text style={styles.customer}>{Array.isArray(item.customer) ? item.customer[0]?.full_name : item.customer?.full_name || "Cliente"} · {quantity} artigos</Text></View>
            <View style={styles.right}><Text style={styles.status}>{labels[item.status] || item.status}</Text><Text style={styles.total}>{Number(item.total).toFixed(2)} MT</Text></View>
          </Pressable>;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F4" }, center: { flex: 1, alignItems: "center", justifyContent: "center" }, content: { paddingHorizontal: 28, paddingVertical: 24, gap: 11, width: "100%" },
  eyebrow: { color: BRAND, fontSize: 11, fontWeight: "800", letterSpacing: 1.1 }, title: { color: "#211919", fontSize: 27, fontWeight: "800", marginTop: 4 }, subtitle: { color: "#756B6A", marginTop: 4, marginBottom: 14 },
  card: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#ECE4E3", borderRadius: 15, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, orderId: { color: "#211919", fontWeight: "800", fontSize: 16 }, customer: { color: "#756B6A", fontSize: 13, marginTop: 4 }, right: { alignItems: "flex-end" }, status: { color: BRAND, fontSize: 12, fontWeight: "800" }, total: { color: "#211919", fontWeight: "800", fontSize: 16, marginTop: 5 },
  empty: { backgroundColor: "#FFF", borderRadius: 16, padding: 30, alignItems: "center" }, emptyTitle: { color: "#211919", fontWeight: "800", fontSize: 17 }, emptyText: { color: "#756B6A", textAlign: "center", marginTop: 5 }, homeButton: { marginTop: 18, backgroundColor: BRAND, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }, homeButtonText: { color: "#FFF", fontWeight: "800" },
});
