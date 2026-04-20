//import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import Links from "@/components/ui/Links";
import { registerInfoMessage } from "@/constants/messages";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
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

  const [role, setRole] = useState("Cliente");

  const handleRegister = async () => {
    /*
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }

    const userId = data.user?.id;

    await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name: name,
    });

    await supabase.from("user_roles").insert({
      user_id: userId,
      role,
    }); DMC TESTE*/

    //Alert.alert("Sucesso", "Conta criada");
    router.replace(
      role === "Cliente"
        ? "./(client)"
        : role === "Restaurante"
          ? "/(auth)/register-restaurant"
          : "./(courier)",
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo animado */}
        <Animated.Text style={[styles.logo, logoStyle]}>Brada.</Animated.Text>

        <InfoBox message={registerInfoMessage} type="info" />

        {/* ROLES */}
        <View style={styles.roles}>
          <Text style={styles.roleTitle}>Tipo de conta:</Text>

          {["Cliente", "Restaurante", "Entregador"].map((r) => (
            <Pressable
              key={r}
              style={[styles.roleButton, role === r && styles.roleSelected]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleText, role === r && { color: "#fff" }]}>
                {r}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          title="Registar"
          variant="primary"
          onPress={handleRegister}
          style={{ marginTop: 10 }}
        />

        <Links
          title="Já tens conta? Entrar"
          onPress={() => router.push("./login")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 20 },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 13,
  },

  roles: { marginBottom: 20 },
  roleTitle: { marginBottom: 10, fontWeight: "600" },

  roleButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },

  roleSelected: {
    backgroundColor: "#B22222",
  },

  roleText: {
    textAlign: "center",
  },

  button: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontWeight: "700" },
  logo: {
    fontSize: 50,
    fontWeight: "900",
    color: "#782726",
    marginBottom: 10,
    letterSpacing: 1.2,
  },
});
