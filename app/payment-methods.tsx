import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PaymentMethodsScreen() {
  const { user, updateUser } =
    useAuth();
  const availableMethods =
    user?.payment_methods || [
      "Dinheiro",
      "M-Pesa",
      "e-Mola",
      "mKesh",
    ];

  const [selectedMethod, setSelectedMethod] =
  useState(
    user?.selected_payment_method ??
    "Dinheiro"
  );

  const handleSave = async () => {
    try {
      await updateUser({
        selected_payment_method:
          selectedMethod,
      });

      Alert.alert(
        "Sucesso",
        "Método de pagamento atualizado"
      );

      router.back();
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível guardar"
      );
    }
  };

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={
        styles.container
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.logo}>
        Brada.
      </Text>

      <Text style={styles.title}>
        Método de Pagamento
      </Text>

      <InfoBox
        type="info"
        message="Seleciona o método de pagamento que pretendes utilizar por defeito."
      />

      {availableMethods.map(
        (method: string) => {
          const active =
            selectedMethod ===
            method;

          return (
            <Pressable
              key={method}
              style={[
                styles.card,
                active &&
                  styles.cardActive,
              ]}
              onPress={() =>
                setSelectedMethod(
                  method
                )
              }
            >
              <View
                style={styles.row}
              >
                <View
                  style={[
                    styles.radio,
                    active &&
                      styles.radioActive,
                  ]}
                >
                  {active && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )}
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.methodName
                    }
                  >
                    {method}
                  </Text>

                  <Text
                    style={
                      styles.methodDescription
                    }
                  >
                    {method ===
                    "Dinheiro"
                      ? "Pagamento na entrega"
                      : "Pagamento móvel"
                    }
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }
      )}

      <Button
        title="Guardar"
        variant="primary"
        onPress={handleSave}
        style={{
          marginTop: 20,
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  container: {
    padding: 20,
    paddingBottom: 50,
  },

  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: "#782726",
    marginBottom: 6,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1C1C1C",
    marginBottom: 16,
  },

  card: {
    backgroundColor:
      "#FFFFFF",

    borderWidth: 1,
    borderColor:
      "#E5E7EB",

    borderRadius: 14,

    padding: 18,

    marginTop: 12,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },

  cardActive: {
    borderWidth: 2,
    borderColor: "#782726",
    backgroundColor:
      "#FDF7F7",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  radioActive: {
    borderColor: "#782726",
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor:
      "#782726",
  },

  methodName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1C",
  },

  methodDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
});