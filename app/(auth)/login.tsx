import Button from "@/components/ui/Button";
import Links from "@/components/ui/Links";
import { useAuth } from "@/context/AuthContext";
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

  const { login } = useAuth(); // ✅ usar AuthContext

  // Animação do logo
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
    if (!email || !password) {
      Alert.alert("Erro", "Preenche todos os campos");
      return;
    }

    const roles = login(email, password); // ✅ mock auth

    if (!roles) {
      Alert.alert("Erro", "Credenciais inválidas");
      return;
    }

    if (roles.length === 1) {
      const role = roles[0];

      if (role === "client") router.replace("./(client)");
      if (role === "restaurant") router.replace("./(establishment)/index");
      if (role === "courier") router.replace("./(courier)");
    } else {
      router.push("./select_role");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo animado */}
        <Animated.Text style={[styles.logo, logoStyle]}>Brada.</Animated.Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Bem-vindo</Text>

          <TextInput
            placeholder="Email"
            style={[styles.input, focused === "email" && styles.inputFocused]}
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
            title="Entrar"
            variant="primary"
            onPress={handleLogin}
            style={{ marginTop: 10 }}
          />

          <Links
            title="Recuperar password"
            onPress={() => router.push("./recover-password")}
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  container: {
    flex: 1,
    justifyContent: "flex-start",
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
    justifyContent: "flex-start",

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

  link: {
    marginTop: 25,
    paddingBottom: 5,
    textAlign: "center",
    fontWeight: "600",
    color: "#782726",
    fontSize: 14,
  },
});
