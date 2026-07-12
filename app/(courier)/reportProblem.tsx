import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/** 🔢 Define aqui o número do WhatsApp do suporte (inclui indicativo, ex.: +258...) */
const WHATSAPP_NUMBER = "+351932297705";

/** 🔐 Substituir futuramente por Supabase Auth (id real do entregador) */
function getDelivererId(): string {
  // TODO: Integrar com Supabase (ex.: supabase.auth.getUser())
  return "entregador_mock_001";
}

type ReasonId =
  | "restaurante-fechado"
  | "pedido-nao-pronto"
  | "cliente-nao-atende"
  | "endereco-errado"
  | "pagamento"
  | "problema-pessoal"
  | "outro";

type Reason = { id: ReasonId; emoji: string; label: string };

// Cards grandes (1 toque = 1 escolha)
const REASONS: Reason[] = [
  { id: "restaurante-fechado", emoji: "🏪", label: "Restaurante fechado" },
  { id: "pedido-nao-pronto", emoji: "📦", label: "Pedido não pronto" },
  { id: "cliente-nao-atende", emoji: "🧍", label: "Cliente não atende" },
  { id: "endereco-errado", emoji: "📍", label: "Endereço errado" },
  { id: "pagamento", emoji: "💸", label: "Pagamento" },
  { id: "problema-pessoal", emoji: "🚲", label: "Problema pessoal" },
  { id: "outro", emoji: "⚠️", label: "Outro" },
];

function normalizePhoneForWa(num: string) {
  // wa.me requer somente dígitos (com indicativo do país)
  return (num || "").replace(/[^\d]/g, "");
}

/** Tipos de params aceites via navegação */
type OrderRouteParams = {
  orderId?: string;
  restauranteId?: string;
  clienteId?: string;
  status?: string; // "aceite" | "recolhido" | ...
};

export default function ReportProblem() {
  // Lê params (opcionais) passados quando este ecrã é aberto
  const { orderId, restauranteId, clienteId, status } =
    useLocalSearchParams<OrderRouteParams>();

  const isEmCurso =
    !!orderId && (status === "aceite" || status === "recolhido");

  // Step: 'select' | 'details'
  const [step, setStep] = useState<"select" | "details">("select");
  const [selected, setSelected] = useState<ReasonId | null>(null);

  // Detalhes
  const [details, setDetails] = useState("");
  // Botões desativados?
  const canContinue = useMemo(() => !!selected, [selected]);
  const canSend = useMemo(() => details.trim().length >= 1, [details]);

  const handleContinue = () => {
    if (!selected) {
      Alert.alert(
        "Seleciona uma opção",
        "Escolhe o tipo de problema para continuar.",
      );
      return;
    }
    setStep("details");
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("select");
      return;
    }
  };

  const buildMessage = (reasonLabel: string) => {
    const idEntregador = getDelivererId();

    if (isEmCurso) {
      // Com pedido em curso (aceite/recolhido)
      return (
        `*Reporte de problema*\n` +
        `id_entregador: ${idEntregador}\n` +
        `id_restaurante: ${restauranteId ?? "-"}\n` +
        `id_cliente: ${clienteId ?? "-"}\n` +
        `\n` +
        `Motivo: ${reasonLabel}.\n` +
        `\n` +
        `Detalhes: ${details}`
      );
    }

    // Sem pedido em curso
    return (
      `*Reporte de problema*\n` +
      `id_entregador: ${idEntregador}\n` +
      `\n` +
      `Motivo: ${reasonLabel}.\n` +
      `\n` +
      `Detalhes: ${details}`
    );
  };

  const openWhatsAppWithText = async (text: string) => {
    const encoded = encodeURIComponent(text);
    const appUrl = `whatsapp://send?phone=${encodeURIComponent(
      WHATSAPP_NUMBER,
    )}&text=${encoded}`;
    const webUrl = `https://wa.me/${normalizePhoneForWa(
      WHATSAPP_NUMBER,
    )}?text=${encoded}`;

    const canOpenApp = await Linking.canOpenURL("whatsapp://send");
    await Linking.openURL(canOpenApp ? appUrl : webUrl);
  };

  const handleSend = async () => {
    if (!selected) {
      Alert.alert("Seleciona uma opção", "Escolhe o tipo de problema.");
      return;
    }
    if (!canSend) {
      Alert.alert("Falta descrição", "Explica rapidamente o que aconteceu.");
      return;
    }

    const reasonLabel = REASONS.find((r) => r.id === selected)?.label ?? "—";
    const body = buildMessage(reasonLabel);

    try {
      // Copiamos também para a área de transferência como “fallback” (útil se o utilizador quiser reenviar)
      await Clipboard.setStringAsync(body);

      // 1) Abre o WhatsApp já com o texto formatado
      await openWhatsAppWithText(body);

      Alert.alert("Pronto", "Abrimos o WhatsApp com o reporte preparado.");
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao iniciar o envio. Tenta novamente.",
      );
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {step === "select" ? (
        <>
          <Text style={styles.title}>Qual é o problema?</Text>

          {/* Grid de cards grandes */}
          <View style={{ marginTop: 8 }}>
            {REASONS.map((r) => {
              const active = selected === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setSelected(r.id)}
                  style={[styles.reasonCard, active && styles.reasonCardActive]}
                  android_ripple={{ color: "#E5E7EB" }}
                >
                  <Text style={styles.reasonEmoji}>{r.emoji}</Text>
                  <Text
                    style={[
                      styles.reasonText,
                      active && styles.reasonTextActive,
                    ]}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Botão Continuar */}
          <Pressable
            onPress={handleContinue}
            disabled={!canContinue}
            style={[
              styles.primaryBtn,
              !canContinue && styles.primaryBtnDisabled,
              { marginTop: 16 },
            ]}
          >
            <Text style={styles.primaryBtnText}>Continuar</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.title}>Detalhes do problema</Text>
          <Text style={styles.helper}>Explica rapidamente o que aconteceu</Text>

          {/* Campo texto 2–3 linhas */}
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Escreve aqui (2–3 linhas)…"
            style={[styles.input, styles.textarea]}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Ações: Voltar / Enviar */}
          <View style={styles.actionsRow}>
            <Pressable onPress={handleBack} style={[styles.ghostBtn]}>
              <Text style={styles.ghostBtnText}>Voltar</Text>
            </Pressable>

            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={[styles.primaryBtn, !canSend && styles.primaryBtnDisabled]}
            >
              <Text style={styles.primaryBtnText}>Enviar reporte</Text>
            </Pressable>
          </View>
        </>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7FAFF",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
  },

  // Títulos e texto
  title: { fontSize: 24, fontWeight: "800", color: "#111827" },
  helper: { marginTop: 6, marginBottom: 12, color: "#6B7280" },

  // Cards de motivo
  reasonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  reasonCardActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  reasonEmoji: { fontSize: 20, marginRight: 12 },
  reasonText: { fontSize: 16, color: "#111827", fontWeight: "700" },
  reasonTextActive: { color: "#1D4ED8" },

  // Inputs
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
  textarea: { minHeight: 80 },

  // Preview da foto + botão remover
  previewRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  preview: {
    width: 84,
    height: 84,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#E5E7EB",
  },

  // Botões
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "800" },

  secondaryBtn: {
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  secondaryBtnText: { color: "#111827", fontWeight: "700" },

  ghostBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  ghostBtnText: { color: "#111827", fontWeight: "700" },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});
