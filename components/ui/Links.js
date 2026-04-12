import { Pressable, StyleSheet, Text } from "react-native";

export default function Links({ title, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={[styles.link]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 25,
    paddingBottom: 5,
    textAlign: "center",
    fontWeight: "600",
    color: "#782726",
    fontSize: 14,
  },
});
