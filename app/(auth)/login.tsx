import Button from "@/components/ui/Button";
import Links from "@/components/ui/Links";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [focused, setFocused] = useState<
    "email" | "password" | null
  >(null);

  const logoTranslateX =
    useSharedValue(-80);

  const logoOpacity =
    useSharedValue(0);

  useEffect(() => {
    logoTranslateX.value =
      withTiming(0, {
        duration: 900,
      });

    logoOpacity.value =
      withTiming(1, {
        duration: 900,
      });
  }, []);

  const logoStyle =
    useAnimatedStyle(() => ({
      opacity: logoOpacity.value,
      transform: [
        {
          translateX:
            logoTranslateX.value,
        },
      ],
    }));

  const handleLogin =
    async () => {
      if (
        !email.trim() ||
        !password.trim()
      ) {
        Alert.alert(
          "Erro",
          "Preenche todos os campos."
        );
        return;
      }

      const success =
        await login(
          email.trim(),
          password
        );

      if (!success) {
        Alert.alert(
          "Erro",
          "Email ou password inválidos."
        );
        return;
      }

      router.replace("/tabs/home");
    };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <Text
            style={
              styles.loadingText
            }
          >
            A carregar...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.Text
          style={[styles.logo, logoStyle]}
        >
          Brada.
        </Animated.Text>

        <View style={styles.card}>
          <Text style={styles.title}>
            Bem-vindo
          </Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() =>
              setFocused("email")
            }
            onBlur={() =>
              setFocused(null)
            }
            style={[
              styles.input,
              focused ===
                "email" &&
                styles.inputFocused,
            ]}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() =>
              setFocused(
                "password"
              )
            }
            onBlur={() =>
              setFocused(null)
            }
            style={[
              styles.input,
              focused ===
                "password" &&
                styles.inputFocused,
            ]}
          />

          <Button
            title="Entrar"
            variant="primary"
            onPress={handleLogin}
            style={{
              marginTop: 10,
            }}
          />

          <Links
            title="Recuperar password"
            onPress={() =>
              Alert.alert(
                "Brevemente",
                "Esta funcionalidade será implementada."
              )
            }
          />

          <Links
            title="Não tens conta? Registar"
            onPress={() =>
              router.push(
                "/register-client"
              )
            }
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#782726",
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
    backgroundColor: "#FFFFFF",
  },

  inputFocused: {
    borderColor: "#782726",
    borderWidth: 2,
  },
});