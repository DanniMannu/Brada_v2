import BradaLogo from "@/components/branding/BradaLogo";
import { isStrongPassword } from "@/lib/password";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // 1. Verifica se já existe sessão (caso o Supabase já tenha tratado o link)
        const { data } = await supabase.auth.getSession();

        if (data.session && mounted) {
          setLoading(false);
          return;
        }

        // 2. Captura URL inicial (quando app abre via link)
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl) {
          console.log("Initial URL:", initialUrl);
        }

        // 3. Listener para links recebidos com app aberta
        const sub = Linking.addEventListener("url", ({ url }) => {
          console.log("URL recebida:", url);
          setLoading(false);
        });

        // fallback (evita loading infinito)
        setTimeout(() => {
          if (mounted) setLoading(false);
        }, 2000);

        return () => sub.remove();
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const submit = async () => {
    if (!isStrongPassword(password)) {
      Alert.alert(
        "Password fraca",
        "Use pelo menos 8 caracteres, uma letra maiúscula e um número.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert("Sucesso", "Password atualizada.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text>A validar link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <BradaLogo size="medium" />

        <View style={styles.card}>
          <Text style={styles.title}>Nova password</Text>

          <TextInput
            placeholder="Nova password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <Pressable
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={submit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
          >
            <Text style={styles.buttonText}>
              {submitting ? "A atualizar..." : "Atualizar password"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 14,
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#782726",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonDisabled: { opacity: 0.55 },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
