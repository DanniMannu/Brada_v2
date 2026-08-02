import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const BRAND = "#782726";

const TIMELINE = [
  { status: "Pedido confirmado", time: "14:32", done: true },
  { status: "Estabelecimento aceitou", time: "14:33", done: true },
  { status: "Em preparação", time: "14:34", done: true },
  { status: "Pronto para recolha", time: "—", done: false },
  { status: "Saiu para entrega", time: "—", done: false },
  { status: "Entregue", time: "—", done: false },
];

export default function TrackingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Acompanhar pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.orderCard}>
          <Text style={styles.orderNumber}>Pedido #A3F2B1</Text>
          <Text style={styles.restaurant}>Restaurante Marés</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Em preparação</Text>
          </View>
        </View>

        <View style={styles.pinCard}>
          <Text style={styles.pinTitle}>Código de entrega</Text>
          <Text style={styles.pinSubtitle}>Mostra este código ao estafeta</Text>
          <View style={styles.pinBox}>
            <Text style={styles.pinDigit}>2</Text>
            <Text style={styles.pinDigit}>8</Text>
            <Text style={styles.pinDigit}>4</Text>
            <Text style={styles.pinDigit}>7</Text>
            <Text style={styles.pinDigit}>3</Text>
            <Text style={styles.pinDigit}>9</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <Text style={styles.timelineTitle}>Estado do pedido</Text>
          {TIMELINE.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={[styles.timelineDot, item.done && styles.timelineDotDone]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineStatus, item.done && styles.timelineStatusDone]}>
                  {item.status}
                </Text>
                <Text style={styles.timelineTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Itens do pedido</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemQuantity}>1×</Text>
            <Text style={styles.itemName}>Pizza Pepperoni</Text>
            <Text style={styles.itemPrice}>420 MT</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemQuantity}>2×</Text>
            <Text style={styles.itemName}>Coca-Cola 500ml</Text>
            <Text style={styles.itemPrice}>160 MT</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>671 MT</Text>
          </View>
        </View>

        <View style={styles.contactButtons}>
          <Pressable style={styles.contactButton}>
            <Ionicons name="call-outline" size={20} color={BRAND} />
            <Text style={styles.contactButtonText}>Estafeta</Text>
          </Pressable>
          <Pressable style={styles.contactButton}>
            <Ionicons name="call-outline" size={20} color={BRAND} />
            <Text style={styles.contactButtonText}>Restaurante</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F4" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BRAND,
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  orderCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  orderNumber: { color: "#756B6A", fontSize: 13 },
  restaurant: { color: "#211919", fontSize: 18, fontWeight: "800", marginTop: 4 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "#F9EEEE",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND },
  statusText: { color: BRAND, fontSize: 12, fontWeight: "800" },
  pinCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EAE3E2",
    alignItems: "center",
  },
  pinTitle: { color: "#211919", fontSize: 16, fontWeight: "800" },
  pinSubtitle: { color: "#756B6A", fontSize: 13, marginTop: 4 },
  pinBox: { flexDirection: "row", gap: 10, marginTop: 16 },
  pinDigit: {
    width: 44,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#F9EEEE",
    color: BRAND,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 52,
  },
  timeline: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  timelineTitle: { color: "#211919", fontSize: 16, fontWeight: "800", marginBottom: 16 },
  timelineItem: { flexDirection: "row", gap: 12, marginBottom: 14 },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#EAE3E2",
    marginTop: 2,
  },
  timelineDotDone: { borderColor: BRAND, backgroundColor: BRAND },
  timelineContent: { flex: 1 },
  timelineStatus: { color: "#756B6A", fontSize: 14 },
  timelineStatusDone: { color: "#211919", fontWeight: "700" },
  timelineTime: { color: "#756B6A", fontSize: 12, marginTop: 2 },
  itemsCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  itemsTitle: { color: "#211919", fontSize: 16, fontWeight: "800", marginBottom: 12 },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  itemQuantity: { color: BRAND, fontWeight: "800", width: 28 },
  itemName: { color: "#403737", flex: 1, fontSize: 14 },
  itemPrice: { color: "#655B5A", fontSize: 13, fontWeight: "600" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EAE3E2",
  },
  totalLabel: { color: "#211919", fontSize: 16, fontWeight: "800" },
  totalValue: { color: BRAND, fontSize: 16, fontWeight: "800" },
  contactButtons: { flexDirection: "row", gap: 10, marginTop: 12 },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  contactButtonText: { color: BRAND, fontSize: 14, fontWeight: "700" },
});
