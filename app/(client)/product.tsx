import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

const BRAND = "#782726";

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  const price = 420;
  const total = price * quantity;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Produto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>🍕</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>Pizza Pepperoni</Text>
          <Text style={styles.description}>
            Pizza com pepperoni, mozzarella fresca e orégãos. Massa artesanal feita no dia.
          </Text>
          <Text style={styles.price}>{price} MT</Text>
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantidade</Text>
          <View style={styles.quantityRow}>
            <Pressable
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color={BRAND} />
            </Pressable>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Pressable
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color={BRAND} />
            </Pressable>
          </View>
        </View>

        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Instruções especiais</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputPlaceholder}>
              Ex: Sem cebola, extra queijo, ponto da carne...
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total} MT</Text>
        </View>
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>Adicionar ao carrinho</Text>
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
  scrollContent: { paddingBottom: 140 },
  imageContainer: {
    height: 250,
    backgroundColor: "#F0E1E0",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: { fontSize: 80 },
  info: { padding: 20, backgroundColor: "#FFF" },
  name: { color: "#211919", fontSize: 22, fontWeight: "800" },
  description: { color: "#756B6A", fontSize: 14, marginTop: 8, lineHeight: 20 },
  price: { color: BRAND, fontSize: 20, fontWeight: "800", marginTop: 12 },
  quantitySection: { padding: 20, backgroundColor: "#FFF", marginTop: 10 },
  sectionTitle: { color: "#211919", fontSize: 16, fontWeight: "800", marginBottom: 12 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F9EEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: { color: "#211919", fontSize: 18, fontWeight: "800", minWidth: 30, textAlign: "center" },
  instructionsSection: { padding: 20, backgroundColor: "#FFF", marginTop: 10 },
  inputBox: {
    borderWidth: 1,
    borderColor: "#EAE3E2",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#FAF8F8",
  },
  inputPlaceholder: { color: "#756B6A", fontSize: 14 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#EAE3E2",
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  totalLabel: { color: "#756B6A", fontSize: 14 },
  totalValue: { color: "#211919", fontSize: 18, fontWeight: "800" },
  addButton: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  addButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
