import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const PRIMARY = "#782726";

type Store = {
  id: string;
  name: string;
  address: string;
  contact: string | null;
  is_active: boolean | null;
};

export default function StoresScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);

  const loadStores = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: establishment } = await supabase
        .from("establishments")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!establishment) return;

      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("establishment_id", establishment.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
        return;
      }

      setStores(data || []);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadStores();
      setLoading(false);
    })();
  }, [loadStores]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStores();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  const activeStores = stores.filter((s) => s.is_active).length;
  const inactiveStores = stores.length - activeStores;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={PRIMARY}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lojas</Text>
          <Text style={styles.subtitle}>
            Gere todas as lojas do estabelecimento
          </Text>
        </View>

        <Button
          title="+ Nova"
          variant="primary"
          onPress={() => router.push("/(establishment)/(stores)/create-store")}
          style={{ marginTop: 10 }}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stores.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeStores}</Text>
          <Text style={styles.statLabel}>Ativas</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{inactiveStores}</Text>
          <Text style={styles.statLabel}>Inativas</Text>
        </View>
      </View>

      {stores.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🏪</Text>

          <Text style={styles.emptyTitle}>Nenhuma loja criada</Text>

          <Text style={styles.emptyText}>
            Crie a sua primeira loja para começar.
          </Text>

          <View style={{ marginTop: 16 }}>
            <Button
              title="Criar Loja"
              variant="primary"
              onPress={() =>
                router.push("/(establishment)/(stores)/create-store")
              }
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      ) : (
        stores.map((store) => (
          <View key={store.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.storeName}>{store.name}</Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: store.is_active ? "#DCFCE7" : "#FEE2E2",
                  },
                ]}
              >
                <Text
                  style={{
                    color: store.is_active ? "#166534" : "#991B1B",
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {store.is_active ? "ATIVA" : "INATIVA"}
                </Text>
              </View>
            </View>

            <Text style={styles.address}>📍 {store.address}</Text>

            {store.contact && (
              <Text style={styles.contact}>📞 {store.contact}</Text>
            )}

            <View style={styles.actions}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Gerir Loja"
                  variant="primary"
                  onPress={() =>
                    router.push({
                      pathname: "/(establishment)/(stores)/store/[id]",
                      params: {
                        id: store.id,
                      },
                    })
                  }
                  style={{ marginTop: 10 }}
                />
              </View>

              <View style={{ width: 10 }} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 16,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    color: "#666",
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: PRIMARY,
  },

  statLabel: {
    marginTop: 4,
    color: "#666",
    fontSize: 12,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  storeName: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },

  address: {
    marginTop: 12,
    color: "#666",
  },

  contact: {
    marginTop: 8,
    color: "#444",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  actions: {
    flexDirection: "row",
    marginTop: 16,
  },

  emptyCard: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 18,
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  emptyText: {
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },
});
