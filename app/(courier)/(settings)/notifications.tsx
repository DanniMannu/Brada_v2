import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

/**
 * Mock pronto para substituir por Supabase futuramente:
 *  - getPrefsFromStore / savePrefsToStore -> trocar por SELECT/UPDATE no perfil.
 */
const KEY_CONSENT = "settings.notifications.consent";
const KEY_ORDERS_PUSH = "settings.notifications.ordersPush";
const KEY_OFFERS_PUSH = "settings.notifications.offersPush";
const KEY_OFFERS_EMAIL = "settings.notifications.offersEmail";

type Prefs = {
  consent: boolean;
  ordersPush: boolean;
  offersPush: boolean;
  offersEmail: boolean;
};

async function getPrefsFromStore(): Promise<Prefs> {
  const [c, o, op, em] = await Promise.all([
    AsyncStorage.getItem(KEY_CONSENT),
    AsyncStorage.getItem(KEY_ORDERS_PUSH),
    AsyncStorage.getItem(KEY_OFFERS_PUSH),
    AsyncStorage.getItem(KEY_OFFERS_EMAIL),
  ]);
  return {
    consent: c === null ? false : c === "1",
    ordersPush: o === null ? false : o === "1",
    offersPush: op === null ? false : op === "1",
    offersEmail: em === null ? true : em === "1",
  };
}

async function savePrefsToStore(p: Prefs) {
  await Promise.all([
    AsyncStorage.setItem(KEY_CONSENT, p.consent ? "1" : "0"),
    AsyncStorage.setItem(KEY_ORDERS_PUSH, p.ordersPush ? "1" : "0"),
    AsyncStorage.setItem(KEY_OFFERS_PUSH, p.offersPush ? "1" : "0"),
    AsyncStorage.setItem(KEY_OFFERS_EMAIL, p.offersEmail ? "1" : "0"),
  ]);
}

export default function Notifications() {
  const [prefs, setPrefs] = useState<Prefs>({
    consent: false,
    ordersPush: false,
    offersPush: false,
    offersEmail: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const initial = await getPrefsFromStore();
        setPrefs(initial);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setAndSave = async (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    await savePrefsToStore(next);
  };

  const guardPushToggle = (enabled: boolean, onUpdate: () => void) => {
    if (!prefs.consent && enabled) {
      Alert.alert(
        "Ativar alertas",
        "Primeiro ativa as notificações no cartão acima.",
      );
      return;
    }
    onUpdate();
  };

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: "#F7FAFF" }} />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Cartão de consentimento */}
      <View style={styles.consentCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.consentTitle}>Podemos enviar‑te alertas?</Text>
          <Text style={styles.consentDesc}>
            Ativa os alertas do app para estares sempre atualizado.
          </Text>
        </View>
      </View>

      {/* Secção: Atualizações sobre os pedidos */}
      <Section
        title="Atualizações sobre os pedidos"
        subtitle="Acontecimentos do teu pedido e mensagens de apoio."
      >
        <Row
          label="Notificações push"
          right={
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Badge label="Recomendado" />
              <Switch
                value={prefs.ordersPush}
                onValueChange={(v) =>
                  guardPushToggle(v, () => setAndSave({ ordersPush: v }))
                }
                disabled={!prefs.consent}
                thumbColor="#ffffff"
              />
            </View>
          }
        />
      </Section>

      {/* Secção: Ofertas */}
      <Section
        title="Ofertas"
        subtitle="Promoções e/ou vouchers pensados para ti."
      >
        <Row
          label="Notificações push"
          right={
            <Switch
              value={prefs.offersPush}
              onValueChange={(v) =>
                guardPushToggle(v, () => setAndSave({ offersPush: v }))
              }
              disabled={!prefs.consent}
              thumbColor="#ffffff"
            />
          }
        />
        <Row
          label="E‑mails personalizados"
          right={
            <Switch
              value={prefs.offersEmail}
              onValueChange={(v) => setAndSave({ offersEmail: v })}
              thumbColor="#ffffff"
            />
          }
        />
      </Section>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

/* ======================= Sub‑componentes ======================= */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ label, right }: { label: string; right: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View>{right}</View>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

/* ======================= Estilos ======================= */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7FAFF" },
  container: { padding: 20, paddingTop: 16 },

  consentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  consentTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  consentDesc: { marginTop: 6, color: "#6B7280" },
  consentCta: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  consentCtaText: { color: "#fff", fontWeight: "800" },
  consentActivePill: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  consentActiveText: { color: "#065F46", fontWeight: "800" },

  sectionTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  sectionSubtitle: { color: "#6B7280", marginTop: 4, marginBottom: 8 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
  },

  row: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: { color: "#111827", fontWeight: "700" },

  badge: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FCD34D",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  badgeText: { color: "#92400E", fontSize: 12, fontWeight: "800" },
});
