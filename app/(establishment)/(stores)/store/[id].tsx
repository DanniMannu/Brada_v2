import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function StoreDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("stores")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.log(error);
          return;
        }

        setStore(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  const toggleActive = async () => {
    if (!store) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("stores")
        .update({
          is_active: !store.is_active,
        })
        .eq("id", store.id);

      if (error) throw error;

      setStore({
        ...store,
        is_active: !store.is_active,
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível atualizar a loja.");
    } finally {
      setSaving(false);
    }
  };

  const deleteStore = async () => {
    console.log("deleteStore chamado 2");
    if (!store) return;

    console.log("deleteStore chamado");
    try {
      setSaving(true);

      console.log("store.id:", store.id);

      const { data, error } = await supabase
        .from("stores")
        .delete()
        .eq("id", store.id)
        .select();

      console.log("DELETE DATA:", data);
      console.log("DELETE ERROR:", error);

      if (error) throw error;

      Alert.alert("Sucesso", "Loja eliminada.");

      router.replace("../../");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível eliminar.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Eliminar Loja", "Esta ação não pode ser revertida.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: deleteStore,
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.loading}>
        <Text>Loja não encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{store.name}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Morada</Text>
        <Text style={styles.value}>{store.address}</Text>

        {store.contact && (
          <>
            <Text style={styles.label}>Contacto</Text>
            <Text style={styles.value}>{store.contact}</Text>
          </>
        )}

        <Text style={styles.label}>Estado</Text>
        <Text
          style={[
            styles.status,
            {
              color: store.is_active ? "#166534" : "#991B1B",
            },
          ]}
        >
          {store.is_active ? "Ativa" : "Inativa"}
        </Text>
      </View>

      {/* GRID ACTIONS */}
      <View style={styles.actionsGrid}>
        <View style={styles.actionItem}>
          <Button
            title="Editar dados"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/(establishment)/(stores)/edit-store",
                params: { id: store.id },
              })
            }
            style={{ marginTop: 10 }}
          />
        </View>

        <View style={styles.actionItem}>
          <Button
            title="Gerir horários"
            variant="primary"
            onPress={() =>
              router.push({
                pathname: "/(establishment)/(stores)/store-schedule/[id]",
                params: { id: store.id },
              })
            }
            style={{ marginTop: 10 }}
          />
        </View>

        <View style={styles.actionItem}>
          <Button
            title={store.is_active ? "Desativar" : "Ativar"}
            variant="secondary"
            onPress={toggleActive}
            disabled={saving}
            style={{ marginTop: 10 }}
          />
        </View>

        <View style={styles.actionItem}>
          <Button
            title="Eliminar"
            variant="secondary"
            onPress={confirmDelete}
            style={{ marginTop: 10 }}
          />
        </View>
      </View>
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

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    color: "#111",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },

  label: {
    fontSize: 12,
    color: "#888",
    marginTop: 12,
  },

  value: {
    fontSize: 15,
    color: "#111",
    marginTop: 4,
  },

  status: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },

  actionItem: {
    width: "48%",
    marginBottom: 12,
  },
});
