import Button from "@/components/ui/Button";
import Links from "@/components/ui/Links";
import { setEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const logoTranslateX = useSharedValue(-80);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoTranslateX.value = withTiming(0, { duration: 900 });
    logoOpacity.value = withTiming(1, { duration: 900 });
  }, [logoTranslateX, logoOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateX: logoTranslateX.value }],
  }));

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert("Dados em falta", "Introduz o email e a password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error || !data.user) {
        Alert.alert("Não foi possível entrar", error?.message || "Tenta novamente.");
        return;
      }

      const { data: establishments, error: establishmentError } = await supabase
        .from("establishments")
        .select("id")
        .eq("user_id", data.user.id)
        .limit(1);
      if (establishmentError) {
        Alert.alert("Erro", "Não foi possível obter o estabelecimento associado.");
        return;
      }

      const establishment = establishments?.[0];
      if (!establishment) {
        await supabase.auth.signOut();
        Alert.alert("Conta sem estabelecimento", "Esta conta não tem um estabelecimento associado.");
        return;
      }

      await setEstablishmentId(establishment.id);
      router.replace("/(establishment)");
    } catch {
      Alert.alert("Erro inesperado", "Verifica a ligação à internet e tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.Text style={[styles.logo, logoStyle]}>Brada.</Animated.Text>
        <View style={styles.card}>
          <Text style={styles.title}>Bem-vindo</Text>
          <TextInput
            placeholder="Email"
            style={[styles.input, focused === "email" && styles.inputFocused]}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            editable={!loading}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            autoComplete="password"
            style={[styles.input, focused === "password" && styles.inputFocused]}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            onSubmitEditing={handleLogin}
            editable={!loading}
          />
          <Button title={loading ? "A entrar..." : "Entrar"} variant="primary" onPress={handleLogin} style={{ marginTop: 10 }} disabled={loading} />
          <Links title="Recuperar password" onPress={() => router.push("./forgot-password")} />
          <Links title="Não tens conta? Registar" onPress={() => router.push("./register")} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9F9F9" },
  container: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 70 },
  logo: { fontSize: 50, fontWeight: "900", color: "#782726", marginBottom: 10 },
  card: { width: "100%", maxWidth: 420, backgroundColor: "#FFFFFF", padding: 22, borderRadius: 14, marginTop: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#E5E5E5", borderRadius: 10, padding: 14, marginBottom: 12 },
  inputFocused: { borderColor: "#782726" },
});
