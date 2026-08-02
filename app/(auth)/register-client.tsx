import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useAuth } from "@/context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import {
  AsYouType,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import React, { useState } from "react";

import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterClientScreen() {
  const { register } = useAuth();

  // Dados pessoais
  const [name, setName] =
    useState("");

  const [
    birthDate,
    setBirthDate,
  ] = useState<Date | null>(
    null
  );

  const [
    showDatePicker,
    setShowDatePicker,
  ] = useState(false);

  // Contactos
  const [phone, setPhone] =
    useState("");

  const [
    phoneE164,
    setPhoneE164,
  ] = useState("");

  const [email, setEmail] =
    useState("");

  // Password
  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  // Termos
  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const onChangeDate = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleSubmit =
    async () => {
      try {
        setLoading(true);

        if (
          !name.trim() ||
          !email.trim() ||
          !phoneE164 ||
          !password ||
          !confirmPassword
        ) {
          Alert.alert(
            "Erro",
            "Preenche todos os campos obrigatórios."
          );

          return;
        }

        if (
          password !==
          confirmPassword
        ) {
          Alert.alert(
            "Erro",
            "As passwords não coincidem."
          );

          return;
        }

        if (
          password.length < 6
        ) {
          Alert.alert(
            "Erro",
            "A password deve ter pelo menos 6 caracteres."
          );

          return;
        }

        if (!acceptedTerms) {
          Alert.alert(
            "Erro",
            "Deves aceitar os Termos e Condições."
          );

          return;
        }

        console.log({
            name,
            email,
            phoneE164,
            password
        });

        const success =
          await register({
            name: name.trim(),
            email: email
              .trim()
              .toLowerCase(),
            password,
            phone: phoneE164,
            birthDate,
          });

        if (!success) {
          Alert.alert(
            "Erro",
            "Não foi possível criar a conta."
          );

          return;
        }

        Alert.alert(
          "Conta criada",
          "Bem-vindo à Brada!"
        );

        router.replace(
          "/tabs/home"
        );
      } catch (error) {
        console.log(error);

        Alert.alert(
          "Erro",
          "Ocorreu um erro inesperado."
        );
      } finally {
        setLoading(false);
      }
    };

  return (    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text style={styles.logo}>
          Brada.
        </Text>

        <Text style={styles.title}>
          Criar conta de Cliente
        </Text>

        <InfoBox
          type="info"
          message="Preenche os teus dados para criares a tua conta."
        />

        {/* Dados pessoais */}

        <Text style={styles.section}>
          Dados Pessoais
        </Text>

        <TextInput
          placeholder="Nome completo *"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        <Pressable
          style={styles.dateBox}
          onPress={() =>
            setShowDatePicker(true)
          }
        >
          <Text
            style={[
              styles.dateText,
              !birthDate && {
                color: "#9CA3AF",
              },
            ]}
          >
            {birthDate
              ? birthDate.toLocaleDateString(
                  "pt-PT"
                )
              : "Data de nascimento (opcional)"}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={
              birthDate ??
              new Date(
                2000,
                0,
                1
              )
            }
            mode="date"
            display={
              Platform.OS ===
              "ios"
                ? "spinner"
                : "calendar"
            }
            maximumDate={
              new Date()
            }
            onChange={
              onChangeDate
            }
          />
        )}

        {/* Contactos */}

        <Text style={styles.section}>
          Contactos
        </Text>

        <TextInput
          placeholder="84 123 4567"
          value={phone}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          onChangeText={(
            text
          ) => {
            let cleaned =
              text
                .replace(
                  /\D/g,
                  ""
                )
                .slice(0, 9);

            const validPrefixes =
              [
                "82",
                "83",
                "84",
                "85",
                "86",
                "87",
              ];

            if (
              cleaned.length >=
                2 &&
              !validPrefixes.includes(
                cleaned.slice(
                  0,
                  2
                )
              )
            ) {
              setPhone(
                cleaned
              );
              return;
            }

            const formatted =
              new AsYouType(
                "MZ"
              ).input(
                cleaned
              );

            setPhone(
              formatted
            );

            const parsed =
              parsePhoneNumberFromString(
                "+258" +
                  cleaned,
                "MZ"
              );

            if (
              parsed?.isValid()
            ) {
              setPhoneE164(
                parsed.number
              );
            }
          }}
        />

        <TextInput
          placeholder="Email *"
          value={email}
          onChangeText={
            setEmail
          }
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        {/* Password */}

        <Text style={styles.section}>
          Credenciais
        </Text>

        <TextInput
          placeholder="Password *"
          value={password}
          onChangeText={
            setPassword
          }
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        <TextInput
          placeholder="Confirmar password *"
          value={
            confirmPassword
          }
          onChangeText={
            setConfirmPassword
          }
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        {/* Termos */}

        <Pressable
          style={
            styles.termsBox
          }
          onPress={() =>
            setAcceptedTerms(
              !acceptedTerms
            )
          }
        >
          <View
            style={[
              styles.checkbox,
              acceptedTerms &&
                styles.checkboxActive,
            ]}
          />

          <Text
            style={
              styles.termsText
            }
          >
            Aceito os
            Termos e
            Condições e a
            Política de
            Privacidade
          </Text>
        </Pressable>

        <Button
          title={
            loading
              ? "A criar conta..."
              : "Criar conta"
          }
          variant="primary"
          onPress={
            handleSubmit
          }
          style={{
            marginTop: 20,
            marginBottom: 40,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor:
      "#F9F9F9",
  },

  container: {
    padding: 20,
    paddingBottom: 50,
  },

  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: "#782726",
    marginBottom: 6,
    letterSpacing: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1C1C1C",
    marginBottom: 16,
  },

  section: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1C1C",
  },

  input: {
    backgroundColor:
      "#FFFFFF",
    borderWidth: 1,
    borderColor:
      "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },

  dateBox: {
    backgroundColor:
      "#FFFFFF",
    borderWidth: 1,
    borderColor:
      "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  dateText: {
    fontSize: 15,
    color: "#1C1C1C",
  },

  termsBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor:
      "#782726",
    borderRadius: 6,
    marginRight: 10,
    backgroundColor:
      "#fff",
  },

  checkboxActive: {
    backgroundColor:
      "#782726",
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
});