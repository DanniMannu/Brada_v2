import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SelectRoleScreen() {
  const { user, selectRole } = useAuth();

  const handleSelect = (role: string) => {
    selectRole(role as any);

    if (role === "client") router.replace("./(client)");
    if (role === "restaurant") router.replace("./(establishment)");
    if (role === "courier") router.replace("./(courier)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>Brada.</Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Escolhe o teu perfil</Text>

          <Text style={styles.subtitle}>
            Esta conta tem vários perfis disponíveis. Seleciona como queres
            entrar:
          </Text>

          {/* 🔘 Botões de roles */}
          {user?.roles?.map((role: string) => (
            <Button
              key={role}
              title={
                role === "client"
                  ? "Cliente"
                  : role === "restaurant"
                    ? "Restaurante"
                    : "Entregador"
              }
              variant="primary"
              onPress={() => handleSelect(role)}
              style={{ marginTop: 10 }}
            />
          ))}
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

    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1C1C1C",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    marginBottom: 10,
  },
});
