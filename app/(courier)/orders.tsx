// app/(entregador)/orders.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/** ------------------ TIPOS ------------------ */
type PaymentType = "Dinheiro" | "E-MOLA/M-PESA";
type OrderStatus =
  | "pendente"
  | "aceite"
  | "recolhido"
  | "entregue"
  | "recusado"
  | "expirado"
  | "cancelado"; //Caso tenha sido aceite mas depois cancelado pelo restaurante, cliente ou entregador (ex.: por motivo de força maior)

type OrderBase = {
  id: string;
  createdAt: number;
  codigoConfirmacao: string;

  /** ⬇️ Adicionados para o reporte */
  restauranteId: string;
  clienteId: string;

  restauranteNome: string;
  restauranteEndereco: string;
  restauranteCoords: { lat: number; lng: number };
  clienteNome: string;
  clienteEndereco: string;
  clienteCoords: { lat: number; lng: number };
  distanciaKm: number;
  tempoEstimadoMin: number;
  ganhoMtn: number;
  pagamento: PaymentType;
};

type HistoryEntry = OrderBase & {
  status: OrderStatus;
  closedAt: number;
};

const STORAGE_HISTORY_KEY = "courier.history.v1";

/** ------------------ STORAGE ------------------ */
async function appendHistory(entry: HistoryEntry) {
  const raw = await AsyncStorage.getItem(STORAGE_HISTORY_KEY);
  const arr: HistoryEntry[] = raw ? JSON.parse(raw) : [];
  arr.unshift(entry);
  await AsyncStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(arr));
}

/** ------------------ MOCK LISBOA ------------------ */
function createMockOrder(): OrderBase {
  const now = Date.now();
  const rnd = Math.floor(Math.random() * 100000);
  return {
    id: "ord_" + now,
    createdAt: now,
    codigoConfirmacao: "123456", // código estático

    // ⬇️ IDs mockados (no futuro virão do Supabase)
    restauranteId: "rest_" + rnd,
    clienteId: "cli_" + rnd,

    restauranteNome: "Time Out Market",
    restauranteEndereco: "Av. 24 de Julho, Lisboa",
    restauranteCoords: { lat: 38.7078, lng: -9.1466 },
    clienteNome: "Cliente " + Math.floor(Math.random() * 100),
    clienteEndereco: "Saldanha, Lisboa",
    clienteCoords: { lat: 38.7349, lng: -9.1453 },
    distanciaKm: 3 + Math.random() * 3,
    tempoEstimadoMin: 15 + Math.floor(Math.random() * 10),
    ganhoMtn: Math.floor(Math.random() * 200) + 250,
    pagamento: Math.random() > 0.5 ? "Dinheiro" : "E-MOLA/M-PESA",
  };
}

