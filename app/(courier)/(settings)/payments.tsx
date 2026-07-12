import { StyleSheet, Text, View } from "react-native";

export default function Payments() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Info label="Forma de pagamento atual" value="M‑Pesa" />
        <Info
          label="Frequência de pagamento"
          value="Semanal * Todas Segundas-Feiras"
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Para alterar a forma de pagamento ou a frequência, por favor,
            contacta o suporte através da secção de ajuda. Estamos aqui para
            ajudar!
          </Text>
        </View>
      </View>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FAFF", padding: 20 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoLabel: { color: "#6B7280", marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: "700" },
  btn: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: { color: "#FFF", fontWeight: "800", textAlign: "center" },
  infoBox: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoText: { color: "#1E3A8A" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
});
