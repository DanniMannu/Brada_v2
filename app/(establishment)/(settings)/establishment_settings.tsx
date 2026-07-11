import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
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
  const [savingId, setSavingId] = useState<string | null>(null);

  // ✅ LOAD STORES
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

      if (error) throw error;

      setStores(data || []);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar as lojas.");
    }
  }, []);

  // ✅ TOGGLE ACTIVE (corrigido)
  const toggleActive = async (store: Store) => {
    try {
      setSavingId(store.id);

      const { error } = await supabase
        .from("stores")
        .update({ is_active: !store.is_active })
        .eq("id", store.id);

      if (error) throw error;

      setStores((prev) =>
        prev.map((s) =>
          s.id === store.id ? { ...s, is_active: !s.is_active } : s,
        ),
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar." + error);
    } finally {
      setSavingId(null);
    }
  };

  // ✅ DELETE STORE
  const deleteStore = async (store: Store) => {
    try {
      setSavingId(store.id);

      console.log("store.id :", store.id);

      const { data, error } = await supabase
        .from("stores")
        .delete()
        .eq("id", store.id)
        .select();

      console.log("DELETE DATA:", data);
      console.log("DELETE ERROR:", error);

      if (error) {
        console.log(error);
        Alert.alert("Erro", error.message);
      }

      setStores((prev) => prev.filter((s) => s.id !== store.id));

      Alert.alert("Sucesso", "Loja eliminada.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível eliminar." + error);
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = (store: Store) => {
    Alert.alert("Eliminar Loja", "Esta ação não pode ser revertida.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteStore(store),
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        await loadStores();
        setLoading(false);
      })();
    }, [loadStores]),
  );

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

  return (
    <FlatList
      data={stores}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={PRIMARY}
        />
      }
      ListHeaderComponent={
        <>
          <Text style={styles.title}>A tua Loja</Text>

          <Text style={styles.subtitle}>
            Olá Brada, gere a tua loja, os teus horários e disponibilidade.
          </Text>
        </>
      }
      renderItem={({ item }) => (
        <StoreCard
          store={item}
          saving={savingId === item.id}
          onToggle={() => toggleActive(item)}
          router={router}
        />
      )}
      ListEmptyComponent={<EmptyState router={router} />}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 40,
      }}
    />
  );
}

/* ✅ COMPONENTE CARD */
function StoreCard({ store, saving, onToggle, router }: any) {
  const isActive = store.is_active;

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.cardHeader}>
        <Text style={styles.storeName}>{store.name}</Text>

        <View
          style={[
            styles.badge,
            isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isActive ? styles.activeText : styles.inactiveText,
            ]}
          >
            {isActive ? "ATIVA" : "INATIVA"}
          </Text>
        </View>
      </View>

      {/* INFO */}
      <View style={styles.infoBlock}>
        <Text style={styles.label}>📍 Morada</Text>
        <Text style={styles.value}>{store.address}</Text>
      </View>

      {store.contact && (
        <View style={styles.infoBlock}>
          <Text style={styles.label}>📞 Contacto</Text>
          <Text style={styles.value}>{store.contact}</Text>
        </View>
      )}

      {/* ACTIONS */}

      <Button
        title="Editar"
        variant="secondary"
        onPress={() =>
          router.push({
            pathname: "/(establishment)/(stores)/edit-store",
            params: { id: store.id },
          })
        }
        style={{ marginTop: 12 }}
      />

      <Button
        title="Horários"
        variant="primary"
        onPress={() =>
          router.push({
            pathname: "/(establishment)/(stores)/store-schedule/[id]",
            params: { id: store.id },
          })
        }
        style={{ marginTop: 12 }}
      />

      <Button
        title={isActive ? "Desativar Loja" : "Ativar Loja"}
        variant="secondary"
        onPress={onToggle}
        disabled={saving}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

/* ✅ EMPTY STATE */
function EmptyState({ router }: any) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>Nenhuma loja criada</Text>

      <Button
        title="Criar Loja"
        onPress={() => router.push("/(establishment)/(stores)/create-store")}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 20,
  },

  // ✅ CARD MODERNO
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,

    borderWidth: 1,
    borderColor: "#EDEDED",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  // ✅ HEADER DO CARD
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  storeName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#020617",
  },

  // ✅ BADGE ESTADO (Uber style)
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },

  activeText: {
    color: "#166534",
  },

  inactiveText: {
    color: "#991B1B",
  },

  // ✅ INFO
  infoBlock: {
    marginBottom: 12,
  },

  label: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },

  // ✅ ACTIONS (grid tipo Glovo)
  actionsColumn: {
    marginTop: 18,
  },

  // ✅ EMPTY
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 20,
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#EDEDED",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#020617",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 15,
    marginBottom: 18,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  summaryItem: {
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY,
  },

  summaryLabel: {
    color: "#64748B",
    marginTop: 4,
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#E5E7EB",
  },
});
