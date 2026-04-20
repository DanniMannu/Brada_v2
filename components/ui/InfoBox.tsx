import React from "react";
import { StyleSheet, Text, View } from "react-native";

type InfoBoxProps = {
  message: string;
  type?: "info" | "warning" | "error";
};

export const InfoBox: React.FC<InfoBoxProps> = ({ message, type = "info" }) => {
  const variantStyle = stylesMap[type];

  return (
    <View style={[styles.container, variantStyle.container]}>
      <Text style={[styles.text, variantStyle.text]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});

const stylesMap = {
  info: StyleSheet.create({
    container: {
      backgroundColor: "#F8EDEE",
      borderLeftColor: "#782726",
    },
    text: {
      color: "#333",
    },
  }),

  warning: StyleSheet.create({
    container: {
      backgroundColor: "#FFF4E5",
      borderLeftColor: "#FFA500",
    },
    text: {
      color: "#663C00",
    },
  }),

  error: StyleSheet.create({
    container: {
      backgroundColor: "#FDECEA",
      borderLeftColor: "#D32F2F",
    },
    text: {
      color: "#611A15",
    },
  }),
};
