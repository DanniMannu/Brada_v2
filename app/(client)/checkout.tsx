import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

const BRAND = "#782726";

const PAYMENT_METHODS = [
  { id: "mkesh", name: "mkesh", icon: "📱", type: "mobile" },
  { id: "mpesa", name: "mpesa", icon: "📱", type: "mobile" },
  { id: "emola", name: "emola", icon: "📱", type: "mobile" },
  { id: "cash", name: "Dinheiro", icon: "💵", type: "cash" },
  { id: "wallet", name: "Wallet", icon: "👛", type: "wallet" },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState("mkesh");
  const [selectedAddress, setSelectedAddress] = useState("home");

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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morada de entrega</Text>
          <Pressable
            style={[styles.addressCard, selectedAddress === "home" && styles.addressCardSelected]}
            onPress={() => setSelectedAddress("home")}
          >
            <View style={styles.addressIcon}>
              <Ionicons name="home" size={20} color={BRAND} />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Casa</Text>
              <Text style={styles.addressText}>Av. Julius Nyerere, 1234, Maputo</Text>
            </View>
            {selectedAddress === "home" && <Ionicons name="checkmark-circle" size={22} color={BRAND} />}
          </Pressable>
          <Pressable style={styles.addAddressButton}>
            <Ionicons name="add-circle-outline" size={20} color={BRAND} />
            <Text style={styles.addAddressText}>Adicionar nova morada</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pagamento</Text>
          {PAYMENT_METHODS.map((method) => (
            <Pressable
              key={method.id}
              style={[styles.paymentCard, selectedPayment === method.id && styles.paymentCardSelected]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <Text style={styles.paymentName}>{method.name}</Text>
              {selectedPayment === method.id && <Ionicons name="checkmark-circle" size={22} color={BRAND} />}
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <View style={styles.notesInput}>
            <Text style={styles.notesPlaceholder}>Instruções para o estafeta ou restaurante...</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{subtotal} MT</Text>
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
        <Pressable style={styles.orderButton}>
          <Text style={styles.orderButtonText}>Fazer pedido</Text>
          <Text style={styles.orderButtonTotal}>{total} MT</Text>
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
  section: { marginBottom: 20 },
  sectionTitle: { color: "#211919", fontSize: 16, fontWeight: "800", marginBottom: 10 },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAE3E2",
    marginBottom: 8,
  },
  addressCardSelected: { borderColor: BRAND, borderWidth: 2 },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F9EEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  addressInfo: { flex: 1, marginLeft: 10 },
  addressLabel: { color: "#211919", fontSize: 14, fontWeight: "700" },
  addressText: { color: "#756B6A", fontSize: 12, marginTop: 2 },
  addAddressButton: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10 },
  addAddressText: { color: BRAND, fontSize: 14, fontWeight: "600" },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAE3E2",
    marginBottom: 8,
    gap: 10,
  },
  paymentCardSelected: { borderColor: BRAND, borderWidth: 2 },
  paymentIcon: { fontSize: 20 },
  paymentName: { flex: 1, color: "#211919", fontSize: 14, fontWeight: "600" },
  notesInput: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  notesPlaceholder: { color: "#756B6A", fontSize: 14 },
  summary: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
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
  orderButton: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  orderButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  orderButtonTotal: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
