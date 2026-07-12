import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export default function SettingsHome() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <SettingItem
        label="Informações pessoais"
        onPress={() => router.push("/(courier)/profile")}
      />

      <SettingItem
        label="Notificações"
        onPress={() => router.push("/(courier)/(settings)/notifications")}
      />

      <SettingItem
        label="Pagamentos"
        onPress={() => router.push("/(courier)/(settings)/payments")}
      />

      <SettingItem
        label="Segurança"
        onPress={() => router.push("/(courier)/(settings)/security")}
      />
    </ScrollView>
  );
}

function SettingItem({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.itemText}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7FAFF" },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 16 },
  item: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemText: { fontSize: 16, fontWeight: "600", color: "#111827" },
  chevron: { fontSize: 20, color: "#9CA3AF" },
});
