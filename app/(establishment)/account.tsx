import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#782726";

export default function Account() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setEmail(data.user?.email || "");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conta</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>
      </View>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Terminar sessão</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 420,
    alignSelf: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  label: {
    color: "#777",
    marginBottom: 5,
  },

  value: {
    fontWeight: "600",
  },

  button: {
    backgroundColor: PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
