import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const PRIMARY = "#782726";

export default function DeletePromo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  const confirmDelete = () => {
    Alert.alert(
      "Remover promoção",
      "Tens a certeza que queres remover esta promoção? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: handleDelete },
      ],
    );
  };

  const handleDelete = async () => {
    if (!id || loading) return;

    try {
      setLoading(true);

      const { error } = await supabase.from("promotions").delete().eq("id", id);

      if (error) {
        Alert.alert("Erro", "Não foi possível remover a promoção.");
        return;
      }

      Alert.alert("Sucesso", "Promoção removida com sucesso.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Remover Promoção</Text>

      <Text style={styles.warning}>
        Esta ação é permanente e não pode ser revertida.
      </Text>

      <Pressable
        style={[styles.deleteBtn, loading && styles.disabledBtn]}
        onPress={confirmDelete}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.deleteText}>Remover promoção</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.cancelBtn}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  warning: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },

  deleteBtn: {
    backgroundColor: "#D62828",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  disabledBtn: {
    opacity: 0.6,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancelBtn: {
    marginTop: 15,
    padding: 15,
    alignItems: "center",
  },

  cancelText: {
    color: PRIMARY,
    fontWeight: "600",
  },
});
