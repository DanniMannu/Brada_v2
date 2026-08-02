import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ManageAddressesScreen() {
  const { user, updateUser } = useAuth();

  const [label, setLabel] = useState("");
  const [address, setAddress] =
    useState("");

  const addresses =
    user?.addresses ?? [];

  const addAddress = async () => {
    try {
      if (!label.trim()) {
        Alert.alert(
          "Erro",
          "Introduz o nome da morada"
        );
        return;
      }

      if (!address.trim()) {
        Alert.alert(
          "Erro",
          "Introduz a morada"
        );
        return;
      }

      const newAddress = {
        id: Date.now().toString(),
        label,
        address,
      };

      await updateUser({
        addresses: [
          ...addresses,
          newAddress,
        ],
      });

      setLabel("");
      setAddress("");

      Alert.alert(
        "Sucesso",
        "Morada adicionada"
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível adicionar a morada"
      );
    }
  };

  const removeAddress = async (
    id: string
  ) => {
    try {
      const updatedAddresses =
        addresses.filter(
          (item: any) =>
            item.id !== id
        );

      await updateUser({
        addresses:
          updatedAddresses,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={
        styles.container
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <Text style={styles.title}>
        Moradas
      </Text>

      <InfoBox
        type="info"
        message="Adiciona e gere as tuas moradas de entrega."
      />

      {/* LISTA */}
      <Text style={styles.section}>
        As tuas moradas
      </Text>

      {addresses.length === 0 && (
        <View
          style={styles.emptyCard}
        >
          <Text
            style={styles.emptyText}
          >
            Ainda não tens
            moradas guardadas.
          </Text>
        </View>
      )}

      {addresses.map(
        (item: any) => (
          <View
            key={item.id}
            style={
              styles.addressCard
            }
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.addressLabel
                }
              >
                {item.label}
              </Text>

              <Text
                style={
                  styles.addressText
                }
              >
                {item.address}
              </Text>
            </View>

            <Pressable
              style={
                styles.removeButton
              }
              onPress={() =>
                removeAddress(
                  item.id
                )
              }
            >
              <Text
                style={
                  styles.removeText
                }
              >
                Remover
              </Text>
            </Pressable>
          </View>
        )
      )}

      {/* ADICIONAR */}
      <Text style={styles.section}>
        Nova morada
      </Text>

      <TextInput
        value={label}
        onChangeText={setLabel}
        style={styles.input}
        placeholder="Casa, Trabalho..."
        placeholderTextColor="#9CA3AF"
      />

      <TextInput
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        placeholder="Morada completa"
        placeholderTextColor="#9CA3AF"
      />

      <Button
        title="Adicionar Morada"
        variant="primary"
        onPress={addAddress}
        style={{
          marginTop: 10,
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

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1C1C1C",
    marginBottom: 16,
  },

  section: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1C",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
  },

  emptyText: {
    color: "#6B7280",
  },

  addressCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  addressLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1C1C",
    marginBottom: 4,
  },

  addressText: {
    color: "#6B7280",
  },

  removeButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  removeText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
});