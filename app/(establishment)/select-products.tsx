import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Product = {
  id: string;
  name: string;
  category: string;
};

export default function SelectProducts() {
  const params = useLocalSearchParams<{
    selectedProducts?: string;
    returnTo?: string;
    id?: string;
  }>();

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [sort, setSort] = useState<"A-Z" | "Z-A">("A-Z");
  const [showCategory, setShowCategory] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // ✅ MOCK (substituir por BD depois)
  const products: Product[] = [
    { id: "1", name: "Pizza", category: "Pizzas" },
    { id: "2", name: "Hambúrguer", category: "Burgers" },
    { id: "3", name: "Coca-Cola", category: "Bebidas" },
    { id: "4", name: "Sumo", category: "Bebidas" },
  ];

  // ✅ carregar selecionados iniciais
  useEffect(() => {
    if (!params.selectedProducts) return;

    try {
      const productsSelected = JSON.parse(
        params.selectedProducts as string,
      ) as Product[];

      setSelected(productsSelected.map((p) => p.id));
    } catch {
      setSelected([]);
    }
  }, [params.selectedProducts]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const categories = ["ALL", ...new Set(products.map((p) => p.category))];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category !== "ALL") {
      list = list.filter((p) => p.category === category);
    }

    list.sort((a, b) =>
      sort === "A-Z"
        ? (a.name ?? "").localeCompare(b.name ?? "")
        : (b.name ?? "").localeCompare(a.name ?? ""),
    );

    return list;
  }, [search, category, sort]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecionar Produtos</Text>

      {/* 🔍 Pesquisa */}
      <TextInput
        placeholder="Pesquisar..."
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      {/* 🔘 FILTROS */}
      <View style={styles.row}>
        <Pressable
          style={styles.mainBtn}
          onPress={() => {
            setShowCategory((prev) => !prev);
            setShowSort(false);
          }}
        >
          <Text style={styles.mainBtnText}>
            Filtros {category !== "ALL" ? `(${category})` : ""}
          </Text>
        </Pressable>

        <Pressable
          style={styles.mainBtn}
          onPress={() => {
            setShowSort((prev) => !prev);
            setShowCategory(false);
          }}
        >
          <Text style={styles.mainBtnText}>Ordenar ({sort})</Text>
        </Pressable>
      </View>

      {/* 📂 CATEGORIAS */}
      {showCategory && (
        <View style={styles.dropdown}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.dropdownItem,
                  category === item && styles.activeFilter,
                ]}
                onPress={() => {
                  setCategory(item);
                  setShowCategory(false);
                }}
              >
                <Text style={styles.filterText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* 🔤 ORDENAR */}
      {showSort && (
        <View style={styles.dropdown}>
          {["A-Z", "Z-A"].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.dropdownItem,
                sort === option && styles.activeFilter,
              ]}
              onPress={() => {
                setSort(option as "A-Z" | "Z-A");
                setShowSort(false);
              }}
            >
              <Text style={styles.filterText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* 📋 LISTA */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, selected.includes(item.id) && styles.selected]}
            onPress={() => toggle(item.id)}
          >
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </Pressable>
        )}
      />

      {/* ✅ FOOTER */}
      <View style={styles.footer}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>

        <Pressable
          style={styles.confirmBtn}
          onPress={() => {
            const selectedProducts = products.filter((p) =>
              selected.includes(p.id),
            );

            if (!params.returnTo) {
              router.back();
              return;
            }

            router.replace({
              pathname: params.returnTo as any,
              params: {
                id: params.id,
                selectedProducts: JSON.stringify(selectedProducts),
              },
            });
          }}
        >
          <Text style={styles.confirmText}>Confirmar ({selected.length})</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  mainBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
  },
  mainBtnText: {
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  activeFilter: {
    backgroundColor: "#22c55e",
  },
  filterText: {
    fontSize: 13,
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  text: {
    fontSize: 14,
  },
  category: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#782726",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
