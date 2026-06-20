import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ProductImage = {
  id: string;
  file_name: string;
  file_url: string;
};

export default function EditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [saving, setSaving] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!id) return;

    try {
      const [
        { data: productData, error: productError },
        { data: imageData, error: imageError },
      ] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        supabase.from("product_images").select("*").eq("product_id", id),
      ]);

      if (productError) {
        console.error(productError);
        Alert.alert("Erro", "Não foi possível carregar o produto.");
        return;
      }

      if (imageError) {
        console.error(imageError);
      }

      if (productData) {
        setProduct({
          name: productData.name ?? "",
          description: productData.description ?? "",
          price: String(productData.price ?? ""),
          category: productData.category ?? "",
        });
      }

      setImages(imageData ?? []);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Ocorreu um erro ao carregar os dados.");
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadProduct();
    }, [loadProduct]),
  );

  const pickImage = async () => {
    if (images.length >= 2) {
      Alert.alert("Limite atingido", "Máximo de 2 imagens por produto.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `product-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, blob);

      if (uploadError) {
        console.error(uploadError);
        Alert.alert("Erro", "Não foi possível carregar a imagem.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      const { data: newImage, error } = await supabase
        .from("product_images")
        .insert({
          product_id: id,
          file_name: fileName,
          file_url: publicUrlData.publicUrl,
        })
        .select()
        .single();

      if (error || !newImage) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível guardar a imagem.");
        return;
      }

      setImages((prev) => [...prev, newImage]);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao carregar a imagem.");
    }
  };

  const removeImage = (img: ProductImage) => {
    Alert.alert(
      "Remover imagem",
      "Tem a certeza que pretende remover esta imagem?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.storage.from("products").remove([img.file_name]);

              await supabase.from("product_images").delete().eq("id", img.id);

              setImages((prev) => prev.filter((image) => image.id !== img.id));
            } catch (error) {
              console.error(error);
              Alert.alert("Erro", "Não foi possível remover a imagem.");
            }
          },
        },
      ],
    );
  };

  const updateProduct = async () => {
    if (!id) return;

    if (!product.name.trim()) {
      Alert.alert("Validação", "Introduza o nome do produto.");
      return;
    }

    if (!product.price.trim()) {
      Alert.alert("Validação", "Introduza o preço.");
      return;
    }

    const price = Number(product.price.replace(",", "."));

    if (Number.isNaN(price) || price <= 0) {
      Alert.alert("Validação", "Introduza um preço válido.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("products")
        .update({
          name: product.name.trim(),
          description: product.description.trim(),
          category: product.category.trim(),
          price,
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível atualizar o produto.");
        return;
      }

      Alert.alert("Sucesso", "Produto atualizado com sucesso.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Editar Produto</Text>

      <TextInput
        style={styles.input}
        value={product.name}
        onChangeText={(text) => setProduct((prev) => ({ ...prev, name: text }))}
        placeholder="Nome"
      />

      <TextInput
        style={[styles.input, styles.multiline]}
        value={product.description}
        onChangeText={(text) =>
          setProduct((prev) => ({
            ...prev,
            description: text,
          }))
        }
        placeholder="Descrição"
        multiline
        numberOfLines={4}
      />

      <TextInput
        style={styles.input}
        value={product.price}
        onChangeText={(text) =>
          setProduct((prev) => ({ ...prev, price: text }))
        }
        keyboardType="decimal-pad"
        placeholder="Preço (€)"
      />

      <TextInput
        style={styles.input}
        value={product.category}
        onChangeText={(text) =>
          setProduct((prev) => ({
            ...prev,
            category: text,
          }))
        }
        placeholder="Categoria"
      />

      <Text style={styles.sectionTitle}>Imagens</Text>

      <View style={styles.imageRow}>
        {images.map((img) => (
          <Pressable key={img.id} onPress={() => removeImage(img)}>
            <Image source={{ uri: img.file_url }} style={styles.image} />
          </Pressable>
        ))}

        {images.length < 2 && (
          <Pressable style={styles.addImage} onPress={pickImage}>
            <Text style={styles.addImageText}>+</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.helperText}>Toque numa imagem para removê-la.</Text>

      <Pressable
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={updateProduct}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "A guardar..." : "Guardar"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#222",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  addImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#efefef",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  addImageText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#666",
  },

  helperText: {
    color: "#777",
    fontSize: 12,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#782726",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
