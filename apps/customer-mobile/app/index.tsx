import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Brada.</Text>
      <Text style={styles.subtitle}>App do cliente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  brand: { color: "#782726", fontSize: 42, fontWeight: "800" },
  subtitle: { color: "#4B5563", fontSize: 16 },
});
