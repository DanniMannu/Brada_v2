import SummaryCard from "@/components/others/SummaryCard";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Earnings() {
  // --- MOCK de dados (substituir quando ligares ao backend) ---
  const ganhosHoje = 350.0;
  const ganhosSemana = 2100.5;
  const totalMesAtual = 8200.75;
  const entregasRealizadas = 42;
  const totalMesPassado = 7600.25;

  // helpers para apresentar valores
  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  // "Mês atual" e "Mês passado" (ex.: "fevereiro 2026", "janeiro 2026")
  const mesAtual = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-PT", {
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  const mesPassado = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return new Intl.DateTimeFormat("pt-PT", {
      month: "long",
      year: "numeric",
    }).format(d);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Título e subtítulo */}

      {/* Cabeçalho do mês atual */}
      <Text style={[styles.sectionTitle, { marginTop: 2 }]}>{mesAtual}</Text>

      {/* Cartões — 1 por linha */}
      <View style={styles.list}>
        <SummaryCard
          label="Ganhos de hoje"
          value={`${fmt(ganhosHoje)} MTN`}
          style={styles.cardFull}
        />
        <SummaryCard
          label="Ganhos da semana"
          value={`${fmt(ganhosSemana)} MTN`}
          style={styles.cardFull}
        />
        <SummaryCard
          label="Total do mês (acumulado)"
          value={`${fmt(totalMesAtual)} MTN`}
          style={styles.cardFull}
        />
        <SummaryCard
          label="Total de entregas realizadas (mês)"
          value={entregasRealizadas}
          style={styles.cardFull}
        />
      </View>

      {/* Separador visual (opcional) */}
      <View style={styles.divider} />

      {/* Cartão do mês passado */}
      <Text style={styles.sectionTitle}> {mesPassado}</Text>
      <SummaryCard
        label="Total do mês passado"
        value={`${fmt(totalMesPassado)} MTN`}
        style={styles.cardFull}
      />

      {/* Espaço no fim */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 12,
    backgroundColor: "#F7FAFF", // azul suave (coerente com o resto)
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textTransform: "capitalize", // meses em pt-PT vêm minúsculos; mantém legibilidade
  },
  list: {
    // coluna por omissão; 1 por linha
  },
  cardFull: {
    width: "100%",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
});
