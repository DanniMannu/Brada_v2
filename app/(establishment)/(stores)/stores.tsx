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

export default function Stores() {
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

      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("establishment_id", establishment.id)
        .order("created_at", { ascending: false });

      setStores((data ?? []) as Store[]);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStores();
    setRefreshing(false);
  };

  useEffect(() => {
    (async () => {
      await loadStores();
      setLoading(false);
    })();
  }, [loadStores]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

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
            {stores.length} loja{stores.length !== 1 ? "s" : ""} registada
            {stores.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <Button
          title="+ Nova"
          variant="primary"
          onPress={() => router.push("/(establishment)/(stores)/create-store")}
          style={styles.newButton}
        />
      </View>

      {stores.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🏪</Text>

          <Text style={styles.emptyTitle}>Nenhuma loja encontrada</Text>

          <Text style={styles.emptyText}>
            Crie a sua primeira loja para começar a gerir equipas, horários e
            operações.
          </Text>

          <Button
            title="Criar Loja"
            variant="primary"
            onPress={() =>
              router.push("/(establishment)/(stores)/create-store")
            }
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        stores.map((store) => (
          <View key={store.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{store.name}</Text>

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

            <Button
              title="Gerir Loja"
              variant="primary"
              onPress={() =>
                router.push({
                  pathname: "/(establishment)/(stores)/edit-store",
                  params: {
                    storeId: store.id,
                  },
                })
              }
              style={styles.manageButton}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
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
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    color: "#777",
    marginTop: 4,
  },

  newButton: {
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },

  address: {
    color: "#666",
    marginTop: 12,
  },

  contact: {
    color: "#444",
    marginTop: 8,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },

  manageButton: {
    marginTop: 16,
    borderRadius: 12,
  },

  emptyCard: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 18,
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },
});
