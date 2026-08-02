import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Product = { id: string; name: string; category?: string | null; price?: number | null; quantity?: number };

export default function SelectProducts() {
  const params = useLocalSearchParams<{ selectedProducts?: string; returnTo?: string; id?: string }>();
  const [selected, setSelected] = useState<string[]>(() => {
    try { return params.selectedProducts ? (JSON.parse(params.selectedProducts) as Product[]).map((item) => item.id) : []; } catch { return []; }
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState<"A-Z" | "Z-A">("A-Z");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const establishmentId = await getEstablishmentId();
      if (!establishmentId) { setLoading(false); return; }
      const { data } = await supabase.from("products").select("id, name, category, price").eq("establishment_id", establishmentId).eq("active", true).order("name");
      if (mounted) { setProducts((data || []) as Product[]); setLoading(false); }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => ["ALL", ...Array.from(new Set(products.map((product) => product.category || "Sem categoria")))], [products]);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "ALL" || (product.category || "Sem categoria") === category;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => sort === "A-Z" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)), [products, search, category, sort]);

  const confirm = () => {
    if (!params.returnTo) { router.back(); return; }
    let previous: Product[] = [];
    try { previous = params.selectedProducts ? JSON.parse(params.selectedProducts) : []; } catch { previous = []; }
    const selectedProducts = products.filter((product) => selected.includes(product.id)).map((product) => ({ ...product, quantity: previous.find((item) => item.id === product.id)?.quantity || 1 }));
    router.replace({ pathname: params.returnTo as any, params: { id: params.id, selectedProducts: JSON.stringify(selectedProducts) } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecionar produtos</Text>
      <Text style={styles.subtitle}>{selected.length} selecionado(s). Toca num produto para selecionar ou remover.</Text>
      <TextInput placeholder="Pesquisar produto..." style={styles.input} value={search} onChangeText={setSearch} />
      <View style={styles.toolbar}><View style={styles.chips}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}><Text style={category === item ? styles.chipTextActive : styles.chipText}>{item}</Text></Pressable>)}</View><Pressable onPress={() => setSort(sort === "A-Z" ? "Z-A" : "A-Z")}><Text style={styles.sort}>Ordenar {sort}</Text></Pressable></View>
      {loading ? <ActivityIndicator color="#782726" style={styles.loader} /> : <FlatList data={filteredProducts} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Não existem produtos ativos.</Text>} renderItem={({ item }) => { const isSelected = selected.includes(item.id); return <Pressable onPress={() => setSelected((current) => isSelected ? current.filter((id) => id !== item.id) : [...current, item.id])} style={[styles.card, isSelected && styles.selected]}><View style={{ flex: 1 }}><Text style={styles.productName}>{item.name}</Text><Text style={styles.category}>{item.category || "Sem categoria"} · {Number(item.price || 0).toFixed(2)} MT</Text></View><Text style={styles.mark}>{isSelected ? "✓" : "＋"}</Text></Pressable>; }} />}
      <View style={styles.footer}><Pressable style={styles.cancel} onPress={() => router.back()}><Text>Cancelar</Text></Pressable><Pressable style={styles.confirm} onPress={confirm}><Text style={styles.confirmText}>Confirmar ({selected.length})</Text></Pressable></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#F7F5F4" }, title: { color: "#211919", fontSize: 25, fontWeight: "800" }, subtitle: { color: "#756B6A", marginTop: 5, marginBottom: 16 }, input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E3D9D8", borderRadius: 10, padding: 13 }, toolbar: { gap: 12, marginVertical: 14 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, chip: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E3D9D8", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16 }, chipActive: { backgroundColor: "#b47b7a", borderColor: "#b47b7a" }, chipText: { color: "#493C3B", fontSize: 12 }, chipTextActive: { color: "#FFF", fontWeight: "700", fontSize: 12 }, sort: { color: "#782726", fontWeight: "700" }, loader: { marginTop: 30 }, list: { paddingBottom: 10 }, card: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E8DEDD", borderRadius: 11, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center" }, selected: { backgroundColor: "#F9E5E4", borderColor: "#f2130f" }, productName: { color: "#261D1D", fontWeight: "700", fontSize: 15 }, category: { color: "#756B6A", fontSize: 12, marginTop: 3 }, mark: { color: "#f2130f", fontSize: 22, fontWeight: "800", marginLeft: 10 }, empty: { textAlign: "center", color: "#756B6A", marginTop: 32 }, footer: { flexDirection: "row", gap: 10, paddingTop: 12 }, cancel: { flex: 1, borderWidth: 1, borderColor: "#D6C9C8", borderRadius: 10, alignItems: "center", justifyContent: "center", padding: 14 }, confirm: { flex: 1, backgroundColor: "#782726", borderRadius: 10, alignItems: "center", padding: 14 }, confirmText: { color: "#FFF", fontWeight: "800" },
});
