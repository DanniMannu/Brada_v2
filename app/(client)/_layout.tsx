import { Slot } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BRAND = "#782726";

export default function ClientLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>Brada.</Text>
        <View style={styles.location}>
          <Text style={styles.locationText}>Maputo, Moçambique</Text>
        </View>
      </View>
      <View style={styles.page}>
        <Slot />
      </View>
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Início</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Pesquisar</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navLabel}>Carrinho</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Pedidos</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Perfil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F4" },
  topBar: {
    backgroundColor: BRAND,
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { color: "#fff", fontSize: 25, fontWeight: "700" },
  location: { flexDirection: "row", alignItems: "center" },
  locationText: { color: "#fff", fontSize: 13 },
  page: { flex: 1 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EAE3E2",
    paddingVertical: 8,
    paddingBottom: 12,
  },
  navItem: { flex: 1, alignItems: "center", gap: 2 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 11, color: "#756B6A" },
});
