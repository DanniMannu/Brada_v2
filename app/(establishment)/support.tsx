import Button from "@/components/ui/Button";
import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
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

const WHATSAPP_NUMBER = "+351932297705";

type ReasonId =
  | "pedidos"
  | "pagamentos"
  | "app"
  | "clientes"
  | "entregas"
  | "conta"
  | "outro";

type Reason = { id: ReasonId; emoji: string; label: string };

const REASONS: Reason[] = [
  { id: "pedidos", emoji: "📦", label: "Problema com pedidos" },
  { id: "pagamentos", emoji: "💳", label: "Pagamentos / faturação" },
  { id: "app", emoji: "📱", label: "Erro na aplicação" },
  { id: "clientes", emoji: "🧍", label: "Problema com cliente" },
  { id: "entregas", emoji: "🚚", label: "Problema com entrega" },
  { id: "conta", emoji: "⚙️", label: "Configuração / conta" },
  { id: "outro", emoji: "⚠️", label: "Outro" },
];

function normalizePhone(num: string) {
  return (num || "").replace(/[^\d]/g, "");
}

export default function SupportEstablishment() {
  const [step, setStep] = useState<"select" | "details">("select");
  const [selected, setSelected] = useState<ReasonId | null>(null);
  const [details, setDetails] = useState("");

  const canContinue = useMemo(() => !!selected, [selected]);
  const canSend = useMemo(() => details.trim().length > 2, [details]);

  const buildMessage = (reason: string) => {
    return (
      `*Suporte Estabelecimento*\n\n` +
      `Motivo: ${reason}\n\n` +
      `Detalhes:\n${details}`
    );
  };

  const openWhatsApp = async (text: string) => {
    const encoded = encodeURIComponent(text);

    const appUrl = `whatsapp://send?phone=${encodeURIComponent(
      WHATSAPP_NUMBER,
    )}&text=${encoded}`;

    const webUrl = `https://wa.me/${normalizePhone(
      WHATSAPP_NUMBER,
    )}?text=${encoded}`;

    const supported = await Linking.canOpenURL("whatsapp://send");

    await Linking.openURL(supported ? appUrl : webUrl);
  };

  const send = async () => {
    if (!selected) return;
    if (!canSend) {
      Alert.alert("Escreve mais detalhes", "Descreve melhor o problema.");
      return;
    }

    const reasonLabel = REASONS.find((r) => r.id === selected)?.label || "-";

    const message = buildMessage(reasonLabel);

    try {
      await Clipboard.setStringAsync(message);
      await openWhatsApp(message);

      Alert.alert("Suporte", "Mensagem pronta no WhatsApp ✅");
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp");
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {step === "select" ? (
        <>
          <Text style={styles.title}>Precisaste de ajuda?</Text>
          <Text style={styles.subtitle}>Escolhe o tipo de problema</Text>

          <View style={styles.grid}>
            {REASONS.map((r) => {
              const active = selected === r.id;

              return (
                <Pressable
                  key={r.id}
                  onPress={() => setSelected(r.id)}
                  style={[styles.card, active && styles.cardActive]}
                >
                  <Text style={styles.emoji}>{r.emoji}</Text>
                  <Text
                    style={[styles.cardText, active && styles.cardTextActive]}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            title="Continuar"
            onPress={() => setStep("details")}
            variant="primary"
            disabled={!canContinue}
            style={[!canContinue && styles.disabled]}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Explica o problema</Text>
          <Text style={styles.subtitle}>Sê breve mas claro (2–3 linhas)</Text>

          <TextInput
            style={styles.textarea}
            placeholder="Ex: Não consigo aceitar pedidos..."
            value={details}
            onChangeText={setDetails}
            multiline
          />

          <View style={styles.actions}>
            <Pressable
              onPress={() => setStep("select")}
              style={styles.secondaryBtn}
            >
              <Text>Voltar</Text>
            </Pressable>

            <Button
              title="Enviar"
              variant="primary"
              onPress={send}
              disabled={!canSend}
              style={[{ paddingVertical: -10 }, !canSend && styles.disabled]}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    padding: 20,
    paddingTop: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: "#666",
  },

  grid: {
    gap: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },

  cardActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  emoji: {
    fontSize: 20,
    marginRight: 12,
  },

  cardText: {
    fontWeight: "700",
    fontSize: 15,
  },

  cardTextActive: {
    color: "#1D4ED8",
  },

  textarea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  primaryBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "800",
  },

  secondaryBtn: {
    padding: 14,
  },

  disabled: {
    opacity: 0.5,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
