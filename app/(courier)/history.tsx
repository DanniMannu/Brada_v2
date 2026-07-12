import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

/** ------------------ TIPOS ------------------ */
/**
 * Estados finais visíveis no histórico.
 */
type FinalStatus = "entregue" | "recusado" | "cancelado";

type PagamentoType = "Dinheiro" | "E-MOLA/M-PESA";

type HistoryEntry = {
  id: string; // id do pedido
  createdAt: number; // data/hora de criação do pedido (epoch ms)
  restauranteNome: string; // nome do restaurante
  distanciaKm: number; // distância percorrida (km)
  ganhoMtn: number; // valor recebido (MT) — 0 para recusado/cancelado
  pagamento: PagamentoType; // método de pagamento
  status: FinalStatus; // estado final
  closedAt: number; // data/hora de fecho do pedido (epoch ms)
};

const STORAGE_HISTORY_KEY = "courier.history.v1";

/** ------------------ CONFIG MOCK ------------------ */
/**
 * Quando não existir histórico guardado, semeia alguns registos
 * mockados para desenvolvimento. No futuro, os dados virão do Supabase.
 */
const SEED_ON_EMPTY = true;
const MOCK_SEED_COUNT = 6;

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createMockHistoryEntry(i: number): HistoryEntry {
  const now = Date.now();
  const minutesAgo = (i + 1) * (10 + Math.floor(Math.random() * 50));
  const createdAt = now - minutesAgo * 60 * 1000;
  const closedAt =
    createdAt + (10 + Math.floor(Math.random() * 20)) * 60 * 1000;

  const restaurantes = [
    "Time Out Market",
    "Cervejaria Ramiro",
    "A Padaria Portuguesa",
    "Sea Me",
    "O Talho",
    "Zé da Mouraria",
  ];

  const pagamento = randomFrom<PagamentoType>(["Dinheiro", "E-MOLA/M-PESA"]);
  const status = randomFrom<FinalStatus>(["entregue", "recusado", "cancelado"]);

  const distanciaKm = +(2 + Math.random() * 6).toFixed(1);

  // Ganho apenas se entregue, senão 0
  const ganhoMtn =
    status === "entregue" ? Math.floor(200 + Math.random() * 250) : 0;

  return {
    id: "ord_mock_" + createdAt,
    createdAt,
    restauranteNome: randomFrom(restaurantes),
    distanciaKm,
    ganhoMtn,
    pagamento,
    status,
    closedAt,
  };
}

async function seedHistoryIfEmpty(): Promise<HistoryEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_HISTORY_KEY);
  if (raw) {
    try {
      const parsed: HistoryEntry[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // cai para baixo e gera seed
    }
  }

  if (!SEED_ON_EMPTY) return [];

  const seeded: HistoryEntry[] = Array.from({ length: MOCK_SEED_COUNT }).map(
    (_v, idx) => createMockHistoryEntry(idx),
  );

  await AsyncStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(seeded));
  return seeded;
}

/** ------------------ ECRÃ ------------------ */

export default function Historico() {
  const [data, setData] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        // 1) Carrega do storage (ou cria seed se vazio)
        const arr = await seedHistoryIfEmpty();

        // 2) (Futuro) Substituir por fetch ao Supabase e normalizar para HistoryEntry[]
        // const { data: rows, error } = await supabase
        //   .from('orders_history')
        //   .select('id, created_at, restaurant_name, distance_km, amount_mtn, payment, status, closed_at')
        //   .order('closed_at', { ascending: false });
        // if (!error && rows) { ... setData(normalize(rows)); return; }

        // 3) Filtra apenas os estados exigidos
        const filtrado = arr.filter(
          (h) =>
            h.status === "entregue" ||
            h.status === "recusado" ||
            h.status === "cancelado",
        );

        // 4) Ordena por closedAt desc para melhor UX
        filtrado.sort((a, b) => b.closedAt - a.closedAt);

        setData(filtrado);
      } catch {
        setData([]);
      }
    };

    loadHistory();
  }, []);

  // Total ganho: soma somente os pedidos ENTREGUE/CANCELADO (recusado não conta)
  const totalGanho = useMemo(
    () =>
      data
        .filter((i) => i.status === "entregue" || i.status === "cancelado")
        .reduce((acc, item) => acc + (Number(item.ganhoMtn) || 0), 0),
    [data],
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const statusLabel = (s: FinalStatus) =>
    s === "entregue" ? "Entregue" : s === "recusado" ? "Recusado" : "Cancelado";

  return (
    <View style={styles.screen}>
      {/* Cabeçalho com Total Ganho (apenas entregues) */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total ganho</Text>
        <Text style={styles.summaryValue}>{fmt(totalGanho)} MT</Text>
      </View>

      {data.length === 0 ? (
        <Text style={styles.empty}>Sem registos.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id + "_" + item.closedAt}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Restaurante */}
              <Text style={styles.nameLine}>{item.restauranteNome}</Text>

              {/* Distância + pagamento */}
              <Text style={styles.subtle}>
                {item.distanciaKm.toFixed(1)} km •{" "}
                {item.pagamento === "Dinheiro" ? "Dinheiro" : "E-MOLA/M-PESA"}
              </Text>

              {/* Valor recebido */}
              <View style={styles.row}>
                <Text style={styles.ganhoLabel}>Ganho:</Text>
                <Text style={styles.ganhoValue}>
                  {item.status === "recusado" ? "0" : fmt(item.ganhoMtn)} MT
                </Text>
              </View>

              {/* Data/hora do pedido + estado final */}
              <View style={[styles.row, { marginTop: 6 }]}>
                <Text style={{ color: "#6B7280" }}>
                  {new Date(item.createdAt).toLocaleString("pt-PT")}
                </Text>
                <Text style={[styles.badge, badgeStyleFor(item.status)]}>
                  {statusLabel(item.status)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

/** ------------------ UI HELPERS ------------------ */

function badgeStyleFor(status: FinalStatus) {
  switch (status) {
    case "entregue":
      return { backgroundColor: "#DCFCE7", color: "#166534" };
    case "recusado":
      return { backgroundColor: "#FFE4E6", color: "#9F1239" };
    case "cancelado":
      return { backgroundColor: "#FEF9C3", color: "#92400E" };
    default:
      return {};
  }
}

/** ------------------ ESTILOS ------------------ */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7FAFF", padding: 20, paddingTop: 28 },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { color: "#6B7280", fontWeight: "700" },
  summaryValue: { color: "#0F766E", fontWeight: "900", fontSize: 18 },

  empty: { color: "#6B7280" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 10,
  },
  nameLine: { color: "#111827", fontWeight: "800" },
  subtle: { color: "#6B7280", marginTop: 2 },

  row: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ganhoLabel: { color: "#374151", fontWeight: "700" },
  ganhoValue: { color: "#065F46", fontWeight: "900" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "800",
    overflow: "hidden",
  },
});
