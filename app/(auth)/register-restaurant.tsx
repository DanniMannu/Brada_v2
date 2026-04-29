import type { Menu } from "@/components/others/Menu";
import type { Product, ProductImage } from "@/components/others/Product";
import Button from "@/components/ui/Button";
import ButtonList from "@/components/ui/ButtonList";
import { InfoBox } from "@/components/ui/InfoBox";
import {
  agreementInfoMessage,
  paymentInfoMessage,
  termosInfoMessage,
} from "@/constants/messages";
import { Picker } from "@react-native-picker/picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#782726";

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type PaymentMethod = "mpesa" | "emola" | "mkesh" | "bank" | "";
type DeliveryType = "proprio" | "brada" | "ambos" | "";

/* ================= STEP 5 MODELS ================= */

export default function RegisterRestaurant() {
  const [step, setStep] = useState<Step>(1);

  /* ================= STEP 1 ================= */
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [stores, setStores] = useState("");

  /* ================= STEP 2 ================= */
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("");
  const [coverage, setCoverage] = useState("");
  const [fee, setFee] = useState("");
  const [time, setTime] = useState("");

  /* ================= STEP 3 ================= */
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankNib, setBankNib] = useState("");

  /* ================= STEP 4 ================= */
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [agreed, setAgreed] = useState(false);

  /* ================= STEP 5 – MENU ================= */
  const [products, setProducts] = useState<Product[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [creatingMenu, setCreatingMenu] = useState(false);

  // produto
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // menu
  const [menuName, setMenuName] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  const toggleProductInMenu = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const isProductUsedInMenus = (productId: string) => {
    return menus.some((menu) => menu.productIds.includes(productId));
  };

  const removeMenu = (id: string) =>
    setMenus((prev) => prev.filter((m) => m.id !== id));

  const saveMenu = () => {
    if (!menuName || !menuPrice || selectedProducts.length < 2) {
      Alert.alert(
        "Menu inválido",
        "O menu deve ter nome, preço e pelo menos 2 produtos.",
      );
      return;
    }

    if (editingMenuId) {
      // EDITAR MENU EXISTENTE
      setMenus((prev) =>
        prev.map((m) =>
          m.id === editingMenuId
            ? {
                ...m,
                name: menuName,
                description: menuDescription,
                price: menuPrice,
                productIds: selectedProducts,
              }
            : m,
        ),
      );
    } else {
      // ➕ CRIAR NOVO MENU
      setMenus((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: menuName,
          description: menuDescription,
          price: menuPrice,
          productIds: selectedProducts,
        },
      ]);
    }

    // limpar formulário
    setMenuName("");
    setMenuDescription("");
    setMenuPrice("");
    setSelectedProducts([]);
    setEditingMenuId(null);
    setCreatingMenu(false);
  };

  const editMenu = (menu: Menu) => {
    setEditingMenuId(menu.id);
    setMenuName(menu.name);
    setMenuDescription(menu.description);
    setMenuPrice(menu.price);
    setSelectedProducts(menu.productIds);
    setCreatingMenu(true); // abre o formulário
  };

  const pickProductImage = async () => {
    if (productImages.length >= 2) {
      Alert.alert(
        "Limite atingido",
        "Pode adicionar no máximo 2 imagens por produto.",
      );
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
    });

    if (!result.canceled) {
      setProductImages((prev) => [
        ...prev,
        {
          uri: result.assets[0].uri,
          name: result.assets[0].name,
        },
      ]);
    }
  };

  const editProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductCategory(product.category);
    setProductPrice(product.price);
    setProductImages(product.images);
  };

  const saveProduct = () => {
    if (!productName || !productCategory || !productPrice) {
      Alert.alert(
        "Campos obrigatórios",
        "Nome, categoria e preço são obrigatórios.",
      );
      return;
    }

    if (productImages.length === 0) {
      Alert.alert(
        "Imagem obrigatória",
        "O produto deve ter pelo menos uma imagem.",
      );
      return;
    }

    if (editingProductId) {
      // EDITAR PRODUTO EXISTENTE
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                name: productName,
                description: productDescription,
                category: productCategory,
                price: productPrice,
                images: productImages,
              }
            : p,
        ),
      );
    } else {
      // ➕ CRIAR NOVO PRODUTO
      setProducts((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: productName,
          description: productDescription,
          category: productCategory,
          price: productPrice,
          images: productImages,
        },
      ]);
    }

    // limpar formulário
    setProductName("");
    setProductDescription("");
    setProductCategory("");
    setProductPrice("");
    setProductImages([]);
    setEditingProductId(null);
  };

  const removeProduct = (productId: string) => {
    if (isProductUsedInMenus(productId)) {
      Alert.alert(
        "Não é possível remover o produto",
        "Este produto está associado a um ou mais menus. Remova-o primeiro dos menus para poder eliminá-lo.",
        [
          {
            text: "Entendi",
            style: "default",
          },
        ],
      );
      return; //bloqueia a ação
    }

    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  const removeProductImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= STEP 6 ================= */

  const [operatingLicense, setOperatingLicense] =
    useState<DocumentPickerAsset | null>(null);

  const [sanitaryLicense, setSanitaryLicense] =
    useState<DocumentPickerAsset | null>(null);

  const pickLicense = async (type: "operating" | "sanitary") => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
    });

    if (!result.canceled) {
      if (type === "operating") {
        setOperatingLicense(result.assets[0]);
      } else {
        setSanitaryLicense(result.assets[0]);
      }
    }
  };

  const next = () => step < 6 && setStep((s) => (s + 1) as Step);
  const back = () => step > 1 && setStep((s) => (s - 1) as Step);

  const submit = () => {
    if (!operatingLicense || !sanitaryLicense || !agreed) {
      Alert.alert(
        "Campos obrigatórios não preenchidos.",
        "Por favor, preencha todos os campos.",
      );
      return;
    }

    Alert.alert(
      "Candidatura submetida",
      "A candidatura foi enviada para análise.",
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>Brada.</Text>
        <Text style={styles.step}>Etapa {step} de 6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {step === 1 && (
            <>
              <Text style={styles.title}>Registo do Estabelecimento</Text>

              <TextInput
                style={styles.input}
                placeholder="Nome do estabelecimento"
                value={name}
                onChangeText={setName}
              />

              <View style={styles.picker}>
                <Picker selectedValue={type} onValueChange={setType}>
                  <Picker.Item label="Tipo de estabelecimento" value="" />
                  <Picker.Item label="Restaurante" value="restaurante" />
                  <Picker.Item label="Bottle Store" value="bottle" />
                  <Picker.Item label="Pastelaria" value="pastelaria" />
                  <Picker.Item label="Cafetaria" value="cafetaria" />
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Email do estabelecimento"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefone / Celular"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Localização / Morada completa"
                value={location}
                onChangeText={setLocation}
              />
              <TextInput
                style={styles.input}
                placeholder="Número de lojas"
                keyboardType="numeric"
                value={stores}
                onChangeText={setStores}
              />
            </>
          )}
          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <>
              <Text style={styles.title}>Plano de Entregas</Text>

              <View style={styles.picker}>
                <Picker
                  selectedValue={deliveryType}
                  onValueChange={setDeliveryType}
                >
                  <Picker.Item label="Tipo de entrega" value="" />
                  <Picker.Item label="Entrega própria" value="proprio" />
                  <Picker.Item label="Entrega via Brada" value="brada" />
                  <Picker.Item label="Entrega própria e Brada" value="ambos" />
                </Picker>
              </View>

              {(deliveryType === "proprio" || deliveryType === "ambos") && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Zona de cobertura"
                    value={coverage}
                    onChangeText={setCoverage}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Taxa de entrega"
                    keyboardType="numeric"
                    value={fee}
                    onChangeText={setFee}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tempo estimado de entrega"
                    value={time}
                    onChangeText={setTime}
                  />
                </>
              )}
            </>
          )}
          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <>
              <Text style={styles.title}>Dados de Pagamento</Text>
              <InfoBox message={paymentInfoMessage} type="info" />

              <View style={[styles.row, { marginTop: 16 }]}>
                {["mpesa", "emola", "mkesh", "bank"].map((m) => (
                  <Button
                    key={m}
                    title={m.toUpperCase()}
                    variant={paymentMethod === m ? "primary" : "outline"}
                    onPress={() => setPaymentMethod(m as PaymentMethod)}
                    style={{ marginTop: 10 }}
                  />
                ))}
              </View>

              <View style={{ marginTop: 18 }}>
                {(paymentMethod === "mpesa" ||
                  paymentMethod === "emola" ||
                  paymentMethod === "mkesh") && (
                  <TextInput
                    style={styles.input}
                    placeholder="Número de celular associado"
                    keyboardType="phone-pad"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                  />
                )}

                {paymentMethod === "bank" && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Nome do titular da conta"
                      value={bankName}
                      onChangeText={setBankName}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="NIB da conta bancária"
                      keyboardType="numeric"
                      value={bankNib}
                      onChangeText={setBankNib}
                    />
                  </>
                )}
              </View>
            </>
          )}
          {/* ================= STEP 4 ================= */}
          {step === 4 && (
            <>
              <Text style={styles.title}>Acordo de Parceria</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome completo do responsável"
                value={ownerName}
                onChangeText={setOwnerName}
              />

              <TextInput
                style={styles.input}
                placeholder="Contacto do responsável (celular ou email)"
                value={ownerEmail}
                onChangeText={setOwnerEmail}
              />

              <InfoBox message={agreementInfoMessage} type="info" />

              <ScrollView
                style={{
                  maxHeight: 120,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 10,
                  backgroundColor: "#fafafaf3",
                }}
                contentContainerStyle={{ paddingRight: 8 }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#444",
                  }}
                >
                  {termosInfoMessage}
                </Text>
              </ScrollView>

              <Pressable
                style={styles.agreement}
                onPress={() => setAgreed(!agreed)}
              >
                <Text style={{ fontSize: 16 }}>
                  {agreed ? "☑" : "☐"} Aceito o acordo de parceria
                </Text>
              </Pressable>
            </>
          )}
          {/* ================= STEP 5 ================= */}
          {step === 5 && (
            <>
              <Text style={styles.title}>Gestão de Menu</Text>
              <InfoBox
                message="Adicione produtos e crie menus a partir dos produtos existentes."
                type="info"
              />
              {/* PRODUTOS */}
              <Text style={{ fontWeight: "700", marginBottom: 8 }}>
                Produtos
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do produto"
                value={productName}
                onChangeText={setProductName}
              />
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Descrição"
                multiline
                value={productDescription}
                onChangeText={setProductDescription}
              />
              <TextInput
                style={styles.input}
                placeholder="Categoria"
                value={productCategory}
                onChangeText={setProductCategory}
              />
              <TextInput
                style={styles.input}
                placeholder="Preço"
                keyboardType="numeric"
                value={productPrice}
                onChangeText={setProductPrice}
              />
              <Text style={{ fontWeight: "600", marginTop: 8 }}>
                Imagens do produto (mín. 1 · máx. 2)
              </Text>
              <Button
                title="Adicionar imagem"
                variant="outline"
                onPress={pickProductImage}
                style={{ marginBottom: 1 }}
              />
              {productImages.map((img, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: "#444",
                    }}
                    numberOfLines={1}
                  >
                    {img.name}
                  </Text>

                  <ButtonList
                    title="Remover"
                    variant="danger"
                    onPress={() => removeProductImage(index)}
                    style={{ marginTop: 0 }}
                  />
                </View>
              ))}
              <Button
                title={
                  editingProductId ? "Guardar alterações" : "Adicionar produto"
                }
                variant="secondary"
                onPress={saveProduct}
                style={{ marginTop: 1 }}
              />

              {/* LISTA DE PRODUTOS */}
              {products.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  {/* INFO DO PRODUTO */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {p.name} · {p.price} MT
                    </Text>
                    <Text style={styles.productCategory}>
                      {p.description} · {p.category}
                    </Text>
                  </View>

                  {/* AÇÕES */}
                  <View style={styles.productActions}>
                    <ButtonList
                      title="Editar"
                      variant="outline"
                      onPress={() => editProduct(p)}
                      style={{ marginTop: 1 }}
                    />
                    <ButtonList
                      title="Remover"
                      variant="danger"
                      onPress={() => removeProduct(p.id)}
                      style={{ marginTop: 0 }}
                      disabled={isProductUsedInMenus(p.id)}
                    />
                  </View>
                </View>
              ))}
              {/* MENUS */}
              {products.length >= 2 && (
                <>
                  <View style={{ marginTop: 20 }}>
                    <Button
                      title={creatingMenu ? "Cancelar menu" : "Criar menu"}
                      variant="primary"
                      onPress={() => setCreatingMenu((prev) => !prev)}
                      style={{ marginBottom: 10 }}
                    />
                  </View>

                  {creatingMenu && (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Nome do menu"
                        value={menuName}
                        onChangeText={setMenuName}
                      />
                      <TextInput
                        style={[styles.input, { height: 70 }]}
                        placeholder="Descrição do menu"
                        multiline
                        value={menuDescription}
                        onChangeText={setMenuDescription}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Preço do menu"
                        keyboardType="numeric"
                        value={menuPrice}
                        onChangeText={setMenuPrice}
                      />

                      <Text style={{ fontWeight: "600", marginBottom: 6 }}>
                        Produtos do menu (mín. 2):
                      </Text>

                      {products.map((p) => (
                        <Button
                          key={p.id}
                          title={
                            selectedProducts.includes(p.id)
                              ? `✓ ${p.name}`
                              : p.name
                          }
                          variant={
                            selectedProducts.includes(p.id)
                              ? "selectItems"
                              : "outline"
                          }
                          onPress={() => toggleProductInMenu(p.id)}
                          style={{ marginTop: 10 }}
                        />
                      ))}

                      <Button
                        title={
                          editingMenuId ? "Guardar alterações" : "Criar menu"
                        }
                        onPress={saveMenu}
                        style={{ marginTop: 10 }}
                      />

                      {editingMenuId && (
                        <Button
                          title="Cancelar edição"
                          variant="outline"
                          onPress={() => {
                            setEditingMenuId(null);
                            setCreatingMenu(false);
                            setMenuName("");
                            setMenuDescription("");
                            setMenuPrice("");
                            setSelectedProducts([]);
                          }}
                          style={{ marginTop: 10 }}
                        />
                      )}
                    </>
                  )}

                  {/* LISTA DE MENUS */}
                  {menus.map((m) => (
                    <View key={m.id} style={{ marginTop: 12 }}>
                      <Button
                        title={
                          expandedMenuId === m.id
                            ? "▾ " + m.name
                            : "▸ " + m.name
                        }
                        variant="outline"
                        onPress={() =>
                          setExpandedMenuId(
                            expandedMenuId === m.id ? null : m.id,
                          )
                        }
                        style={{ marginTop: 10 }}
                      />

                      {expandedMenuId === m.id && (
                        <>
                          <Text>{m.description}</Text>
                          <Text>Preço: {m.price} MT</Text>

                          {m.productIds.map((pid) => {
                            const prod = products.find((p) => p.id === pid);
                            return prod ? (
                              <Text key={pid}>• {prod.name}</Text>
                            ) : null;
                          })}

                          <View style={{ flexDirection: "row", gap: 8 }}>
                            <Button
                              title="Editar"
                              variant="outline"
                              onPress={() => editMenu(m)}
                              style={{ paddingTop: 10 }}
                            />
                            <Button
                              title="Remover"
                              variant="danger"
                              onPress={() => removeMenu(m.id)}
                              style={{ paddingTop: 10 }}
                            />
                          </View>
                        </>
                      )}
                    </View>
                  ))}
                </>
              )}
            </>
          )}
          {/* ================= STEP 6 ================= */}
          {step === 6 && (
            <>
              <Text style={styles.title}>Licenças Obrigatórias</Text>

              <InfoBox
                message="Para concluir o registo é obrigatório carregar a licença de funcionamento e a licença sanitária."
                type="info"
              />

              <Button
                title={
                  sanitaryLicense
                    ? "Licença sanitária carregada"
                    : "Carregar licença sanitária"
                }
                variant="outline"
                onPress={() => pickLicense("sanitary")}
                style={{ marginTop: 10 }}
              />

              <Button
                title={
                  operatingLicense
                    ? "Licença de funcionamento carregada"
                    : "Carregar licença de funcionamento"
                }
                variant="outline"
                onPress={() => pickLicense("operating")}
                style={{ marginTop: 10 }}
              />
            </>
          )}

          <View style={styles.nav}>
            {step > 1 && (
              <Button
                title="Voltar"
                variant="outline"
                onPress={back}
                style={{ marginTop: 10 }}
              />
            )}
            {step < 6 ? (
              <Button
                title="Continuar"
                onPress={next}
                style={{ marginTop: 10 }}
              />
            ) : (
              <Button
                title="Submeter candidatura"
                onPress={submit}
                style={{ marginTop: 10 }}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9F9F9" },
  header: { padding: 20, alignItems: "center" },
  logo: { fontSize: 44, fontWeight: "900", color: PRIMARY },
  step: { marginTop: 4, color: "#666" },

  container: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: "#FFF", padding: 20, borderRadius: 16 },

  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },

  productCard: {
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },

  nav: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  agreement: {
    marginTop: 20,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 10,
  },

  picker: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#FAFAFA",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  productInfo: {
    flex: 1,
    paddingRight: 10,
  },

  productName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111",
  },

  productCategory: {
    fontSize: 13,
    color: "#666",
  },

  productActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 10,
  },
});
