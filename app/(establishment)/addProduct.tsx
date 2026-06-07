import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // ✅ escolher imagens
  const pickImage = async () => {
    if (images.length >= 2) {
      Alert.alert("Máximo 2 imagens");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  // ✅ upload imagem
  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `product-${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, blob);

    if (error) {
      console.error(error);
      return null;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    return { fileName, url: data.publicUrl };
  };

  // ✅ guardar
  const saveProduct = async () => {
    if (!name || !price || !category) {
      Alert.alert("Preenche os campos obrigatórios");
      return;
    }

    try {
      const establishment_id = await getEstablishmentId();

      // 1. criar produto
      const { data: product, error } = await supabase
        .from("products")
        .insert({
          name,
          description,
          price: Number(price),
          category,
          establishment_id,
        })
        .select()
        .single();

      if (error || !product) {
        console.error(error);
        Alert.alert("Erro ao criar produto");
        return;
      }

      // 2. upload imagens
      for (const img of images) {
        const uploaded = await uploadImage(img);

        if (uploaded) {
          await supabase.from("product_images").insert({
            product_id: product.id,
            file_name: uploaded.fileName,
            file_url: uploaded.url,
          });
        }
      }

      Alert.alert("Produto criado!");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro inesperado");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Produto</Text>

      <TextInput
        placeholder="Nome"
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

      <TextInput
        placeholder="Preço (€)"
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Categoria"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      {/* IMAGENS */}
      <View style={styles.imageRow}>
        {images.map((img, i) => (
          <Image key={i} source={{ uri: img }} style={styles.image} />
        ))}

        {images.length < 2 && (
          <Pressable style={styles.addImage} onPress={pickImage}>
            <Text>+</Text>
          </Pressable>
        )}
      </View>

      {/* BOTÕES */}
      <View style={styles.row}>
        <Pressable style={styles.cancel} onPress={() => router.back()}>
          <Text>Cancelar</Text>
        </Pressable>

        <Pressable style={styles.btn} onPress={saveProduct}>
          <Text style={styles.btnText}>Guardar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
  },

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  imageRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  addImage: {
    width: 80,
    height: 80,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  row: { flexDirection: "row", gap: 10 },

  cancel: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
  },

  btn: {
    flex: 1,
    backgroundColor: "#782726",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: { color: "#fff" },
});
