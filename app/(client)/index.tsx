import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const BRAND = "#782726";

const MOCK_BANNERS = [
  { id: "1", title: "Entrega grátis", subtitle: "Em pedidos acima de 500 MT" },
  { id: "2", title: "20% desconto", subtitle: "Primeira compra com código BRADA20" },
];

const MOCK_CATEGORIES = [
  { id: "1", name: "Pizzas", icon: "🍕" },
  { id: "2", name: "Hambúrgueres", icon: "🍔" },
  { id: "3", name: "Mariscos", icon: "🦐" },
  { id: "4", name: "Sobremesas", icon: "🍰" },
  { id: "5", name: "Bebidas", icon: "🥤" },
  { id: "6", name: "Vegetariano", icon: "🥗" },
];

const MOCK_FEATURED = [
  { id: "1", name: "Restaurante Marés", rating: 4.8, time: "25-35 min", fee: "45 MT", isHalal: true },
  { id: "2", name: "Sabores de Maputo", rating: 4.6, time: "20-30 min", fee: "40 MT", isHalal: false },
  { id: "3", name: "Casa do Pão", rating: 4.5, time: "15-25 min", fee: "35 MT", isHalal: false },
];

const MOCK_NEARBY = [
  { id: "1", name: "Pizzaria Lisboa", rating: 4.7, time: "15-20 min", fee: "30 MT", distance: "0.8 km" },
  { id: "2", name: "Sushi Zen", rating: 4.9, time: "25-35 min", fee: "60 MT", distance: "1.2 km" },
  { id: "3", name: "Tasca da Matola", rating: 4.4, time: "20-30 min", fee: "35 MT", distance: "1.5 km" },
];

export default function ClientHome() {
  const router = useRouter();

  const renderBanner = ({ item }: { item: (typeof MOCK_BANNERS)[0] }) => (
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>{item.title}</Text>
      <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderCategory = ({ item }: { item: (typeof MOCK_CATEGORIES)[0] }) => (
    <Pressable style={styles.category}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </Pressable>
  );

  const renderRestaurant = ({ item }: { item: (typeof MOCK_FEATURED)[0] }) => (
    <Pressable style={styles.restaurantCard} onPress={() => router.push({ pathname: "/(client)/restaurant", params: { id: item.id } })}>
      <View style={styles.restaurantImage}>
        <Text style={styles.restaurantImagePlaceholder}>🍽️</Text>
        {item.isHalal && <View style={styles.halalBadge}><Text style={styles.halalText}>Halal</Text></View>}
      </View>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <View style={styles.restaurantMeta}>
          <Ionicons name="star" size={14} color="#D97706" />
          <Text style={styles.restaurantRating}>{item.rating}</Text>
          <Text style={styles.restaurantDot}>·</Text>
          <Text style={styles.restaurantTime}>{item.time}</Text>
        </View>
        <Text style={styles.restaurantFee}>Entrega: {item.fee}</Text>
      </View>
    </Pressable>
  );

  const renderNearby = ({ item }: { item: (typeof MOCK_NEARBY)[0] }) => (
    <Pressable style={styles.nearbyCard} onPress={() => router.push({ pathname: "/(client)/restaurant", params: { id: item.id } })}>
      <View style={styles.nearbyImage}>
        <Text style={styles.nearbyImagePlaceholder}>🍽️</Text>
      </View>
      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyName}>{item.name}</Text>
        <View style={styles.nearbyMeta}>
          <Ionicons name="star" size={12} color="#D97706" />
          <Text style={styles.nearbyRating}>{item.rating}</Text>
          <Text style={styles.nearbyDot}>·</Text>
          <Text style={styles.nearbyDistance}>{item.distance}</Text>
        </View>
        <Text style={styles.nearbyFee}>{item.fee} · {item.time}</Text>
      </View>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#756B6A" />
        <Text style={styles.searchPlaceholder}>Restaurantes, pratos ou categorias</Text>
      </View>

      <FlatList
        horizontal
        data={MOCK_BANNERS}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerList}
      />

      <Text style={styles.sectionTitle}>Categorias</Text>
      <FlatList
        horizontal
        data={MOCK_CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      <Text style={styles.sectionTitle}>Destaques</Text>
      <FlatList
        horizontal
        data={MOCK_FEATURED}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.restaurantList}
      />

      <Text style={styles.sectionTitle}>Perto de ti</Text>
      <FlatList
        data={MOCK_NEARBY}
        renderItem={renderNearby}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.nearbyList}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F4" },
  content: { paddingBottom: 20 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  searchPlaceholder: { color: "#756B6A", marginLeft: 8, fontSize: 14 },
  bannerList: { paddingHorizontal: 16, gap: 10 },
  banner: {
    backgroundColor: BRAND,
    borderRadius: 14,
    padding: 18,
    width: 280,
    justifyContent: "center",
  },
  bannerTitle: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  bannerSubtitle: { color: "#F9EEEE", fontSize: 13, marginTop: 4 },
  sectionTitle: {
    color: "#211919",
    fontSize: 20,
    fontWeight: "800",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  categoryList: { paddingHorizontal: 16, gap: 10 },
  category: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    width: 80,
    borderWidth: 1,
    borderColor: "#EAE3E2",
  },
  categoryIcon: { fontSize: 24 },
  categoryName: { color: "#403737", fontSize: 12, fontWeight: "600", marginTop: 6 },
  restaurantList: { paddingHorizontal: 16, gap: 12 },
  restaurantCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    width: 260,
    borderWidth: 1,
    borderColor: "#EAE3E2",
    overflow: "hidden",
  },
  restaurantImage: {
    height: 140,
    backgroundColor: "#F0E1E0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  restaurantImagePlaceholder: { fontSize: 40 },
  halalBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#F9EEEE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  halalText: { color: BRAND, fontSize: 11, fontWeight: "800" },
  restaurantInfo: { padding: 12 },
  restaurantName: { color: "#211919", fontSize: 16, fontWeight: "800" },
  restaurantMeta: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  restaurantRating: { color: "#211919", fontSize: 13, fontWeight: "700", marginLeft: 4 },
  restaurantDot: { color: "#756B6A", marginHorizontal: 4 },
  restaurantTime: { color: "#756B6A", fontSize: 13 },
  restaurantFee: { color: "#756B6A", fontSize: 13, marginTop: 4 },
  nearbyList: { paddingHorizontal: 16, gap: 10 },
  nearbyCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAE3E2",
    overflow: "hidden",
  },
  nearbyImage: {
    width: 80,
    height: 80,
    backgroundColor: "#F0E1E0",
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyImagePlaceholder: { fontSize: 28 },
  nearbyInfo: { flex: 1, padding: 10, justifyContent: "center" },
  nearbyName: { color: "#211919", fontSize: 14, fontWeight: "800" },
  nearbyMeta: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  nearbyRating: { color: "#211919", fontSize: 12, fontWeight: "700", marginLeft: 3 },
  nearbyDot: { color: "#756B6A", marginHorizontal: 3 },
  nearbyDistance: { color: "#756B6A", fontSize: 12 },
  nearbyFee: { color: "#756B6A", fontSize: 12, marginTop: 3 },
});
