import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import React, { useState } from "react";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterClientScreen() {
  // Dados pessoais
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Contactos
  const [phone, setPhone] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [email, setEmail] = useState("");

  // Credenciais
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Termos
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Date picker handler
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setBirthDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (!name || !phone || !password || !confirmPassword) {
      alert("Preenche os campos obrigatórios");
      return;
    }

    if (password !== confirmPassword) {
      alert("As passwords não coincidem");
      return;
    }

    if (!acceptedTerms) {
      alert("Tens de aceitar os Termos e Condições");
      return;
    }

    // Aqui já tens:
    // phoneE164 → +258841234567 (pronto para backend)

    router.replace("/(auth)/register-client");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Criar conta de Cliente</Text>

        <InfoBox
          type="info"
          message="Preenche os teus dados para criares a tua conta."
        />

        {/* 1. Dados pessoais */}
        <Text style={styles.section}>Dados Pessoais</Text>

        <TextInput
          placeholder="Nome completo *"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* DATE PICKER FIX */}
        <Pressable
          onPress={() => setTimeout(() => setShowDatePicker(true), 50)}
          style={styles.dateBox}
        >
          <Text style={styles.dateText}>
            {birthDate
              ? birthDate.toLocaleDateString("pt-PT")
              : "Data de nascimento (opcional)"}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={birthDate ?? new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            maximumDate={new Date()}
            onChange={onChangeDate}
          />
        )}

        {/* 2. Contactos */}
        <Text style={styles.section}>Contactos</Text>

        <TextInput
          placeholder="84 123 4567"
          value={phone}
          onChangeText={(text) => {
            let cleaned = text.replace(/\D/g, "").slice(0, 9);

            const validPrefixes = ["82", "83", "84", "85", "86", "87"];
            if (
              cleaned.length >= 2 &&
              !validPrefixes.includes(cleaned.slice(0, 2))
            ) {
              setPhone(cleaned);
              return;
            }

            const formatted = new AsYouType("MZ").input(cleaned);
            setPhone(formatted);

            const parsed = parsePhoneNumberFromString("+258" + cleaned, "MZ");
            if (parsed?.isValid()) {
              setPhoneE164(parsed.number);
            }
          }}
          style={styles.input}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="Email (opcional)"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />

        {/* 3. Credenciais */}
        <Text style={styles.section}>Credenciais</Text>

        <TextInput
          placeholder="Password *"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          placeholder="Confirmar password *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
        />

        {/* 4. Termos */}
        <Pressable
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          style={styles.termsBox}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checked]} />
          <Text style={styles.termsText}>
            Aceito os Termos e Condições e a Política de Privacidade
          </Text>
        </Pressable>

        <Button
          title="Registar"
          variant="primary"
          onPress={handleSubmit}
          style={{ marginTop: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },

  section: {
    marginTop: 15,
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    fontSize: 14,
  },

  dateBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    justifyContent: "center",
  },

  dateText: {
    fontSize: 14,
    color: "#333",
  },

  termsBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    marginRight: 10,
    borderRadius: 4,
  },

  checked: {
    backgroundColor: "#B22222",
    borderColor: "#B22222",
  },

  termsText: {
    flex: 1,
    fontSize: 12,
    color: "#444",
  },
});