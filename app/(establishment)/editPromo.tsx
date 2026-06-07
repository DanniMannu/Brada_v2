import { router } from "expo-router";
import React, { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

const PRIMARY = "#782726";

export default function EditPromo() {
  const [title, setTitle] = useState("30% OFF");
  const [discount, setDiscount] = useState("30");
  const [active, setActive] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Promoção</Text>

      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <TextInput
        style={styles.input}
        value={discount}
        onChangeText={setDiscount}
      />

      <View style={styles.row}>
        <Text>Ativa</Text>
        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{ true: PRIMARY }}
        />
      </View>

      <Pressable style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnText}>Guardar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 420,
    alignSelf: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  label: {
    marginVertical: 10,
    fontWeight: "600",
  },

  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 8,
  },

  selected: {
    backgroundColor: "#f2dede",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  btn: {
    backgroundColor: "#782726",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
