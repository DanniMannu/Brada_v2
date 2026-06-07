import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

const PRIMARY = "#782726";

export default function RestaurantMenu() {
  const [tab, setTab] = useState<"menu" | "categories" | "products" | "promo">(
    "menu",
  );
  const [sortAZ, setSortAZ] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);
  /*
  const deleteProduct = async (id: string) => {
    try {
      const { data: images } = await supabase
        .from("product_images")
        .select("file_name")
        .eq("product_id", id);

      if (images && images.length > 0) {
        const files = images.map((img) => img.file_name);
        const { error: storageError } = await supabase.storage
          .from("products")
          .remove(files);

        if (storageError) {
          console.error("Erro ao apagar storage:", storageError);
        }
      }

      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        console.error("Erro ao apagar produto:", error);
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  };*/

  const loadData = async () => {
    try {
      const currentEstablishmentId = await getEstablishmentId();
      if (!currentEstablishmentId) {
        console.error("No establishment ID found in session");
        return;
      }

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("establishment_id", currentEstablishmentId);

      const { data: menusData } = await supabase
        .from("menus")
        .select(
          `
        *,
        menu_products (
          product_id
        )
      `,
        )
        .eq("establishment_id", currentEstablishmentId);

      const { data: promosData } = await supabase
        .from("promotions")
        .select("*")
        .eq("establishment_id", currentEstablishmentId);

      setProducts(productsData || []);
      setMenus(menusData || []);
      setPromos(promosData || []);
    } catch (err) {
      console.error("Erro geral no loadData:", err);
    }
  };

  const sortList = (list: any[]) =>
    [...list].sort((a, b) =>
      sortAZ ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );

  const togglePromo = async (id: string, value: boolean) => {
    try {
      setPromos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: !value } : p)),
      );

      const { error } = await supabase
        .from("promotions")
        .update({ active: !value })
        .eq("id", id);

      if (error) {
        setPromos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, active: value } : p)),
        );
      }
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const renderFilter = () => (
    <View style={styles.filterContainer}>
      <Pressable onPress={() => setShowFilter(!showFilter)}>
        <Text style={styles.filterText}>
          Ordenar: {sortAZ ? "A-Z" : "Z-A"} ▼
        </Text>
      </Pressable>

      {showFilter && (
        <View style={styles.dropdown}>
          <Pressable
            onPress={() => {
              setSortAZ(true);
              setShowFilter(false);
            }}
          >
            <Text style={styles.dropdownItem}>A-Z</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setSortAZ(false);
              setShowFilter(false);
            }}
          >
            <Text style={styles.dropdownItem}>Z-A</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ✅ TABS */}
      <View style={styles.tabs}>
        {[
          { key: "menu", label: "Menus" },
          { key: "categories", label: "Categorias" },
          { key: "products", label: "Produtos" },
          { key: "promo", label: "Promoções" },
        ].map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key as any)}>
            <Text style={[styles.tabText, tab === t.key && styles.activeTab]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ✅ MENUS */}
      {tab === "menu" && (
        <>
          {renderFilter()}
          <FlatList
            data={sortList(menus)}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.title}>{item.name}</Text>
                <Text>{item.menu_products.length} produtos</Text>

                <View style={styles.row}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(establishment)/editMenu",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Text style={styles.link}>Editar</Text>
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      await supabase.from("menus").delete().eq("id", item.id);
                      loadData();
                    }}
                  >
                    <Text style={styles.delete}>Remover</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </>
      )}

      {/* ✅ CATEGORIES */}
      {tab === "categories" && (
        <>
          {renderFilter()}
          <FlatList
            data={sortList(categories.map((c) => ({ name: c })))}
            keyExtractor={(i) => i.name}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.title}>{item.name}</Text>
                {products
                  .filter((p) => p.category === item.name)
                  .map((p) => (
                    <Text key={p.id}>• {p.name}</Text>
                  ))}
              </View>
            )}
          />
        </>
      )}

      {/* ✅ PRODUCTS */}
      {tab === "products" && (
        <>
          {renderFilter()}
          <FlatList
            data={sortList(products)}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.title}>{item.name}</Text>
                <Text>{item.price} MT</Text>

                <View style={styles.row}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(establishment)/editProduct",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Text style={styles.link}>Editar</Text>
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      await supabase
                        .from("products")
                        .delete()
                        .eq("id", item.id);
                      loadData();
                    }}
                  >
                    <Text style={styles.delete}>Remover</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </>
      )}

      {/* ✅ PROMOS */}
      {tab === "promo" && (
        <>
          {renderFilter()}
          <FlatList
            data={promos}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.rowBetween}>
                  <Text>{item.discount}%</Text>
                  <Switch
                    value={item.active}
                    onValueChange={() => togglePromo(item.id, item.active)}
                    trackColor={{ false: "#ccc", true: "#782726" }}
                    thumbColor={item.active ? "#ffffff" : "#f4f3f4"}
                  />

                  <View style={styles.row}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/(establishment)/editPromo",
                          params: { id: item.id },
                        })
                      }
                    >
                      <Text style={styles.link}>Editar</Text>
                    </Pressable>

                    <Pressable
                      onPress={async () => {
                        await supabase
                          .from("promotions")
                          .delete()
                          .eq("id", item.id);
                        loadData();
                      }}
                    >
                      <Text style={styles.delete}>Remover</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />
        </>
      )}

      {/* ✅ FAB DINÂMICO (esconde nas categorias) */}
      {["menu", "products", "promo"].includes(tab) && (
        <Pressable
          style={styles.fab}
          onPress={() => {
            switch (tab) {
              case "menu":
                router.push("/(establishment)/addMenu");
                break;
              case "products":
                router.push("/(establishment)/addProduct");
                break;
              case "promo":
                router.push("/(establishment)/addPromo");
                break;
            }
          }}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  tabs: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "space-between",
  },
  tabText: { fontSize: 16, color: "#777" },
  activeTab: {
    fontWeight: "800",
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    color: "#000",
  },
  filterContainer: { marginBottom: 10 },
  filterText: { color: PRIMARY, fontWeight: "600" },
  dropdown: {
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
  },
  dropdownItem: { paddingVertical: 6 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: { fontWeight: "700", fontSize: 16 },
  row: { flexDirection: "row", marginTop: 10, gap: 20 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  link: { color: PRIMARY },
  delete: { color: "red" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: { color: "#fff", fontSize: 24 },
});
