import { Pressable, StyleSheet, Text } from "react-native";
import { variants } from "./Variants";

export default function ButtonList({
  title,
  onPress,
  variant = "primary",
  style,
  disabled = false,
}) {
  const v = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: v.backgroundColor,
          borderColor: v.borderColor,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: v.textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
});
