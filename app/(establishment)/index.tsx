import SummaryCard from "@/components/others/SummaryCard";
import { StyleSheet, Text, View } from "react-native";
const USER_FIRST_NAME = "Daniela"; // DMC substituir quando tiver auth/perfil

export default function RestauranteHome() {
  const salesToday = 250.0;
  const ordersToday = 6;

  return (
    <View style={styles.container}>
      {/* Saudação */}
      <Text style={styles.greet}>Olá, {USER_FIRST_NAME}</Text>

      {/* Título */}
      <Text style={styles.title}>Resumo de Hoje</Text>

      {/* Cards lado a lado */}
      <View style={styles.row}>
        <SummaryCard
          label="Total das Vendas"
          value={`${salesToday.toFixed(2)} MTN`}
          style={{ marginRight: 12 }}
        />
        <SummaryCard label="Total de Pedidos" value={ordersToday} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "transparent",
  },
  greet: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
});
