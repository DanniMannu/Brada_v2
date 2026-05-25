import Button from "@/components/ui/Button";
import Links from "@/components/ui/Links";
import { useAuth } from "@/context/AuthContext";
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

const MAX_ATTEMPTS = 3;
const BLOCK_MINUTES = 15;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  // =====================
  // LOGO ANIMATION
  // =====================
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

  // =====================
  // LOGIN HANDLER
  // =====================
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preenche todos os campos");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const now = new Date();

      // 🔍 verificar tentativas
      const { data: attempt } = await supabase
        .from("login_attempts")
        .select("*")
        .eq("email", email)
        .single();

      if (attempt?.blocked_until && new Date(attempt.blocked_until) > now) {
        Alert.alert(
          "Conta bloqueada",
          "Demasiadas tentativas. Tenta novamente mais tarde.",
        );
        setLoading(false);
        return;
      }

      // ✅ login real
      const roles = await login(email, password);

      if (!roles) {
        const attempts = (attempt?.attempt_count || 0) + 1;

        let blocked_until = null;
        if (attempts >= MAX_ATTEMPTS) {
          blocked_until = new Date(
            now.getTime() + BLOCK_MINUTES * 60 * 1000,
          ).toISOString();
        }

        await supabase.from("login_attempts").upsert({
          email,
          attempt_count: attempts,
          blocked_until,
        });

        Alert.alert("Erro", "Credenciais inválidas");
        setLoading(false);
        return;
      }

      // ✅ sucesso → reset tentativas
      await supabase.from("login_attempts").upsert({
        email,
        attempt_count: 0,
        blocked_until: null,
      });

      // ✅ routing por role
      if (roles.length === 1) {
        const role = roles[0];
        if (role === "client") router.replace("./(client)");
        if (role === "restaurant") router.replace("./(establishment)");
        if (role === "courier") router.replace("./(courier)");
      } else {
        router.push("./select_role");
      }
    } catch (err) {
      console.error("Erro login:", err);
      Alert.alert("Erro", "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // UI
  // =====================
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.Text style={[styles.logo, logoStyle]}>Brada.</Animated.Text>

        <View style={styles.card}>
          <Text style={styles.title}>Bem‑vindo</Text>

          <TextInput
            placeholder="Email"
            style={[styles.input, focused === "email" && styles.inputFocused]}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            style={[
              styles.input,
              focused === "password" && styles.inputFocused,
            ]}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
          />

          <Button
            title={loading ? "A entrar..." : "Entrar"}
            variant="primary"
            onPress={handleLogin}
            style={{ marginTop: 10 }}
            disabled={loading}
          />

          <Links
            title="Recuperar password"
            onPress={() => router.push("./forgot-password")}
          />

          <Links
            title="Não tens conta? Registar"
            onPress={() => router.push("./register")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// =====================
// STYLES
// =====================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  logo: {
    fontSize: 50,
    fontWeight: "900",
    color: "#782726",
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    paddingVertical: 22,
    paddingHorizontal: 26,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1C1C1C",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  inputFocused: {
    borderColor: "#782726",
  },
});
