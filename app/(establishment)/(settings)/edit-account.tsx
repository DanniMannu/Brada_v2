import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const PRIMARY = "#782726";

export default function EditAccount() {
  const [loading, setLoading] = useState(true);

  const [establishmentId, setEstablishmentId] = useState("");

  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [nuit, setNuit] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.back();
          return;
        }

        const { data, error } = await supabase
          .from("establishments")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error(error);
          Alert.alert("Erro", "Não foi possível carregar os dados");
          return;
        }

        setEstablishmentId(data.id);

        setName(data.name || "");
        setOwnerName(data.owner_name || "");
        setContact(data.contact || "");
        setAddress(data.address || "");
        setNuit(data.nuit ? String(data.nuit) : "");
      } catch (err) {
        console.error(err);
        Alert.alert("Erro", "Não foi possível carregar os dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Introduza o nome do estabelecimento");
      return;
    }

    try {
      const { error } = await supabase
        .from("establishments")
        .update({
          name,
          owner_name: ownerName,
          contact,
          address,
          nuit: nuit ? Number(nuit) : null,
        })
        .eq("id", establishmentId);

      if (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível guardar");
        return;
      }

      Alert.alert("Sucesso", "Dados atualizados com sucesso");

      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Ocorreu um erro inesperado");
    }
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
      <Text style={styles.title}>Editar Conta</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Estabelecimento</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do estabelecimento"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Nome do proprietário"
          value={ownerName}
          onChangeText={setOwnerName}
        />

        <TextInput
          style={styles.input}
          placeholder="Contacto"
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Morada"
          value={address}
          onChangeText={setAddress}
        />

        <TextInput
          style={styles.input}
          placeholder="NUIT"
          value={nuit}
          onChangeText={setNuit}
          keyboardType="numeric"
        />
      </View>

      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>Guardar Alterações</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  saveBtn: {
    backgroundColor: PRIMARY,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
