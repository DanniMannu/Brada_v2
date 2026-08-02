import BradaLogo from "@/components/branding/BradaLogo";
import Button from "@/components/ui/Button";
import Links from "@/components/ui/Links";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) {
      Alert.alert("Erro", "Introduz o teu email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "brada://reset-password",
      });

      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert("Email enviado", "Verifica o teu email para redefinir a password.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível enviar o email. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <BradaLogo size="medium" />

          <Text style={styles.title}>Recuperar password</Text>

          <Text style={styles.subtitle}>
            Introduz o email associado à tua conta.
          </Text>

          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Button
            title={loading ? "A enviar..." : "Enviar email"}
            onPress={submit}
            variant="primary"
            disabled={loading}
            style={{ marginTop: 10 }}
          />

          <Links
            title="Voltar ao Início de Sessão"
            onPress={() => router.back()}
          />
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
    paddingVertical: 24,
    paddingHorizontal: 26,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1C1C1C",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
});
