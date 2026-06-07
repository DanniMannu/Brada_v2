import { Product } from "@/components/others/Product";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddPromo() {
  const params = useLocalSearchParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Receber produtos selecionados
  useEffect(() => {
    if (params.selectedProducts) {
      try {
        const products = JSON.parse(params.selectedProducts as string);

        setSelectedProducts(Array.isArray(products) ? products : []);
      } catch (error) {
        console.error(error);
        setSelectedProducts([]);
      }
    }
  }, [params.selectedProducts]);

  const save = () => {
    if (!name) {
      alert("Nome obrigatório");
      return;
    }

    if (selectedProducts.length < 2) {
      alert("Seleciona pelo menos 2 produtos");
      return;
    }

    if (!price) {
      alert("Define o preço");
      return;
    }

    console.log({
      name,
      description,
      price: Number(price),
      products: selectedProducts,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Promoção</Text>

      <TextInput
        placeholder="Titulo da promoção"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Descrição"
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* BOTÃO PARA SELECIONAR PRODUTOS */}
      <Pressable
        style={styles.selectBtn}
        onPress={() =>
          router.push({
            pathname: "/(establishment)/select-products",
            params: {
              returnTo: "/(establishment)/addMenu",
              selectedProducts: JSON.stringify(selectedProducts),
            },
          })
        }
      >
        <Text style={styles.selectText}>
          Selecionar Produtos ({selectedProducts.length})
        </Text>
      </Pressable>

      <TextInput
        placeholder="Preço (€)"
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Pressable style={styles.btn} onPress={save}>
        <Text style={styles.btnText}>Guardar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18, // ✅ mais pequeno
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14, // ✅ reduzido
  },
  textArea: {
    height: 70,
    textAlignVertical: "top",
  },
  selectBtn: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectText: {
    fontSize: 14,
    fontWeight: "500",
  },
  btn: {
    backgroundColor: "#782726",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
