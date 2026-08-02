import { Ionicons } from "@expo/vector-icons";
import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DashboardOrder = Order & {
  created_at?: string;
  acceptance_expires_at?: string | null;
  customer?: { id: string; full_name: string; phone?: string | null } | null;
};

const BRAND = "#782726";

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("pt-PT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} MT`;
}

export default function EstablishmentHome() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [sales, setSales] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isWide = width >= 900;
  const isCompact = width < 600;

  const autoCancelExpiredOrders = useCallback(async () => {
    const deadline = new Date().toISOString();
    await supabase.from("orders").update({ status: "cancelled" }).eq("status", "pending").lt("acceptance_expires_at", deadline);
  }, []);

  const fetchData = useCallback(async () => {
    const establishmentId = await getEstablishmentId();
    if (!establishmentId) {
      setLoading(false);
      return;
    }

    await autoCancelExpiredOrders();
    const [{ data: establishment }, { data, error }] = await Promise.all([
      supabase.from("establishments").select("name").eq("id", establishmentId).single(),
      supabase
        .from("orders")
        .select("*, customer:customers(id, full_name, phone), order_items(id, product_name, quantity, price)")
        .eq("establishment_id", establishmentId)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

    setName(establishment?.name || "");
    if (!error) {
      const pendingOrders = (data || []) as DashboardOrder[];
      setOrders(pendingOrders);
      setSales(pendingOrders.reduce((total, order) => total + Number(order.total || 0), 0));
    }
    setLoading(false);
  }, [autoCancelExpiredOrders]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let active = true;

    const subscribe = async () => {
      const establishmentId = await getEstablishmentId();
      if (!active || !establishmentId) return;
      await fetchData();
      channel = supabase
        .channel(`orders-${establishmentId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `establishment_id=eq.${establishmentId}` }, fetchData)
        .subscribe();
    };

    subscribe();
    const interval = setInterval(fetchData, 10000);
    return () => {
      active = false;
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderOrder = ({ item }: { item: DashboardOrder }) => {
    const itemCount = item.order_items?.reduce((sum, product) => sum + product.quantity, 0) || 0;
    const visibleItems = item.order_items?.slice(0, 2) || [];
    const deadline = item.acceptance_expires_at
      ? new Date(item.acceptance_expires_at).getTime()
      : now + 2 * 60 * 1000;
    const remainingSeconds = Math.max(0, Math.ceil((deadline - now) / 1000));
    const timerLabel = remainingSeconds > 0
      ? `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`
      : "Expirado";
    return (
      <View style={[styles.orderCard, isWide && styles.orderCardWide]}>
        <View style={styles.orderAccent} />
        <View style={styles.orderBody}>
          <View style={styles.orderHeader}>
            <View>
              <View style={styles.newOrderBadge}>
                <View style={styles.pulse} />
                <Text style={styles.newOrderText}>NOVO PEDIDO</Text>
              </View>
              <Text style={styles.orderNumber}>Pedido #{item.id.slice(0, 6).toUpperCase()}</Text>
              <Text style={[styles.orderMeta, remainingSeconds === 0 && styles.orderExpired]}>
                {remainingSeconds > 0 ? `Aceitar em ${timerLabel}` : timerLabel} · {itemCount} {itemCount === 1 ? "artigo" : "artigos"}
              </Text>
            </View>
            <Text style={styles.total}>{formatMoney(item.total)}</Text>
          </View>

          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerInitial}>{item.customer?.full_name?.charAt(0).toUpperCase() || "C"}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{item.customer?.full_name || "Cliente"}</Text>
              <Text style={styles.customerLabel}>Entrega ao domicílio</Text>
            </View>
          </View>

          <View style={styles.itemsBox}>
            {visibleItems.map((product) => (
              <View key={product.id} style={styles.itemRow}>
                <Text style={styles.itemQuantity}>{product.quantity}×</Text>
                <Text numberOfLines={1} style={styles.itemName}>{product.product_name}</Text>
                <Text style={styles.itemPrice}>{formatMoney(product.price * product.quantity)}</Text>
              </View>
            ))}
            {item.order_items.length > visibleItems.length && (
              <Text style={styles.moreItems}>+ {item.order_items.length - visibleItems.length} artigos no pedido</Text>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver pedido ${item.id.slice(0, 6)}`}
            disabled={remainingSeconds === 0}
            onPress={() => router.push({ pathname: "/(establishment)/(menu_management)/order-details", params: { orderId: item.id } })}
            style={({ pressed }) => [styles.viewOrderButton, (pressed || remainingSeconds === 0) && styles.buttonPressed]}
          >
            <Text style={styles.acceptText}>{remainingSeconds > 0 ? "Ver pedido" : "Pedido expirado"}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingHorizontal: isCompact ? 14 : 28 }]}
        ListHeaderComponent={
          <View>
            <View style={[styles.topRow, isCompact && styles.topRowCompact]}>
              <View><Text style={styles.eyebrow}>CENTRO DE PEDIDOS</Text><Text style={styles.greeting}>Olá, {name || "parceiro"}</Text></View>
              <Pressable accessibilityRole="button" onPress={() => router.push("/(establishment)/support")} style={styles.supportButton}>
                <Ionicons name="help-circle-outline" size={20} color={BRAND} /><Text style={styles.supportText}>Suporte</Text>
              </Pressable>
            </View>
            <View style={[styles.summaryRow, isCompact && styles.summaryRowCompact]}>
              <View style={styles.summaryCard}><Ionicons name="receipt-outline" size={22} color={BRAND} /><View><Text style={styles.summaryValue}>{orders.length}</Text><Text style={styles.summaryLabel}>A aguardar resposta</Text></View></View>
              <View style={styles.summaryCard}><Ionicons name="wallet-outline" size={22} color={BRAND} /><View><Text style={styles.summaryValue}>{formatMoney(sales)}</Text><Text style={styles.summaryLabel}>Valor pendente</Text></View></View>
            </View>
            <Text style={styles.sectionTitle}>Pedidos novos</Text>
            <Text style={styles.sectionSubtitle}>Responde rapidamente para garantir uma ótima experiência ao cliente.</Text>
          </View>
        }
        ListEmptyComponent={!loading ? <View style={styles.empty}><Ionicons name="restaurant-outline" size={34} color={BRAND} /><Text style={styles.emptyTitle}>Tudo em dia</Text><Text style={styles.emptyText}>Os novos pedidos vão aparecer aqui em tempo real.</Text></View> : null}
        ListFooterComponent={loading ? <ActivityIndicator style={styles.loading} color={BRAND} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F4" }, content: { paddingHorizontal: 28, paddingVertical: 24, paddingBottom: 40, width: "100%" },
  topRowCompact: { gap: 14, flexWrap: "wrap" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }, eyebrow: { color: BRAND, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }, greeting: { color: "#1E1717", fontSize: 28, fontWeight: "800", marginTop: 4 },
  supportButton: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: "#FFF", borderRadius: 22, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: "#E9DEDD" }, supportText: { color: BRAND, fontWeight: "700" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 30 }, summaryRowCompact: { flexDirection: "column" }, summaryCard: { flex: 1, flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: "#FFF", borderRadius: 15, padding: 16, borderWidth: 1, borderColor: "#EEE7E6" }, summaryValue: { color: "#211919", fontSize: 18, fontWeight: "800" }, summaryLabel: { color: "#756B6A", fontSize: 12, marginTop: 2 },
  sectionTitle: { color: "#211919", fontSize: 21, fontWeight: "800" }, sectionSubtitle: { color: "#756B6A", fontSize: 14, marginTop: 5, marginBottom: 16 },
  orderCard: { flexDirection: "row", backgroundColor: "#FFF", borderRadius: 18, overflow: "hidden", marginBottom: 14, borderWidth: 1, borderColor: "#EAE3E2", shadowColor: "#271615", shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 3 }, orderCardWide: { maxWidth: 760 }, orderAccent: { width: 5, backgroundColor: BRAND }, orderBody: { flex: 1, padding: 17 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, newOrderBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F9EEEE", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }, pulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: BRAND }, newOrderText: { color: BRAND, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 }, orderNumber: { color: "#211919", fontSize: 17, fontWeight: "800", marginTop: 8 }, orderMeta: { color: BRAND, fontSize: 12, marginTop: 3, fontWeight: "800" }, orderExpired: { color: "#B42318" }, total: { color: "#211919", fontSize: 19, fontWeight: "800" },
  customerRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 16 }, customerAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#F0E1E0" }, customerInitial: { color: BRAND, fontWeight: "800" }, customerName: { color: "#332A2A", fontSize: 14, fontWeight: "700" }, customerLabel: { color: "#756B6A", fontSize: 12, marginTop: 1 },
  itemsBox: { backgroundColor: "#FAF8F8", borderRadius: 11, padding: 11, marginTop: 15, gap: 7 }, itemRow: { flexDirection: "row", alignItems: "center" }, itemQuantity: { color: BRAND, fontWeight: "800", width: 28 }, itemName: { color: "#403737", flex: 1, fontSize: 13 }, itemPrice: { color: "#655B5A", fontSize: 12, fontWeight: "600", marginLeft: 8 }, moreItems: { color: BRAND, fontSize: 12, fontWeight: "700", marginTop: 2 },
  viewOrderButton: { minHeight: 46, backgroundColor: BRAND, borderRadius: 11, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }, acceptText: { color: "#FFF", fontWeight: "800" }, buttonPressed: { opacity: 0.65 },
  empty: { alignItems: "center", backgroundColor: "#FFF", borderRadius: 18, padding: 36, borderWidth: 1, borderColor: "#EAE3E2" }, emptyTitle: { color: "#211919", fontWeight: "800", fontSize: 18, marginTop: 10 }, emptyText: { color: "#756B6A", textAlign: "center", marginTop: 5 }, loading: { marginTop: 28 },
});
