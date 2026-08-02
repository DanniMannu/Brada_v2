import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useState } from "react";

import DateTimePicker from "@react-native-community/datetimepicker";

import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput
} from "react-native";


export default function EditProfileScreen() {
  const {
  user,
  updateUser,
  uploadAvatar,
} = useAuth();

  const [name, setName] = useState(
    user?.full_name || ""
  );

  const [email, setEmail] = useState(
    user?.email || ""
  );

  const [phone, setPhone] = useState(
    user?.phone || ""
  );

  const [avatarUrl, setAvatarUrl] = useState(
  user?.avatar_url || ""
  );

  const [gender, setGender] = useState(
    user?.gender || ""
  );

  const [loading, setLoading] =
    useState(false);

  const [birthDate, setBirthDate] = useState(
  user?.birth_date
    ? new Date(user.birth_date)
    : new Date()
);

const [showDatePicker, setShowDatePicker] =
  useState(false);

const handleAvatar = async () => {
  const url = await uploadAvatar();

  if (url) {
    setAvatarUrl(url);
  }
};

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        Alert.alert(
          "Erro",
          "Introduz o teu nome."
        );
        return;
      }

      setLoading(true);

     await updateUser({
        full_name: name,
        email,
        phone,
        avatar_url: avatarUrl,
        gender,
        birth_date: birthDate
          .toISOString()
          .split("T")[0],
      });
      Alert.alert(
        "Sucesso",
        "Perfil atualizado com sucesso."
      );

      router.back();
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível atualizar o perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Editar Perfil
      </Text>

      <InfoBox
        type="info"
        message="Atualiza os teus dados pessoais."
      />

      <Pressable
              style={styles.avatar}
              onPress={handleAvatar}
          >
          {avatarUrl ? (
            <Image
              source={{
                uri: avatarUrl,
              }}
              style={styles.avatarImage}
            />
          ) : (
          <Text style={styles.avatarText}>
            {user?.full_name?.charAt(0) || "C"}
          </Text>
        )}
      </Pressable>

      <Text style={styles.label}>
        Nome
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Nome completo"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>
        Email
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>
        Telefone
      </Text>

      <TextInput
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="+258"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>
        Género
      </Text>

      <TextInput
        value={gender}
        onChangeText={setGender}
        style={styles.input}
        placeholder="Masculino / Feminino"
        placeholderTextColor="#9CA3AF"
      />

     <Text style={styles.label}>
  Data de nascimento
</Text>

{Platform.OS === "web" ? (
  <input
    type="date"
      value={
        birthDate instanceof Date && !isNaN(birthDate.getTime())
          ? birthDate.toISOString().split("T")[0]
          : ""
      }    onChange={(e) => {
        const value = e.target.value;

        if (value) {
          const [year, month, day] = value.split("-").map(Number);

          setBirthDate(new Date(year, month - 1, day));
        }
      }}
    style={{
      width: "100%",
      padding: 16,
      borderRadius: 14,
      border: "1px solid #E5E7EB",
      fontSize: 15,
      marginBottom: 12,
      boxSizing: "border-box",
    }}
  />
) : (
  <>
    <Pressable
      style={styles.input}
      onPress={() => setShowDatePicker(true)}
    >
      <Text>{birthDate.toLocaleDateString()}</Text>
    </Pressable>

    {showDatePicker && (
      <DateTimePicker
        value={birthDate}
        mode="date"
        maximumDate={new Date()}
        onChange={(_, date) => {
          setShowDatePicker(false);

          if (date) {
            setBirthDate(date);
          }
        }}
      />
    )}
  </>
)}

      <Button
        title={
          loading
            ? "A guardar..."
            : "Guardar alterações"
        }
        onPress={handleSave}
        variant="primary"
        style={{
          marginTop: 20,
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  container: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1C1C1C",
    marginBottom: 16,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#782726",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1C1C",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
});