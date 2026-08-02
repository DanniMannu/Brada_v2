import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { OrderStatus } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OrderLine = { id: string; product_name: string; quantity: number; price: number };
type DetailedOrder = {
  id: string;
  status: OrderStatus;
  total: number;
  customer_notes?: string | null;
  payment_method?: string | null;
  customer?: { id: string; full_name: string; phone?: string | null } | null;
  order_items: OrderLine[];
};

const BRAND = "#782726";
const establishmentTerminalStatuses: OrderStatus[] = ["completed", "rejected", "cancelled"];

const statusInfo: Record<OrderStatus, { label: string; next?: OrderStatus; action?: string }> = {
  pending: { label: "A aguardar resposta", next: "accepted", action: "Aceitar pedido" },
  accepted: { label: "Pedido aceite", next: "preparing", action: "Iniciar preparação" },
  preparing: { label: "Em preparação", next: "ready", action: "Marcar como pronto" },
  ready: { label: "Pronto para recolha", next: "completed", action: "Concluir pedido" },
  assigned: { label: "Estafeta atribuído" },
  picked_up: { label: "Recolhido pelo estafeta" },
  out_for_delivery: { label: "Em entrega" },
  completed: { label: "Concluído" },
  rejected: { label: "Rejeitado", },
  cancelled: { label: "Cancelado", },
};

const money = (value: number) => `${Number(value || 0).toFixed(2)} MT`;

export default function OrderDetails() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { width } = useWindowDimensions();

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    const { data, error } = await supabase
      .from("orders")
      .select("*, customer:customers(id, full_name, phone), order_items(id, product_name, quantity, price)")
      .eq("id", orderId)
      .single();

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar o pedido.");
      setOrder(null);
    } else {
      setOrder(data as DetailedOrder);
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    const initialLoad = setTimeout(() => { void loadOrder(); }, 0);
    if (!orderId) return () => clearTimeout(initialLoad);
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, loadOrder)
      .subscribe();
    return () => { clearTimeout(initialLoad); supabase.removeChannel(channel); };
  }, [loadOrder, orderId]);

  const setStatus = async (nextStatus: OrderStatus) => {
    if (!orderId || !order) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", orderId)
      .select("id, status")
      .single();
    setSaving(false);

    if (error || !data || data.status !== nextStatus) {
      Alert.alert(
        "Estado não atualizado",
        "O pedido não foi alterado. Confirma que aplicaste a migração e que esta conta tem permissão para gerir este estabelecimento.",
      );
      return;
    }

    if (establishmentTerminalStatuses.includes(nextStatus)) {
      router.replace("/(establishment)/history");
      return;
    }
    await loadOrder();
  };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={BRAND} /></SafeAreaView>;
  if (!order) return <SafeAreaView style={styles.center}><Text>Pedido não encontrado.</Text><Button title="Voltar ao início" variant="outline" onPress={() => router.replace("/(establishment)")} style={styles.backButton} /></SafeAreaView>;

  const info = statusInfo[order.status] || statusInfo.pending;
  const isTerminal = establishmentTerminalStatuses.includes(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: width < 600 ? 14 : 28 }]}>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/(establishment)")} style={styles.backLink}>
          <Text style={styles.backText}>← Voltar aos pedidos</Text>
        </Pressable>

        <View style={styles.headerCard}>
          <View><Text style={styles.eyebrow}>PEDIDO #{order.id.slice(0, 6).toUpperCase()}</Text><Text style={styles.title}>{info.label}</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={styles.customerName}>{order.customer?.full_name || "Cliente"}</Text>
          {!!order.payment_method && <Text style={styles.payment}>Pagamento: {order.payment_method.toUpperCase()}</Text>}
        </View>

        {!!order.customer_notes?.trim() && (
          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notas do cliente</Text>
            <Text style={styles.notesText}>{order.customer_notes}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          {order.order_items.map((item) => <View key={item.id} style={styles.productRow}><Text style={styles.productName}>{item.quantity}× {item.product_name}</Text><Text style={styles.productPrice}>{money(Number(item.price) * item.quantity)}</Text></View>)}
          <View style={styles.divider} />
          <View style={[styles.totalRow, styles.finalTotal]}><Text style={styles.finalTotalText}>Total</Text><Text style={styles.finalTotalText}>{money(order.total)}</Text></View>
        </View>

        {!isTerminal && (
          <View style={styles.actions}>
            {order.status === "pending" && <Button style={{ width: "100%" }} title="Recusar pedido" variant="outline" disabled={saving} onPress={() => setStatus("rejected")} />}
            {info.next && <Button style={{ width: "100%" }} title={saving ? "A atualizar..." : info.action || "Atualizar pedido"} variant="primary" disabled={saving} onPress={() => setStatus(info.next!)} />}
          </View>
        )}
        {isTerminal && <Button style={{ width: "100%" }} title="Ver histórico" variant="primary" onPress={() => router.replace("/(establishment)/history")} />}
        <Button style={{ width: "100%" }} title="Pedir suporte" variant="outline" onPress={() => router.push("/(establishment)/support")} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F4" }, content: { paddingVertical: 24, gap: 12, width: "100%" }, center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  backLink: { alignSelf: "flex-start", paddingVertical: 6 }, backText: { color: BRAND, fontWeight: "700" }, backButton: { width: "100%", marginTop: 16 },
  headerCard: { backgroundColor: BRAND, borderRadius: 16, padding: 18 }, eyebrow: { color: "#F4D9D7", fontWeight: "800", fontSize: 11, letterSpacing: 1 }, title: { color: "#FFF", fontSize: 24, fontWeight: "800", marginTop: 4 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 17, borderWidth: 1, borderColor: "#ECE4E3" }, sectionTitle: { color: "#231A1A", fontSize: 16, fontWeight: "800", marginBottom: 9 }, customerName: { color: "#231A1A", fontSize: 16, fontWeight: "700" }, muted: { color: "#756B6A", marginTop: 3 }, payment: { color: BRAND, fontWeight: "700", marginTop: 8, fontSize: 12 },
  notesCard: { backgroundColor: "#FFF8E6", borderRadius: 16, padding: 17, borderWidth: 1, borderColor: "#F2D9A0" }, notesText: { color: "#4A3920", lineHeight: 21 },
  productRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 8 }, productName: { flex: 1, color: "#322A29" }, productPrice: { color: "#322A29", fontWeight: "700" }, divider: { height: 1, backgroundColor: "#EEE7E6", marginVertical: 9 }, totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }, finalTotal: { borderTopWidth: 1, borderTopColor: "#E9DDDC", marginTop: 8, paddingTop: 12 }, finalTotalText: { color: "#201717", fontSize: 19, fontWeight: "800" },
  actions: { gap: 10, marginTop: 4 },
});
