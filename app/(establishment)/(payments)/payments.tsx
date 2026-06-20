import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const PRIMARY = "#782726";

export default function FinanceScreen() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [form, setForm] = useState({
    account_name: "",
    account_number: "",
  });

  const [initialForm, setInitialForm] = useState(form);

  const [invoices, setInvoices] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: est } = await supabase
        .from("establishments")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!est) return;

      setEstablishmentId(est.id);

      // ✅ payment_settings
      const { data: payment } = await supabase
        .from("payment_settings")
        .select("method, account_name, account_number")
        .eq("establishment_id", est.id)
        .maybeSingle();

      const newForm = {
        account_name: payment?.account_name ?? "",
        account_number: payment?.account_number ?? "",
      };

      setPaymentMethod(payment?.method ?? "");
      setForm(newForm);
      setInitialForm(newForm);

      // ✅ invoices
      const { data: inv } = await supabase
        .from("invoices")
        .select("id, file_url, created_at")
        .eq("establishment_id", est.id)
        .order("created_at", { ascending: false });

      setInvoices(inv ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      await loadData();
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!establishmentId) return;

    const { error } = await supabase
      .from("payment_settings")
      .update({
        account_name: form.account_name,
        account_number: form.account_number,
      })
      .eq("establishment_id", establishmentId);

    if (error) {
      console.error(error);
      Alert.alert("Erro ao atualizar");
      return;
    }

    setInitialForm(form);
    setEditing(false);
    Alert.alert("Guardado com sucesso");
  };

  const cancelEdit = () => {
    setForm(initialForm);
    setEditing(false);
  };

  const openFile = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert("Erro ao abrir ficheiro"));
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
      {/* PAGAMENTO */}
      <Text style={styles.title}>Pagamento</Text>

      {/* ✅ método só leitura */}
      <Text style={styles.label}>Método de Pagamento</Text>
      <View style={styles.readonlyBox}>
        <Text>{paymentMethod || "Não definido"}</Text>
      </View>

      <Text style={styles.label}>Nome do Titular</Text>
      <TextInput
        style={styles.input}
        editable={editing}
        value={form.account_name}
        onChangeText={(t) => setForm({ ...form, account_name: t })}
      />

      <Text style={styles.label}>Número do Celular</Text>
      <TextInput
        style={styles.input}
        editable={editing}
        value={form.account_number}
        onChangeText={(t) => setForm({ ...form, account_number: t })}
        keyboardType="phone-pad"
      />

      {!editing ? (
        <Pressable style={styles.button} onPress={() => setEditing(true)}>
          <Text style={styles.btnText}>Editar</Text>
        </Pressable>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.cancel} onPress={cancelEdit}>
            <Text>Cancelar</Text>
          </Pressable>
          <Pressable style={styles.save} onPress={handleSave}>
            <Text style={{ color: "#fff" }}>Guardar</Text>
          </Pressable>
        </View>
      )}

      {/* FATURAS */}
      <Text style={[styles.title, { marginTop: 30 }]}>Faturas</Text>

      {invoices.length === 0 && <Text>Sem faturas</Text>}

      {invoices.map((i) => (
        <Pressable
          key={i.id}
          style={styles.card}
          onPress={() => openFile(i.file_url)}
        >
          <Text>{new Date(i.created_at).toLocaleDateString()}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },

  label: { marginTop: 10, marginBottom: 5, fontWeight: "600" },

  input: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  readonlyBox: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
  },

  button: {
    backgroundColor: PRIMARY,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },

  btnText: { color: "#fff" },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  cancel: {
    flex: 1,
    backgroundColor: "#ddd",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },

  save: {
    flex: 1,
    backgroundColor: PRIMARY,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
});
