import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Product = { id: string; name: string; price?: number | string | null; quantity?: number };

export default function AddMenu() {
  const params = useLocalSearchParams<{ selectedProducts?: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params.selectedProducts) return;
    const timer = setTimeout(() => {
      try { setSelectedProducts(JSON.parse(params.selectedProducts as string)); } catch { setSelectedProducts([]); }
    }, 0);
    return () => clearTimeout(timer);
  }, [params.selectedProducts]);

  const save = async () => {
    if (!name.trim() || !price.trim() || selectedProducts.length === 0) {
      Alert.alert("Validação", "Preenche o nome, o preço e seleciona pelo menos um produto.");
      return;
    }
    const establishmentId = await getEstablishmentId();
    if (!establishmentId) { Alert.alert("Sessão expirada", "Inicia sessão novamente."); return; }
    setSaving(true);
    try {
      const { data: menu, error } = await supabase.from("menus").insert({
        establishment_id: establishmentId,
        name: name.trim(), description: description.trim() || null,
        price: Number(price), active: true,
      }).select("id").single();
      if (error || !menu) throw error || new Error("menu");
      const { error: relationError } = await supabase.from("menu_products").insert(
        selectedProducts.map((product) => ({ menu_id: menu.id, product_id: product.id, quantity: product.quantity || 1 })),
      );
      if (relationError) { await supabase.from("menus").delete().eq("id", menu.id); throw relationError; }
      router.back();
    } catch { Alert.alert("Erro", "Não foi possível guardar o menu."); }
    finally { setSaving(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Menu</Text>
      <Text style={styles.subtitle}>Cria um conjunto de produtos para aparecer no teu catálogo.</Text>
      <TextInput placeholder="Nome do menu" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Descrição (opcional)" style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />
      <TextInput placeholder="Preço do menu" style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
      <Pressable style={styles.selectBtn} onPress={() => router.push({ pathname: "/(establishment)/(menu_management)/select-products", params: { returnTo: "/(establishment)/(menu_management)/addMenu", selectedProducts: JSON.stringify(selectedProducts) } })}>
        <Text style={styles.selectText}>Selecionar produtos ({selectedProducts.length})</Text>
      </Pressable>
      {selectedProducts.map((product) => <Text key={product.id} style={styles.productLine}>• {product.quantity || 1}× {product.name}</Text>)}
      <Pressable style={[styles.btn, saving && styles.disabled]} onPress={save} disabled={saving}><Text style={styles.btnText}>{saving ? "A guardar..." : "Guardar menu"}</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#F7F5F4" }, title: { fontSize: 26, fontWeight: "800", color: "#211919" }, subtitle: { color: "#756B6A", lineHeight: 20, marginTop: 6, marginBottom: 18 },
  input: { borderWidth: 1, borderColor: "#E3D9D8", backgroundColor: "#FFF", padding: 14, borderRadius: 10, marginBottom: 10, fontSize: 15 }, textArea: { height: 84, textAlignVertical: "top" }, selectBtn: { backgroundColor: "#F0E4E3", padding: 14, borderRadius: 10, marginTop: 4 }, selectText: { color: "#782726", fontWeight: "700" }, productLine: { color: "#4C4140", marginTop: 8 }, btn: { backgroundColor: "#782726", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 24 }, disabled: { opacity: 0.6 }, btnText: { color: "#FFF", fontWeight: "800" },
});
