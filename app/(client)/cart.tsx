import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const BRAND = "#782726";

const MOCK_CART = [
  { id: "1", name: "Pizza Pepperoni", price: 420, quantity: 1, image: "🍕" },
  { id: "2", name: "Coca-Cola 500ml", price: 80, quantity: 2, image: "🥤" },
];

export default function CartScreen() {
  const router = useRouter();

  const subtotal = 580;
  const discount = 0;
  const serviceFee = 46;
  const deliveryFee = 45;
  const total = subtotal - discount + serviceFee + deliveryFee;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Carrinho</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.restaurant}>Restaurante Marés</Text>

        <View style={styles.items}>
          {MOCK_CART.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemImage}>
                <Text style={styles.itemImageText}>{item.image}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price} MT</Text>
              </View>
              <View style={styles.itemQuantity}>
                <Pressable style={styles.quantityButton}>
                  <Ionicons name="remove" size={16} color={BRAND} />
                </Pressable>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <Pressable style={styles.quantityButton}>
                  <Ionicons name="add" size={16} color={BRAND} />
                </Pressable>
              </View>
              <Pressable style={styles.removeButton}>
                <Ionicons name="trash-outline" size={20} color="#B42318" />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable style={styles.couponButton}>
          <Ionicons name="pricetag-outline" size={18} color={BRAND} />
          <Text style={styles.couponText}>Adicionar cupão</Text>
        </Pressable>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumo</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{subtotal} MT</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Desconto</Text>
            <Text style={styles.summaryValue}>−{discount} MT</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxa de serviço (8%)</Text>
            <Text style={styles.summaryValue}>+{serviceFee} MT</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxa de entrega</Text>
            <Text style={styles.summaryValue}>+{deliveryFee} MT</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total} MT</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.checkoutButton} onPress={() => router.push("/(client)/checkout")}>
          <Text style={styles.checkoutButtonText}>Finalizar pedido</Text>
          <Text style={styles.checkoutButtonTotal}>{total} MT</Text>
        </Pressable>
      </View>
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
  scrollContent: { padding: 16, paddingBottom: 120 },
  restaurant: { color: "#211919", fontSize: 18, fontWeight: "800", marginBottom: 16 },
  items: { gap: 10 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#F0E1E0",
    alignItems: "center",
    justifyContent: "center",
  },
  itemImageText: { fontSize: 24 },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemName: { color: "#211919", fontSize: 14, fontWeight: "700" },
  itemPrice: { color: "#756B6A", fontSize: 13, marginTop: 2 },
  itemQuantity: { flexDirection: "row", alignItems: "center", gap: 8 },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F9EEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: { color: "#211919", fontSize: 14, fontWeight: "700", minWidth: 20, textAlign: "center" },
  removeButton: { marginLeft: 8, padding: 4 },
  couponButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#EAE3E2",
    borderStyle: "dashed",
  },
  couponText: { color: BRAND, fontSize: 14, fontWeight: "700" },
  summary: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  summaryTitle: { color: "#211919", fontSize: 16, fontWeight: "800", marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { color: "#756B6A", fontSize: 14 },
  summaryValue: { color: "#211919", fontSize: 14, fontWeight: "600" },
  totalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#EAE3E2" },
  totalLabel: { color: "#211919", fontSize: 16, fontWeight: "800" },
  totalValue: { color: BRAND, fontSize: 16, fontWeight: "800" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EAE3E2",
  },
  checkoutButton: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkoutButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  checkoutButtonTotal: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
