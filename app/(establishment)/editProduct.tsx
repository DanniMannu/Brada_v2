import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function EditProduct() {
  const { id } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const [images, setImages] = useState<any[]>([]); // imagens da BD

  const loadProduct = useCallback(async () => {
    // produto
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      setCategory(product.category);
    }

    // imagens
    const { data: imgs } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id);

    if (imgs) setImages(imgs);
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // ✅ adicionar imagem
  const pickImage = async () => {
    if (images.length >= 2) {
      Alert.alert("Máximo 2 imagens");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  // ✅ upload
  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `product-${Date.now()}.jpg`;

    await supabase.storage.from("products").upload(fileName, blob);

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    const { data: newImg } = await supabase
      .from("product_images")
      .insert({
        product_id: id,
        file_name: fileName,
        file_url: data.publicUrl,
      })
      .select()
      .single();

    setImages((prev) => [...prev, newImg]);
  };

  // ✅ remover imagem
  const removeImage = async (img: any) => {
    // storage
    await supabase.storage.from("products").remove([img.file_name]);

    // BD
    await supabase.from("product_images").delete().eq("id", img.id);

    setImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  // ✅ update produto
  const updateProduct = async () => {
    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price: Number(price),
        category,
      })
      .eq("id", id);

    if (error) {
      Alert.alert("Erro ao atualizar");
      return;
    }

    Alert.alert("Atualizado!");
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Produto</Text>

      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      {/* IMAGENS */}
      <View style={styles.imageRow}>
        {images.map((img) => (
          <Pressable key={img.id} onPress={() => removeImage(img)}>
            <Image source={{ uri: img.file_url }} style={styles.image} />
          </Pressable>
        ))}

        {images.length < 2 && (
          <Pressable style={styles.addImage} onPress={pickImage}>
            <Text>+</Text>
          </Pressable>
        )}
      </View>

      <Pressable style={styles.btn} onPress={updateProduct}>
        <Text style={styles.btnText}>Guardar</Text>
      </Pressable>
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
  },

  btn: {
    backgroundColor: "#782726",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: { color: "#fff" },
});
