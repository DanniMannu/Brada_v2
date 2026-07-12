import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type FaqItem = { q: string; a: string };

const FAQ: FaqItem[] = [
  {
    q: "Não recebo novos pedidos. O que fazer?",
    a: "Verifica se estás em 'Online' no ecrã inicial. Confirma também a ligação à internet. Se o problema persistir, reporta-nos por favor.",
  },
  {
    q: "Como cancelo um pedido que já aceitei?",
    a: "Abre a tab 'Ativos' e usa a ação 'Cancelar'. Explica o motivo no formulário se te for pedido.",
  },
  {
    q: "Não consigo finalizar a entrega no app.",
    a: "Tenta atualizar a página. Se continuares sem conseguir, reporta com o ID do pedido e uma breve descrição.",
  },
];

export default function Help() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>
        Estamos aqui para ajudar. Consulta as respostas rápidas abaixo ou
        reporta um problema.
      </Text>

      {/* Texto explicativo (sem chat ao vivo no MVP) */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Responderemos ao teu reporte o mais rapidamente possível.
        </Text>
      </View>

      {/* FAQ (accordion simples) */}
      <Text style={[styles.sectionTitle, { fontSize: 18 }]}>
        Questões Frequentes
      </Text>
      <View style={{ gap: 13 }}>
        {FAQ.map((item, idx) => (
          <Accordion key={idx} item={item} />
        ))}
      </View>

      {/* Botão “Reportar problema” */}
      <Pressable
        onPress={() => router.push({ pathname: "/(courier)/reportProblem" })}
        style={styles.reportBtn}
      >
        <Text style={styles.reportBtnText}>Reportar problema</Text>
      </Pressable>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Accordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.card}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.q}</Text>
        <Text style={styles.chevron}>{open ? "▾" : "▸"}</Text>
      </Pressable>
      {open && (
        <View style={styles.cardBody}>
          <Text style={styles.cardText}>{item.a}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    backgroundColor: "#F7FAFF",
  },
  title: { fontSize: 28, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 4, marginBottom: 16, color: "#6B7280" },

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

  // Accordion
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { color: "#111827", fontWeight: "700", flex: 1, paddingRight: 8 },
  chevron: { color: "#6B7280", fontSize: 16 },
  cardBody: { paddingHorizontal: 12, paddingBottom: 12 },
  cardText: { color: "#374151" },

  // Botão principal
  reportBtn: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  reportBtnText: { color: "#fff", fontWeight: "800" },
});
