import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#782726";

export default function Settings() {
  const items = [
    {
      title: "Conta",
      description: "Dados do estabelecimento e contacto",
      icon: "person-outline",
      route: "/(establishment)/(settings)/account",
    },
    {
      title: "Horário de funcionamento",
      description: "Dias, horários e férias",
      icon: "time-outline",
      route: "/(establishment)/(stores)/store-schedule/[id]",
    },
    {
      title: "Documentos",
      description: "Contrato e termos de utilização",
      icon: "document-text-outline",
      route: "/(establishment)/(settings)/documents",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Definições</Text>

      <View style={styles.cardsContainer}>
        {items.map((item) => (
          <Pressable
            key={item.title}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.left}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={22} color={PRIMARY} />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#999" />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 25,
    color: "#111",
  },

  cardsContainer: {
    gap: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  cardPressed: {
    opacity: 0.8,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f3e8e8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  textContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  cardDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },
});
