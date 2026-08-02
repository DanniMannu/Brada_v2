import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const PRIMARY = "#782726";

type Product = {
  id: string;
  name: string;
  category?: string;
  price?: number | null;
  quantity?: number;
};

export default function EditMenu() {
  const params = useLocalSearchParams();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [active, setActive] = useState(true);

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchMenu = async () => {
      try {
        console.log("MENU ID:", id);
        const { data, error } = await supabase
          .from("menus")
          .select(
            `
          *,
          menu_products(
            product:products(*)
          )
        `,
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error(error);
          return;
        }

        setName(data.name || "");
        setDescription(data.description || "");
        setPrice(data.price ? String(data.price) : "");
        setActive(data.active ?? true);

        const products = data.menu_products?.map((item: any) => ({
          ...item.product,
          quantity: Number(item.quantity || 1),
        })) || [];

        setSelectedProducts(products);
      } catch (err) {
        console.error(err);
      }
    };

    void fetchMenu();
  }, [id]);

  // ✅ Receber produtos vindos do SelectProducts
  useEffect(() => {
    if (!params.selectedProducts) {
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        const parsed = JSON.parse(params.selectedProducts as string);
        setSelectedProducts(parsed);
      } catch {
        setSelectedProducts([]);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [params.selectedProducts]);

  const openProductSelector = () => {
    router.push({
      pathname: "/(establishment)/(menu_management)/select-products",
      params: {
        returnTo: "/(establishment)/(menu_management)/editMenu",
        id,
        selectedProducts: JSON.stringify(selectedProducts),
      },
    });
  };

  const saveMenu = async () => {
    try {
      const { error } = await supabase
        .from("menus")
        .update({
          name,
          description,
          price: Number(price),
          active,
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        return;
      }

      await supabase.from("menu_products").delete().eq("menu_id", id);

      if (selectedProducts.length > 0) {
        const rows = selectedProducts.map((product) => ({
          menu_id: id,
          product_id: product.id,
          quantity: product.quantity || 1,
        }));

        const { error: relationError } = await supabase
          .from("menu_products")
          .insert(rows);

        if (relationError) {
          console.error(relationError);
        }
      }

      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  const removeMenu = async () => {
    try {
      await supabase.from("menu_products").delete().eq("menu_id", id);

      await supabase.from("menus").delete().eq("id", id);

      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  const changeQuantity = (productId: string, amount: number) => {
    setSelectedProducts((current) => current.map((product) => product.id === productId
      ? { ...product, quantity: Math.max(1, (product.quantity || 1) + amount) }
      : product));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Menu</Text>
      <Text style={styles.subtitle}>Atualiza os dados e os produtos que fazem parte deste menu.</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nome do menu"
      />

      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Descrição"
        multiline
      />

      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Preço"
        keyboardType="numeric"
      />

      <View style={styles.rowBetween}>
        <Text>Ativo</Text>

        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{ false: "#D6C9C8", true: "#f2130f" }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Pressable style={styles.selectBtn} onPress={openProductSelector}>
        <Text style={styles.selectText}>
          Selecionar Produtos ({selectedProducts.length})
        </Text>
      </Pressable>

      {selectedProducts.length > 0 && (
        <View style={styles.selectedList}>
          {selectedProducts.map((product) => (
            <View key={product.id} style={styles.selectedItem}>
              <View style={{ flex: 1 }}><Text style={styles.selectedName}>{product.name}</Text><Text style={styles.selectedPrice}>{Number(product.price || 0).toFixed(2)} MT</Text></View>
              <View style={styles.quantityControls}>
                <Pressable style={styles.quantityButton} onPress={() => changeQuantity(product.id, -1)}><Text>−</Text></Pressable>
                <Text style={styles.quantityValue}>{product.quantity || 1}</Text>
                <Pressable style={styles.quantityButton} onPress={() => changeQuantity(product.id, 1)}><Text>+</Text></Pressable>
                <Pressable onPress={() => setSelectedProducts((current) => current.filter((item) => item.id !== product.id))}><Text style={styles.removeProduct}>Remover</Text></Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.primaryBtn} onPress={saveMenu}>
        <Text style={styles.primaryBtnText}>Guardar</Text>
      </Pressable>

      <Pressable style={styles.deleteBtn} onPress={() => Alert.alert("Remover menu", "Esta ação não pode ser revertida.", [{ text: "Cancelar", style: "cancel" }, { text: "Remover", style: "destructive", onPress: removeMenu }])}>
        <Text style={styles.deleteText}>Remover Menu</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 48,
    flexGrow: 1,
    backgroundColor: "#F7F5F4",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  subtitle: { color: "#756B6A", marginBottom: 18, lineHeight: 20 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  selectBtn: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  selectText: {
    fontSize: 14,
    fontWeight: "600",
  },

  selectedList: {
    marginTop: 10,
  },

  selectedItem: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8D8D6",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  selectedName: { fontWeight: "700", color: "#261D1D" },
  selectedPrice: { color: "#756B6A", fontSize: 12, marginTop: 3 },
  quantityControls: { flexDirection: "row", alignItems: "center", gap: 7 },
  quantityButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F2E6E5", alignItems: "center", justifyContent: "center" },
  quantityValue: { minWidth: 16, textAlign: "center", fontWeight: "800" },
  removeProduct: { color: "#f2130f", fontSize: 12, fontWeight: "700", marginLeft: 5 },

  primaryBtn: {
    backgroundColor: PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  deleteBtn: {
    marginTop: 20,
    alignItems: "center",
  },

  deleteText: {
    color: "red",
    fontWeight: "700",
  },
});
