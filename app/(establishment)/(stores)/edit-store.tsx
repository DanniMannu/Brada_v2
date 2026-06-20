import { supabase } from "@/lib/supabase";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function EditStore() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [store, setStore] = useState({
    name: "",
    address: "",
    contact: "",
  });

  const loadStore = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (!data) return;

      setStore({
        name: data.name ?? "",
        address: data.address ?? "",
        contact: data.contact ?? "",
      });
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      void loadStore();
    }, [loadStore, id]),
  );

  const saveStore = async () => {
    try {
      const { error } = await supabase
        .from("stores")
        .update({
          name: store.name,
          address: store.address,
          contact: store.contact,
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível guardar a loja.");
        return;
      }

      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Loja</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={store.name}
        onChangeText={(text) => setStore((prev) => ({ ...prev, name: text }))}
      />

      <TextInput
        style={styles.input}
        placeholder="Morada"
        value={store.address}
        onChangeText={(text) =>
          setStore((prev) => ({ ...prev, address: text }))
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Contacto"
        value={store.contact}
        onChangeText={(text) =>
          setStore((prev) => ({ ...prev, contact: text }))
        }
      />

      <Pressable style={styles.button} onPress={saveStore}>
        <Text style={styles.buttonText}>Guardar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#782726",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
