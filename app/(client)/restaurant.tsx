import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const BRAND = "#782726";

const MOCK_MENU = [
  {
    category: "Pizzas",
    items: [
      { id: "1", name: "Pizza Margherita", description: "Molho de tomate, mozzarella, manjericão", price: 350, image: "🍕" },
      { id: "2", name: "Pizza Pepperoni", description: "Pepperoni, mozzarella, orégãos", price: 420, image: "🍕" },
      { id: "3", name: "Pizza Vegetariana", description: "Legumes frescos, mozzarella", price: 380, image: "🍕" },
    ],
  },
  {
    category: "Bebidas",
    items: [
      { id: "4", name: "Coca-Cola 500ml", description: "Refrigerante", price: 80, image: "🥤" },
      { id: "5", name: "Água 1L", description: "Água mineral", price: 50, image: "💧" },
    ],
  },
  {
    category: "Sobremesas",
    items: [
      { id: "6", name: "Tiramisu", description: "Clássico italiano", price: 180, image: "🍰" },
      { id: "7", name: "Gelado de Baunilha", description: "2 bolas", price: 120, image: "🍨" },
    ],
  },
];

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Restaurante</Text>
        <Pressable style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.cover}>
          <Text style={styles.coverPlaceholder}>🍽️</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>Restaurante Marés</Text>
            <View style={styles.halalBadge}>
              <Text style={styles.halalText}>Halal</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={16} color="#D97706" />
            <Text style={styles.rating}>4.8</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.time}>25-35 min</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.fee}>Entrega 45 MT</Text>
          </View>
          <Text style={styles.description}>
            Cozinha tradicional moçambicana com toque moderno. Especialidade em mariscos e grelhados.
          </Text>
        </View>

        <View style={styles.menu}>
          {MOCK_MENU.map((section) => (
            <View key={section.category}>
              <Text style={styles.categoryTitle}>{section.category}</Text>
              {section.items.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => router.push({ pathname: "/(client)/product", params: { id: item.id } })}
                >
                  <View style={styles.menuItemImage}>
                    <Text style={styles.menuItemImageText}>{item.image}</Text>
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemDesc}>{item.description}</Text>
                    <Text style={styles.menuItemPrice}>{item.price} MT</Text>
                  </View>
                  <Ionicons name="add-circle" size={28} color={BRAND} />
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.cartButton} onPress={() => router.push("/(client)/cart")}>
          <Ionicons name="cart" size={22} color="#FFF" />
          <Text style={styles.cartButtonText}>Ver carrinho</Text>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
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
  favoriteButton: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  cover: {
    height: 180,
    backgroundColor: "#F0E1E0",
    alignItems: "center",
    justifyContent: "center",
  },
  coverPlaceholder: { fontSize: 60 },
  info: { padding: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EAE3E2" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: "#211919", fontSize: 22, fontWeight: "800" },
  halalBadge: {
    backgroundColor: "#F9EEEE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  halalText: { color: BRAND, fontSize: 11, fontWeight: "800" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  rating: { color: "#211919", fontSize: 14, fontWeight: "700", marginLeft: 4 },
  dot: { color: "#756B6A", marginHorizontal: 4 },
  time: { color: "#756B6A", fontSize: 14 },
  fee: { color: "#756B6A", fontSize: 14 },
  description: { color: "#756B6A", fontSize: 14, marginTop: 10, lineHeight: 20 },
  menu: { padding: 16 },
  categoryTitle: {
    color: "#211919",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#F0E1E0",
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemImageText: { fontSize: 28 },
  menuItemInfo: { flex: 1, marginLeft: 12 },
  menuItemName: { color: "#211919", fontSize: 15, fontWeight: "700" },
  menuItemDesc: { color: "#756B6A", fontSize: 12, marginTop: 2 },
  menuItemPrice: { color: BRAND, fontSize: 14, fontWeight: "800", marginTop: 4 },
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
  cartButton: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cartButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  cartBadge: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cartBadgeText: { color: BRAND, fontSize: 12, fontWeight: "800" },
});
