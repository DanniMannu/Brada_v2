// app/(entregador)/profile.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ======================= TIPOS/STATE ======================= */

type VehicleType = "Bicicleta" | "Moto" | "Carro" | "Triciclo";
type Gender = "Mulher" | "Homem" | "Outro" | "";

type CourierProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: Gender;
  address?: string; // ← novo campo: morada
  vehicle: VehicleType;
  plate?: string;
  photoUri?: string | null; // apenas visualização (não editável)
};

const STORAGE_KEY = "courier.profile.v1";

/* ======================= COMPONENTE ======================= */

export default function Profile() {
  const router = useRouter();

  const [profile, setProfile] = useState<CourierProfile>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "",
    address: "",
    vehicle: "Moto",
    plate: "",
    photoUri: null,
  });

  const [loading, setLoading] = useState(true);

  /* --------- carregar do storage --------- */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<CourierProfile>;
          setProfile((p) => ({ ...p, ...parsed }));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* --------- back handler (Android) → regressa a settings/index --------- */
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      // substitui o ecrã atual para evitar empilhar rotas
      router.replace("/(courier)/(settings)/index");
      return true; // consome o evento
    });

    return () => sub.remove();
  }, [router]);

  const fullName = useMemo(
    () =>
      [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—",
    [profile.firstName, profile.lastName],
  );

  if (loading) return <View style={{ flex: 1, backgroundColor: "#F7FAFF" }} />;

  /* ======================= UI ======================= */

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar (apenas visualizar) */}
      <View style={styles.avatarBlock}>
        <View style={styles.avatarFrame}>
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarPlaceholder}>👤</Text>
          )}
        </View>
      </View>

      {/* Lista estilo ficha (sem setas, sem edição) */}
      <View style={styles.list}>
        <ItemRow label="Nome" value={fullName} />
        <ItemRow label="Género" value={profile.gender || "—"} />
        <ItemRow
          label="Número de telefone"
          value={profile.phone || "—"}
          status="ok" // bolinha verde (ex.: validado)
        />
        <ItemRow
          label="E-mail"
          value={profile.email || "—"}
          status="warn" // bolinha amarela (ex.: por verificar)
        />
        <ItemRow
          label="Morada"
          value={profile.address || "Rua do Embondeiro Q32"}
        />
        <ItemRow label="Veículo" value={profile.vehicle || "Moto"} />
        <ItemRow label="Matrícula" value={profile.plate || "00-00-00"} />
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

/* ======================= SUB-COMPONENTES ======================= */

function ItemRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: "ok" | "warn";
}) {
  return (
    <View style={styles.itemRow}>
      <Text style={styles.itemLabel}>{label}</Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
      >
        {status === "ok" && <View style={[styles.dot, styles.dotOk]} />}
        {status === "warn" && <View style={[styles.dot, styles.dotWarn]} />}
        <Text style={styles.itemValue}>{value}</Text>
      </View>
    </View>
  );
}

/* ======================= ESTILOS ======================= */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7FAFF" },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },

  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  /* Avatar */
  avatarBlock: {
    alignItems: "flex-start",
    marginBottom: 10,
  },
  avatarFrame: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: { width: 72, height: 72 },
  avatarPlaceholder: { fontSize: 30 },

  /* Lista */
  list: {
    marginTop: 8,
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  itemLabel: { color: "#6B7280", fontWeight: "600" },
  itemValue: { color: "#111827", fontWeight: "700", marginLeft: 0 },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 6,
  },
  dotOk: { backgroundColor: "#10B981" }, // verde
  dotWarn: { backgroundColor: "#F59E0B" }, // amarelo
});
