import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRIMARY = "#782726";

export default function EstablishmentAccount() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("establishments")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error(error);
          return;
        }

        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.cover} />

        <Image
          source={{
            uri: profile?.logo || "https://via.placeholder.com/150",
          }}
          style={styles.logo}
        />

        <Text style={styles.name}>{profile?.name}</Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: profile?.active ? "#DCFCE7" : "#FEE2E2",
            },
          ]}
        >
          <Text
            style={{
              color: profile?.active ? "#166534" : "#991B1B",
              fontWeight: "700",
            }}
          >
            {profile?.active ? "Ativo" : "Inativo"}
          </Text>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.stores || 0}</Text>
          <Text style={styles.statLabel}>Lojas</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.minimum_order || 0}€</Text>
          <Text style={styles.statLabel}>Pedido Mín.</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.delivery_fee || 0}€</Text>
          <Text style={styles.statLabel}>Entrega</Text>
        </View>
      </View>

      {/* INFORMAÇÕES */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informações do estabelecimento</Text>

        <InfoRow label="Email" value={profile?.email} />
        <InfoRow label="Telefone" value={profile?.contact} />
        <InfoRow label="Morada" value={profile?.address} />
        <InfoRow label="Proprietário" value={profile?.owner_name} />
        <InfoRow label="NUIT" value={profile?.nuit} />
        <InfoRow
          label="Data de adesão"
          value={
            profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "-"
          }
        />
      </View>

      {/* DESCRIÇÃO */}
      {profile?.description && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Descrição</Text>

          <Text style={styles.description}>{profile.description}</Text>
        </View>
      )}

      {/* BOTÕES */}
      <Pressable
        style={styles.editBtn}
        onPress={() => router.push("/(establishment)/(settings)/edit-account")}
      >
        <Text style={styles.editText}>Editar Perfil</Text>
      </Pressable>

      <Pressable style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Terminar Sessão</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 15,
  },

  cover: {
    width: "100%",
    height: 120,
    backgroundColor: PRIMARY,
  },

  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginTop: -55,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#fff",
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
  },

  badge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },

  statLabel: {
    color: "#666",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  infoLabel: {
    fontWeight: "600",
  },

  infoValue: {
    color: "#555",
    maxWidth: "60%",
    textAlign: "right",
  },

  description: {
    color: "#555",
    lineHeight: 22,
  },

  editBtn: {
    backgroundColor: PRIMARY,
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  logoutBtn: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: "center",
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 15,
  },
});