/** ------------------ COMPONENTE REUTILIZÁVEL ------------------ */
export function PedidosAtivos() {
  const [pedido, setPedido] = useState<OrderBase | null>(null);
  const [status, setStatus] = useState<OrderStatus>("pendente");
  const [seconds, setSeconds] = useState(30);
  const [running, setRunning] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [codigoInput, setCodigoInput] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  /** ---------- NOVO PEDIDO ---------- */
  const simulateNewOrder = useCallback(() => {
    stopTimer();
    setPedido(createMockOrder());
    setStatus("pendente");
    setSeconds(30);
    setRunning(true);
  }, []);

  /** ---------- Localização ---------- */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCurrentLocation({ lat: 38.7223, lng: -9.1393 });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    })();

    const id = setTimeout(() => {
      simulateNewOrder();
    }, 0);

    return () => clearTimeout(id);
  }, [simulateNewOrder]);

  /** ---------- TIMER ---------- */
  useEffect(() => {
    if (!running || status !== "pendente") return;

    intervalRef.current = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, status]);

  useEffect(() => {
    if (!pedido) return;
    if (seconds > 0 || status !== "pendente") return;

    const id = setTimeout(async () => {
      stopTimer();

      await appendHistory({
        ...pedido,
        status: "expirado",
        closedAt: Date.now(),
      });

      Alert.alert("Tempo esgotado", "Pedido expirou.");
      simulateNewOrder();
    }, 0);

    return () => clearTimeout(id);
  }, [seconds, pedido, status, simulateNewOrder]);

  const tempoRestante = useMemo(
    () => `${Math.max(0, seconds)} segundos`,
    [seconds],
  );

  /** ---------- MAPA ---------- */
  const openRoute = (destLat: number, destLng: number) => {
    if (!currentLocation) {
      Alert.alert("Erro", "Localização não disponível.");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destLat},${destLng}&travelmode=driving`;

    Linking.openURL(url);
  };

  if (!pedido) return <View style={{ flex: 1, backgroundColor: "#F7FAFF" }} />;

  /** ---------- AÇÕES ---------- */
  const handleAccept = () => {
    stopTimer();
    setStatus("aceite");
  };

  const handleReject = async () => {
    stopTimer();
    await appendHistory({
      ...pedido,
      status: "recusado",
      closedAt: Date.now(),
    });
    simulateNewOrder();
  };

  const handlePickedUp = () => {
    setStatus("recolhido");
  };

  const confirmarEntrega = async () => {
    if (codigoInput !== pedido.codigoConfirmacao) {
      Alert.alert("Código inválido", "O código não corresponde.");
      return;
    }

    await appendHistory({
      ...pedido,
      status: "entregue",
      closedAt: Date.now(),
    });

    setModalVisible(false);
    setCodigoInput("");

    Alert.alert(
      "Entrega concluída 🎉",
      "Verifica se tens novo pedido disponível.",
    );
    simulateNewOrder();
  };

  /** ---------- UI ---------- */
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.restaurant}>{pedido.restauranteNome}</Text>
        <Text style={styles.subtleText}>
          Endereço do restaurante: {pedido.restauranteEndereco}
        </Text>
        <Text style={styles.subtleText}>
          Nome do cliente: {pedido.clienteNome}
        </Text>
        <Text style={styles.subtleText}>
          Endereço do cliente: {pedido.clienteEndereco}
        </Text>

        <View style={styles.gainBox}>
          <Text style={styles.gainLabel}>Ganharás</Text>
          <Text style={styles.gainValue}>{pedido.ganhoMtn} MT</Text>
        </View>

        <Text style={styles.metaInfo}>
          {pedido.distanciaKm.toFixed(1)} km • ~{pedido.tempoEstimadoMin} min •{" "}
          {pedido.pagamento}
        </Text>

        {status === "pendente" && (
          <>
            <View style={styles.actions}>
              <Pressable
                onPress={handleAccept}
                style={[styles.btn, styles.btnAccept]}
              >
                <Text style={styles.btnAcceptText}>Aceitar</Text>
              </Pressable>

              <Pressable
                onPress={handleReject}
                style={[styles.btn, styles.btnReject]}
              >
                <Text style={styles.btnRejectText}>Recusar</Text>
              </Pressable>
            </View>

            <Text style={styles.timer}>⏳ {tempoRestante}</Text>

            <Pressable onPress={simulateNewOrder} style={styles.devBtn}>
              <Text style={styles.devBtnText}>Simular novo pedido</Text>
            </Pressable>
          </>
        )}

        {status === "aceite" && (
          <>
            <Pressable
              style={styles.mapBtn}
              onPress={() =>
                openRoute(
                  pedido.restauranteCoords.lat,
                  pedido.restauranteCoords.lng,
                )
              }
            >
              <Text style={styles.mapBtnText}>Ir para restaurante</Text>
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={handlePickedUp}>
              <Text style={styles.secondaryBtnText}>Marcar como recolhido</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(courier)/reportProblem",
                  params: {
                    orderId: pedido.id,
                    restauranteId: pedido.restauranteId,
                    clienteId: pedido.clienteId,
                    status: "aceite",
                  },
                })
              }
              style={styles.reportBtn}
            >
              <Text style={styles.reportBtnText}>Preciso de ajuda</Text>
            </Pressable>
          </>
        )}

        {status === "recolhido" && (
          <>
            <Pressable
              style={styles.mapBtn}
              onPress={() =>
                openRoute(pedido.clienteCoords.lat, pedido.clienteCoords.lng)
              }
            >
              <Text style={styles.mapBtnText}>Ir para cliente</Text>
            </Pressable>

            <Pressable
              style={styles.deliverBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.deliverBtnText}>Marcar como entregue</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(courier)/reportProblem",
                  params: {
                    orderId: pedido.id,
                    restauranteId: pedido.restauranteId,
                    clienteId: pedido.clienteId,
                    status: "recolhido",
                  },
                })
              }
              style={styles.reportBtn}
            >
              <Text style={styles.reportBtnText}>Preciso de ajuda</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* MODAL CÓDIGO */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Código de confirmação</Text>
            <TextInput
              value={codigoInput}
              onChangeText={setCodigoInput}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
              placeholder="Introduz o código"
            />

            <Pressable style={styles.confirmBtn} onPress={confirmarEntrega}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                Confirmar
              </Text>
            </Pressable>

            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 10 }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** Export default para compatibilidade com rotas existentes, se precisares */
export default PedidosAtivos;

/** ------------------ ESTILOS ------------------ */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7FAFF", padding: 20 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 16 },

  restaurant: { fontSize: 18, fontWeight: "800" },
  subtleText: { color: "#6B7280", marginTop: 4 },

  reportBtn: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  reportBtnText: { color: "#fff", fontWeight: "800" },

  gainBox: {
    marginTop: 14,
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  gainLabel: { color: "#065F46", fontWeight: "600" },
  gainValue: {
    fontSize: 26,
    fontWeight: "900",
    color: "#047857",
    marginTop: 4,
  },

  metaInfo: {
    textAlign: "center",
    marginTop: 8,
    color: "#374151",
    fontWeight: "600",
  },

  actions: { marginTop: 16, flexDirection: "row", gap: 10 },

  btn: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center" },
  btnAccept: { backgroundColor: "#2563EB" },
  btnAcceptText: { color: "#FFF", fontWeight: "800" },
  btnReject: { backgroundColor: "#F3F4F6" },
  btnRejectText: { fontWeight: "800" },

  mapBtn: {
    marginTop: 16,
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  mapBtnText: { color: "#FFF", fontWeight: "800" },

  secondaryBtn: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#FFF", fontWeight: "800" },

  deliverBtn: {
    marginTop: 10,
    backgroundColor: "#059669",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  deliverBtnText: { color: "#FFF", fontWeight: "800" },

  timer: { marginTop: 14, textAlign: "center", fontWeight: "800" },

  devBtn: {
    marginTop: 14,
    alignSelf: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  devBtnText: { fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    width: "80%",
  },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  confirmBtn: {
    backgroundColor: "#059669",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
