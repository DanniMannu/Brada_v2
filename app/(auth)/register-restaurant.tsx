import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import {
  agreementInfoMessage,
  licenseInfoMessage,
  paymentInfoMessage,
} from "@/constants/messages";
import { Picker } from "@react-native-picker/picker";
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

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type PaymentMethod = "mpesa" | "emola" | "mkesh" | "bank" | "";
type DeliveryType = "proprio" | "brada" | "ambos" | "";

export default function RegisterRestaurant() {
  const [step, setStep] = useState<Step>(1);

  /* ================= STEP 1 – ESTABELECIMENTO ================= */
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [stores, setStores] = useState("");

  /* ================= STEP 2 – DELIVERY ================= */
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("");
  const [coverage, setCoverage] = useState("");
  const [fee, setFee] = useState("");
  const [time, setTime] = useState("");

  /* ================= STEP 3 – PAYMENT ================= */
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankNib, setBankNib] = useState("");

  /* ================= STEP 4 – AGREEMENT ================= */
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [agreed, setAgreed] = useState(false);

  /* ================= STEP 5 – CONTACT ================= */
  const [menuDescription, setMenuDescription] = useState("");

  /* ================= STEP 6 – LICENSE ================= */
  const [license, setLicense] = useState<any>(null);

  const pickLicense = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
    });
    if (!result.canceled) setLicense(result.assets[0]);
  };

  const next = () => step < 7 && setStep((s) => (s + 1) as Step);
  const back = () => step > 1 && setStep((s) => (s - 1) as Step);

  const submit = () => {
    if (!license || !agreed) {
      Alert.alert(
        "Campos obrigatórios",
        "Deve carregar o alvará/licença e aceitar o acordo de parceria.",
      );
      return;
    }

    Alert.alert(
      "Candidatura submetida",
      "A candidatura do estabelecimento foi enviada para análise.",
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* LOGO SEMPRE VISÍVEL */}
      <View style={styles.header}>
        <Text style={styles.logo}>Brada.</Text>
        <Text style={styles.step}>Etapa {step} de 6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* ================= STEP 1 ================= */}
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
              <TextInput
                style={[styles.input, { height: 120 }]}
                placeholder="Descreva os produtos, categorias e preços iniciais"
                multiline
                value={menuDescription}
                onChangeText={setMenuDescription}
              />
            </>
          )}

          {/* ================= STEP 6 ================= */}
          {step === 6 && (
            <>
              <Text style={styles.title}>Licença / Alvará</Text>
              <InfoBox message={licenseInfoMessage} type="info" />
              <Button
                title={license ? "Licença carregada ✅" : "Carregar licença"}
                variant="outline"
                onPress={pickLicense}
                style={{ marginTop: 10 }}
              />
            </>
          )}

          {/* ================= NAVIGATION ================= */}
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
  agreement: { marginTop: 20 },

  container: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: "#FFF", padding: 20, borderRadius: 16 },

  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  paragraph: { fontSize: 13, color: "#444", marginBottom: 20 },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },

  picker: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#FAFAFA",
  },

  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },

  nav: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
