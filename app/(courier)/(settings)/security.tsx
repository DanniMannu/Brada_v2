import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/* ======================= Mocks p/ ligar ao Supabase futuramente ======================= */
async function changePasswordSupabase(current: string, next: string) {
  // TODO: trocar por supabase.auth.updateUser({ password: next }) após validar current no backend
  await new Promise((r) => setTimeout(r, 800));
  return { ok: true };
}

async function signOutSupabase() {
  // TODO: trocar por supabase.auth.signOut()
  await new Promise((r) => setTimeout(r, 500));
  return { ok: true };
}

async function deleteAccountSupabase(reason: string, details?: string) {
  // TODO: trocar por chamada RPC no backend que marca conta como removida e apaga dados necessários (GDPR)
  await new Promise((r) => setTimeout(r, 1000));
  return { ok: true };
}

/* ======================= Componentes ======================= */

export default function Security() {
  const [showPwd, setShowPwd] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <View style={styles.container}>
      {/* Itens (sem "Ativar localização") */}
      <Item label="Alterar palavra‑passe" onPress={() => setShowPwd(true)} />
      <Item label="Terminar sessão" onPress={() => setShowLogout(true)} />
      <Item label="Eliminar conta" onPress={() => setShowDelete(true)} />

      {/* MODAL: Alterar palavra‑passe */}
      <ChangePasswordModal
        visible={showPwd}
        onClose={() => setShowPwd(false)}
      />

      {/* MODAL: Terminar sessão */}
      <LogoutModal visible={showLogout} onClose={() => setShowLogout(false)} />

      {/* MODAL: Eliminar conta */}
      <DeleteAccountModal
        visible={showDelete}
        onClose={() => setShowDelete(false)}
      />
    </View>
  );
}

function Item({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );
}

/* ------------------- Modals ------------------- */

function ChangePasswordModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [saving, setSaving] = useState(false);

  const strong = (p: string) =>
    p.length >= 8 && /[A-Z]/.test(p) && /\d/.test(p);

  const canSave = current.trim().length > 0 && strong(next) && next === repeat;

  const submit = async () => {
    if (!canSave) {
      Alert.alert(
        "Validação",
        "Garante que a palavra‑passe tem 8+ caracteres, 1 número e 1 maiúscula, e que ambas coincidem.",
      );
      return;
    }
    try {
      setSaving(true);
      const { ok } = await changePasswordSupabase(current, next);
      if (ok) {
        Alert.alert("Sucesso", "A tua palavra‑passe foi atualizada.");
        onClose();
      } else {
        Alert.alert("Erro", "Não foi possível alterar a palavra‑passe.");
      }
    } finally {
      setSaving(false);
      setCurrent("");
      setNext("");
      setRepeat("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Alterar palavra‑passe</Text>
          <Text style={styles.modalHint}>
            A nova palavra‑passe deve ter pelo menos 8 caracteres, 1 número e 1
            letra maiúscula.
          </Text>

          <LabeledInput
            label="Palavra‑passe atual"
            secureTextEntry
            value={current}
            onChangeText={setCurrent}
          />
          <LabeledInput
            label="Nova palavra‑passe"
            secureTextEntry
            value={next}
            onChangeText={setNext}
          />
          <LabeledInput
            label="Repetir nova palavra‑passe"
            secureTextEntry
            value={repeat}
            onChangeText={setRepeat}
          />

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.ghostBtn}>
              <Text style={styles.ghostBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={submit}
              disabled={!canSave || saving}
              style={[
                styles.primaryBtn,
                (!canSave || saving) && styles.primaryBtnDisabled,
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {saving ? "A guardar..." : "Guardar"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function LogoutModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const handleNo = () => {
    onClose();
    router.replace("/(courier)/(settings)/index");
  };

  const handleYes = async () => {
    onClose();
    Alert.alert("Até breve!", "Esperamos ver‑te novamente 🫶");
    await signOutSupabase();
    router.replace("/(courier)/logout");
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Terminar sessão</Text>
          <Text style={styles.modalHint}>
            Queres terminar a sessão neste dispositivo?
          </Text>

          <View style={styles.modalActions}>
            <Pressable onPress={handleNo} style={styles.ghostBtn}>
              <Text style={styles.ghostBtnText}>Não</Text>
            </Pressable>
            <Pressable onPress={handleYes} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Sim</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DeleteAccountModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<string>("");
  const [other, setOther] = useState<string>("");
  const [confirming, setConfirming] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const options = [
    "Mudei para outra plataforma",
    "Questões de privacidade",
    "Problemas técnicos",
    "Outro",
  ];

  const handleDeletePress = () => {
    setConfirming(true);
  };

  const handleConfirmNo = () => {
    setConfirming(false);
    onClose();
    Alert.alert("Que bom!", "Ficamos felizes por continuares connosco ✨");
    router.replace("/(courier)/(settings)/index");
  };

  const handleConfirmYes = async () => {
    try {
      setSubmitting(true);
      const finalReason = reason === "Outro" ? `Outro: ${other}` : reason;
      await deleteAccountSupabase(finalReason || "—", other || undefined);
      onClose();
      Alert.alert(
        "Conta eliminada",
        "A tua conta foi removida. Obrigado por teres feito parte!",
      );
      router.replace("/(courier)/logout");
    } finally {
      setSubmitting(false);
      setConfirming(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Eliminar conta</Text>
          <Text style={styles.modalHint}>
            Que pena ver‑te partir. Podes dizer‑nos o motivo? Isso ajuda a
            melhorar.
          </Text>

          {/* Opções */}
          <View style={{ marginTop: 8 }}>
            {options.map((opt) => {
              const active = reason === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setReason(opt)}
                  style={[styles.choiceRow, active && styles.choiceRowActive]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      active && styles.choiceTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Campo livre quando "Outro" */}
          {reason === "Outro" && (
            <LabeledInput
              label="Conta‑nos mais (opcional)"
              value={other}
              onChangeText={setOther}
              placeholder="Escreve aqui..."
              multiline
            />
          )}

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.ghostBtn}>
              <Text style={styles.ghostBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleDeletePress} style={[styles.dangerBtn]}>
              <Text style={styles.dangerBtnText}>
                {submitting ? "A eliminar..." : "Eliminar conta"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Confirmação final */}
      <Modal visible={confirming} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Tens a certeza?</Text>
            <Text style={styles.modalHint}>
              Queres mesmo eliminar a tua conta? Esta ação é permanente.
            </Text>

            <View style={styles.modalActions}>
              <Pressable onPress={handleConfirmNo} style={styles.ghostBtn}>
                <Text style={styles.ghostBtnText}>Não</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmYes}
                style={[styles.dangerBtn]}
                disabled={submitting}
              >
                <Text style={styles.dangerBtnText}>
                  {submitting ? "A eliminar..." : "Sim, eliminar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

/* ------------------- UI auxiliares ------------------- */

function LabeledInput(
  props: {
    label: string;
    value: string | undefined;
    onChangeText: (t: string) => void;
  } & React.ComponentProps<typeof TextInput>,
) {
  const { label, ...rest } = props;
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        style={[styles.input, (rest as any).style]}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

/* ======================= Estilos ======================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FAFF", padding: 20 },
  item: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  itemText: { fontSize: 16, fontWeight: "600" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    width: "100%",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  modalHint: { color: "#6B7280", marginTop: 6, marginBottom: 8 },

  /* Inputs */
  label: { color: "#374151", fontWeight: "700", marginBottom: 6, marginTop: 6 },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    textAlignVertical: "top",
  },

  /* Choices */
  choiceRow: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  choiceRowActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD",
  },
  choiceText: { color: "#111827", fontWeight: "700" },
  choiceTextActive: { color: "#1D4ED8" },

  /* Buttons */
  modalActions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "800" },
  ghostBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  ghostBtnText: { color: "#111827", fontWeight: "700" },
  dangerBtn: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  dangerBtnText: { color: "#991B1B", fontWeight: "800" },
});
