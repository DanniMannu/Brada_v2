import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function CreateStore() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  const createStore = async () => {
    if (!name || !address) {
      Alert.alert("Erro", "Nome e morada são obrigatórios.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Erro", "Utilizador não autenticado.");
        return;
      }

      const { data: establishment } = await supabase
        .from("establishments")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!establishment) {
        Alert.alert("Erro", "Estabelecimento não encontrado.");
        return;
      }

      const { error } = await supabase.from("stores").insert({
        establishment_id: establishment.id,
        name,
        address,
        contact: contact || null,
        is_active: true,
      });

      if (error) {
        console.log(error);
        Alert.alert("Erro", "Não foi possível criar a loja.");
        return;
      }

      Alert.alert("Sucesso", "Loja criada com sucesso.");

      router.replace("/(establishment)/(stores)/store-schedule/index");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Criar Loja</Text>

      <Text style={styles.label}>Nome *</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ex: Loja Centro Porto"
        style={styles.input}
      />

      <Text style={styles.label}>Morada *</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Rua / Avenida"
        style={styles.input}
      />

      <Text style={styles.label}>Contacto</Text>
      <TextInput
        value={contact}
        onChangeText={setContact}
        placeholder="Número de telefone"
        keyboardType="phone-pad"
        style={styles.input}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title={loading ? "A criar..." : "Criar Loja"}
          onPress={createStore}
          disabled={loading}
          variant="primary"
          style={{ marginTop: 10 }}
        />
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

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    color: "#111",
  },

  label: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "600",
    color: "#333",
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
});
