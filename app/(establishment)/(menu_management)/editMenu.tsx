import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
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

        const products =
          data.menu_products?.map((item: any) => item.product) || [];

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Menu</Text>

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
          trackColor={{ true: PRIMARY }}
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
              <Text>{product.name}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.primaryBtn} onPress={saveMenu}>
        <Text style={styles.primaryBtnText}>Guardar</Text>
      </Pressable>

      <Pressable style={styles.deleteBtn} onPress={removeMenu}>
        <Text style={styles.deleteText}>Remover Menu</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },

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
    backgroundColor: "#f5dcdc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },

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
