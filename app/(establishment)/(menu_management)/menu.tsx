import { getEstablishmentId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

const PRIMARY = "#782726";

type Promotion = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  discount: number | null;
  final_price: number | null;
  discount_type: "Fixo" | "Percentagem";
  active: boolean;
  promo_code?: string | null;
  promotions_products?: {
    product_id: string;
    products?: {
      id: string;
      name: string;
    } | null;
  }[];
};

export default function RestaurantMenu() {
  const [tab, setTab] = useState<"menu" | "categories" | "products" | "promo">(
    "menu",
  );
  const [sortAZ, setSortAZ] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const currentEstablishmentId = await getEstablishmentId();
        if (!currentEstablishmentId || !isMounted) return;

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
          .select(
            `
            *,
            promotions_products (
              product_id,
              products (
                id,
                name
              )
            )
          `,
          )
          .eq("establishment_id", currentEstablishmentId);

        if (isMounted) {
          setProducts(productsData || []);
          setMenus(menusData || []);
          setPromos(promosData || []);
        }
      } catch (err) {
        console.error("Erro geral no loadData:", err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortList = (list: any[]) =>
    [...list].sort((a, b) => {
      const aValue = (a.name || a.title || "").toString();
      const bValue = (b.name || b.title || "").toString();

      return sortAZ
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

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

      {/* MENUS */}
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
                        pathname: "/(establishment)/(menu_management)/editMenu",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Text style={styles.link}>Editar</Text>
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      await supabase.from("menus").delete().eq("id", item.id);
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

      {/* CATEGORIES */}
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

      {/* PRODUCTS */}
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
                        pathname:
                          "/(establishment)/(menu_management)/editProduct",
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

      {/* PROMOS */}

      {tab === "promo" && (
        <>
          {renderFilter()}
          <FlatList
            data={sortList(promos)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: Promotion }) => {
              const originalPrice = Number(item.price || 0);
              const discountRaw = Number(item.discount || 0);
              const finalPrice = Number(item.final_price || 0);

              //  garantir valores válidos
              const discount = Math.max(discountRaw, 0);

              //  poupança real
              const savings = originalPrice - finalPrice;

              const productNames =
                item.promotions_products
                  ?.map((p) => p.products?.name)
                  .filter(Boolean)
                  .join(" • ") || "";

              return (
                <View style={styles.promoCard}>
                  <View style={styles.promoHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.promoTitle}>{item.title}</Text>

                      {!!productNames && (
                        <Text style={styles.productsText}>{productNames}</Text>
                      )}
                    </View>

                    <Switch
                      value={item.active}
                      onValueChange={() => togglePromo(item.id, item.active)}
                      trackColor={{ false: "#ddd", true: PRIMARY }}
                      thumbColor="#fff"
                    />
                  </View>

                  <View style={styles.priceBox}>
                    <Text style={styles.originalPriceLabel}>Pagavas</Text>

                    <Text style={styles.originalPrice}>
                      {originalPrice.toFixed(2)} MT
                    </Text>

                    <Text style={styles.nowPriceLabel}>Agora pagas</Text>

                    <Text style={styles.nowPrice}>
                      {finalPrice.toFixed(2)} MT
                    </Text>

                    <Text style={styles.discountBadge}>
                      {item.discount_type === "Percentagem"
                        ? `${discount}% OFF`
                        : `-${discount.toFixed(2)} MT`}
                    </Text>

                    {savings > 0 && (
                      <Text style={styles.savings}>
                        Poupa {savings.toFixed(2)} MT
                      </Text>
                    )}
                  </View>

                  <View style={styles.promoDivider} />

                  {/*  EDITAR + REMOVER MANTIDOS */}
                  <View style={styles.row}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname:
                            "/(establishment)/(menu_management)/editPromo",
                          params: { id: item.id },
                        })
                      }
                    >
                      <Text style={styles.link}>Editar</Text>
                    </Pressable>

                    <Pressable
                      onPress={async () => {
                        router.push({
                          pathname:
                            "/(establishment)/(menu_management)/deletePromo",
                          params: { id: item.id },
                        });
                      }}
                    >
                      <Text style={styles.delete}>Remover</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />
        </>
      )}

      {["menu", "products", "promo"].includes(tab) && (
        <Pressable
          style={styles.fab}
          onPress={() => {
            switch (tab) {
              case "menu":
                router.push("/(establishment)/(menu_management)/addMenu");
                break;
              case "products":
                router.push("/(establishment)/(menu_management)/addProduct");
                break;
              case "promo":
                router.push("/(establishment)/(menu_management)/editPromo");
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

  promoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },

  promoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  promoTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  promoDescription: {
    marginTop: 12,
    color: "#666",
  },

  priceBox: {
    marginTop: 16,
    backgroundColor: "#FFF8F8",
    borderRadius: 12,
    padding: 14,
  },

  originalPriceLabel: {
    color: "#777",
    fontSize: 12,
  },

  originalPrice: {
    textDecorationLine: "line-through",
    fontWeight: "700",
  },

  nowPriceLabel: {
    marginTop: 8,
    color: "#777",
    fontSize: 12,
  },

  nowPrice: {
    fontWeight: "800",
    color: PRIMARY,
  },

  discountBadge: {
    marginTop: 6,
    color: PRIMARY,
    fontWeight: "700",
  },

  savings: {
    marginTop: 8,
    color: "#0F9D58",
    fontWeight: "700",
  },

  productsText: {
    marginTop: 6,
    color: PRIMARY,
    fontWeight: "600",
  },

  promoDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 14,
  },
});
