import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Logout() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      await AsyncStorage.multiRemove([
        "courier.availability",
        "courier.profile.v1",
      ]);

      // Futuro
      // await supabase.auth.signOut()

      router.replace("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.logoutBtn} onPress={() => setVisible(true)}>
        <Text style={styles.logoutTxt}>Terminar Sessão</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.icon}>⚠️</Text>

            <Text style={styles.title}>Terminar sessão</Text>

            <Text style={styles.description}>
              Tens a certeza que queres sair da tua conta?
            </Text>

            <View style={styles.buttons}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelTxt}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.confirmBtn}
                onPress={handleLogout}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmTxt}>Sair</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
  },

  logoutTxt: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  icon: {
    fontSize: 40,
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
    color: "#111827",
  },

  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },

  buttons: {
    flexDirection: "row",
    gap: 10,
  },

  cancelBtn: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  cancelTxt: {
    fontWeight: "600",
    color: "#111827",
  },

  confirmBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  confirmTxt: {
    color: "#fff",
    fontWeight: "700",
  },
});
