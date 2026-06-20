import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const PRIMARY = "#782726";

export default function EditPromo() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<"Percentagem" | "Fixo">(
    "Percentagem",
  );
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!isEdit) return;

    const loadPromo = async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        Alert.alert("Erro ao carregar promo");
        return;
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      setPrice(String(data.price || ""));
      setDiscount(String(data.discount || ""));
      setDiscountType(data.discount_type);
      setActive(data.active);
    };

    loadPromo();
  }, [id, isEdit]);

  const handleSave = async () => {
    const priceNumber = Number(price);
    const discountNumber = Number(discount);

    const calculateFinalPrice = (
      price: number,
      discount: number,
      type: "Percentagem" | "Fixo",
    ) => {
      let final = 0;

      if (type === "Percentagem") {
        const safe = Math.min(Math.max(discount, 0), 100);
        final = price - (price * safe) / 100;
      } else {
        final = price - Math.max(discount, 0);
      }

      return Math.max(final, 0);
    };

    if (!title || !priceNumber) {
      Alert.alert("Preencha os campos obrigatórios");
      return;
    }

    const finalPrice = calculateFinalPrice(
      priceNumber,
      discountNumber,
      discountType,
    );

    const payload = {
      title,
      description,
      price: priceNumber,
      discount: discountNumber,
      discount_type: discountType,
      final_price: finalPrice,
      active,
    };

    const { error } = isEdit
      ? await supabase.from("promotions").update(payload).eq("id", id)
      : await supabase.from("promotions").insert([payload]);

    if (error) {
      Alert.alert(
        "Erro",
        isEdit ? "Erro ao atualizar promoção" : "Erro ao criar promoção",
      );
      return;
    }

    router.back();
  };

  // preview cálculo (igual ao menu)
  const originalPrice = Number(price || 0);
  const discountValue = Math.max(Number(discount || 0), 0);

  let finalPrice = 0;

  if (discountType === "Percentagem") {
    const safePercentage = Math.min(discountValue, 100);
    finalPrice = originalPrice - (originalPrice * safePercentage) / 100;
  } else {
    finalPrice = originalPrice - discountValue;
  }

  finalPrice = Math.max(finalPrice, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isEdit ? "Editar Promoção" : "Criar Promoção"}
      </Text>

      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <TextInput
        placeholder="Preço original"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Desconto"
        value={discount}
        onChangeText={setDiscount}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.row}>
        <Pressable
          style={[
            styles.typeButton,
            discountType === "Percentagem" && styles.activeType,
          ]}
          onPress={() => setDiscountType("Percentagem")}
        >
          <Text>%</Text>
        </Pressable>

        <Pressable
          style={[
            styles.typeButton,
            discountType === "Fixo" && styles.activeType,
          ]}
          onPress={() => setDiscountType("Fixo")}
        >
          <Text>MT</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text>Ativa</Text>
        <Switch value={active} onValueChange={setActive} />
      </View>

      <View style={styles.previewBox}>
        <Text>Preço original: {originalPrice.toFixed(2)} MT</Text>
        <Text style={styles.finalPrice}>
          Agora pagas: {finalPrice.toFixed(2)} MT
        </Text>
      </View>

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>
          {isEdit ? "Guardar alterações" : "Criar promoção"}
        </Text>
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
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  typeButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },

  activeType: {
    backgroundColor: "#FFEAEA",
    borderColor: PRIMARY,
  },

  previewBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FFF8F8",
    borderRadius: 10,
  },

  finalPrice: {
    marginTop: 10,
    fontWeight: "800",
    color: PRIMARY,
    fontSize: 18,
  },

  button: {
    marginTop: 30,
    backgroundColor: PRIMARY,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
