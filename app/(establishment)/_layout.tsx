import { clearEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { Slot, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EstablishmentLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    await clearEstablishmentId(); // ✅ limpa o estabelecimento

    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔝 TOP BAR GLOBAL */}
      <View style={styles.topBar}>
        <Pressable onPress={() => setMenuOpen(true)}>
          <Text style={styles.icon}>☰</Text>
        </Pressable>

        <Text style={styles.logo}>Brada.</Text>

        <Pressable onPress={handleLogout}>
          <Text style={styles.icon}>⎋</Text>
        </Pressable>
      </View>

      {/* ✅ DRAWER GLOBAL */}
      {menuOpen && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setMenuOpen(false)}
          />

          <View style={styles.drawer}>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.replace("/(establishment)");
              }}
            >
              <Text style={styles.drawerItem}>🏠 Início</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push("/(establishment)/active-orders");
              }}
            >
              <Text style={styles.drawerItem}>📋 Pedidos em curso</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push("/(establishment)/(menu_management)/menu");
              }}
            >
              <Text style={styles.drawerItem}>🍽️ Menu</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push("/(establishment)/(payments)/payments");
              }}
            >
              <Text style={styles.drawerItem}>💳 Pagamentos</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push("/(establishment)/history");
              }}
            >
              <Text style={styles.drawerItem}>📦 Histórico</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push("/(establishment)/(settings)/settings");
              }}
            >
              <Text style={styles.drawerItem}>⚙️ Definições</Text>
            </Pressable>

            <Pressable onPress={handleLogout}>
              <Text style={styles.drawerLogout}>⎋ Sair</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* ✅ PÁGINA ATUAL */}
      <View style={styles.page}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  /* 🔝 TOP BAR */
  topBar: {
    backgroundColor: "#782726",
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: { color: "#fff", fontSize: 25, fontWeight: "700" },
  icon: { color: "#fff", fontSize: 25 },

  /* ✅ PAGE SLOT */
  page: {
    flex: 1,
  },

  /* ✅ OVERLAY */
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },

  /* ✅ DRAWER PREMIUM */
  drawer: {
    position: "absolute",
    left: 0,
    top: 50,
    width: 240,
    height: "93%",
    backgroundColor: "#f2efef",
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 20,
  },

  drawerItem: {
    fontSize: 18,
    marginVertical: 12,
    color: "#121111",
    fontWeight: "500",
  },

  drawerLogout: {
    marginTop: 10,
    color: "#121111",
    fontWeight: "700",
    fontSize: 18,
  },
});
