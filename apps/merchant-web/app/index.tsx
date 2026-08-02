import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const sections = ["Visão geral", "Pedidos", "Menu", "Lojas", "Pagamentos", "Definições"];

export default function DashboardScreen() {
  return (
    <View style={styles.page}>
      <View style={styles.sidebar}>
        <Text style={styles.brand}>Brada.</Text>
        <View style={styles.navigation}>
          {sections.map((section, index) => (
            <Pressable key={section} style={[styles.navItem, index === 0 && styles.navItemActive]}>
              <Text style={styles.navText}>{section}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ESTABELECIMENTO</Text>
        <Text style={styles.heading}>Bom dia.</Text>
        <Text style={styles.description}>O painel de gestão do seu estabelecimento fica aqui.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: "row", backgroundColor: "#F7F7F6" },
  sidebar: { width: 250, padding: 24, backgroundColor: "#782726" },
  brand: { color: "#FFFFFF", fontSize: 30, fontWeight: "800" },
  navigation: { marginTop: 42, gap: 8 },
  navItem: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 },
  navItemActive: { backgroundColor: "rgba(255,255,255,0.16)" },
  navText: { color: "#FFFFFF", fontSize: 16 },
  content: { flexGrow: 1, padding: 72, justifyContent: "center" },
  eyebrow: { color: "#782726", fontSize: 12, fontWeight: "700", letterSpacing: 1.2 },
  heading: { marginTop: 8, color: "#171717", fontSize: 42, fontWeight: "800" },
  description: { marginTop: 10, color: "#4B5563", fontSize: 17 },
});
