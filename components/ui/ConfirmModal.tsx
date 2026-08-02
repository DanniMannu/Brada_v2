import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    View,
} from "react-native";

import Button from "./Button";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.message}>
            {message}
          </Text>

          <Button
            title={confirmText}
            onPress={onConfirm}
            style={{
              marginTop: 25,
              backgroundColor: "#DC2626",
            }}
          />

          <Button
            title={cancelText}
            onPress={onCancel}
            style={{
              marginTop: 12,
              backgroundColor: "#6B7280",
            }}
          />

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  overlay:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"rgba(0,0,0,0.45)",
    padding:25,
  },

  container:{
    width:"100%",
    maxWidth:420,
    backgroundColor:"#FFF",
    borderRadius:20,
    padding:25,
  },

  title:{
    fontSize:22,
    fontWeight:"800",
    color:"#111827",
  },

  message:{
    marginTop:15,
    fontSize:16,
    color:"#6B7280",
    lineHeight:24,
  },

});