import { StyleSheet, Text, View, ViewStyle } from "react-native";

type Props = {
  label: string;
  value: string | number;
  style?: ViewStyle;
};

export default function SummaryCard({ label, value, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(20, 90, 200, 0.15)", // azul muito suave
    // sombra leve
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    minHeight: 96,
  },
  label: {
    color: "#5A6B8A",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  value: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
  },
});
