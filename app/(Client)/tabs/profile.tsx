import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const addresses = user?.addresses || [];

 const selectedPaymentMethod =
  user?.selected_payment_method ||
  "Dinheiro";

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={
        styles.container
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.logo}>
        Brada.
      </Text>

      <Text style={styles.title}>
        Minha Conta
      </Text>

      <InfoBox
        type="info"
        message="Gere os teus dados pessoais, moradas e métodos de pagamento."
      />

      {/* PERFIL */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.avatarImage}

              
            />
          ) : (
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0)?.toUpperCase() || "C"}
            </Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {user?.full_name || "Cliente"}
          </Text>

          <Text style={styles.email}>
            {user?.email || "Sem email"}
          </Text>

          <Text style={styles.phone}>
            {user?.phone || "+258"}
          </Text>
        </View>
        
      </View>                
          
      <Button
        title="Editar Perfil"
        variant="primary"
        onPress={() =>
          router.push(
            "/edit-profile"
          )
        }
        style={{
          marginBottom: 20,
        }}
      />

      {/* MORADAS */}
      <View
        style={styles.sectionHeader}
      >
        <Text
          style={styles.sectionTitle}
        >
          Moradas
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              "/manage-addresses"
            )
          }
        >
          <Text
            style={styles.link}
          >
            Gerir
          </Text>
        </Pressable>
      </View>

      {addresses.length > 0 ? (
        addresses
          .slice(0, 3)
          .map(
            (
              item: any,
              index: number
            ) => (
              <Pressable
                key={
                  item.id ||
                  index
                }
                style={
                  styles.card
                }
                onPress={() =>
                  router.push(
                    "/manage-addresses"
                  )
                }
              >
                <View>
                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    {item.label ||
                      "Morada"}
                  </Text>

                  <Text
                    style={
                      styles.cardSubtitle
                    }
                  >
                    {item.address}
                  </Text>
                </View>

                <Text
                  style={
                    styles.arrow
                  }
                >
                  ›
                </Text>
              </Pressable>
            )
          )
      ) : (
        <Pressable
          style={styles.emptyCard}
          onPress={() =>
            router.push(
              "/manage-addresses"
            )
          }
        >
          <Text
            style={
              styles.emptyText
            }
          >
            Nenhuma morada adicionada
          </Text>
        </Pressable>
      )}

      {/* MÉTODO DE PAGAMENTO */}
      <View
        style={styles.sectionHeader}
      >
        <Text
          style={styles.sectionTitle}
        >
          Método de Pagamento
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              "/payment-methods"
            )
          }
        >
          <Text
            style={styles.link}
          >
            Gerir
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.card}
        onPress={() =>
          router.push(
            "/payment-methods"
          )
        }
      >
        <View>
          <Text
            style={
              styles.cardTitle
            }
          >
            {
              selectedPaymentMethod
            }
          </Text>

          <Text
            style={
              styles.cardSubtitle
            }
          >
            {selectedPaymentMethod ===
            "Dinheiro"
              ? "Pagamento na entrega"
              : "Pagamento móvel"}
          </Text>
        </View>

        <Text
          style={styles.arrow}
        >
          ›
        </Text>
      </Pressable>

      {/* ESTADO */}
      <Text
        style={[
          styles.sectionTitle,
          {
            marginTop: 24,
            marginBottom: 10,
          },
        ]}
      >
        Estado da Conta
      </Text>

      <View style={styles.status}>
        <View
          style={styles.statusDot}
        />

        <Text
          style={styles.statusText}
        >
          Conta ativa
        </Text>
      </View>

      {/* LOGOUT */}
      <Button
        title="Terminar Sessão"
        variant="primary"
        onPress={handleLogout}
        style={{
          marginTop: 30,
        }}
      />
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        "#F9F9F9",
    },

    container: {
      padding: 20,
      paddingBottom: 60,
    },

    logo: {
      fontSize: 42,
      fontWeight: "900",
      color: "#782726",
      marginBottom: 6,
    },

    title: {
      fontSize: 26,
      fontWeight: "700",
      color: "#1C1C1C",
      marginBottom: 16,
    },

    profileCard: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      borderRadius: 16,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 16,
    },

    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#782726",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 32,
    },

    avatarText: {
      color: "#FFF",
      fontSize: 24,
      fontWeight: "800",
    },

    name: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1C1C1C",
    },

    email: {
      color: "#6B7280",
      marginTop: 4,
    },

    phone: {
      color: "#6B7280",
      marginTop: 2,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginTop: 24,
      marginBottom: 10,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1C1C1C",
    },

    link: {
      color: "#782726",
      fontWeight: "700",
    },

    card: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: "#1C1C1C",
    },

    cardSubtitle: {
      color: "#6B7280",
      marginTop: 4,
    },

    arrow: {
      fontSize: 28,
      color: "#9CA3AF",
    },

    emptyCard: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      borderRadius: 14,
      padding: 18,
    },

    emptyText: {
      color: "#6B7280",
    },

    status: {
      backgroundColor:
        "#ECFDF5",
      borderRadius: 14,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },

    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor:
        "#10B981",
      marginRight: 10,
    },

    statusText: {
      color: "#065F46",
      fontWeight: "700",
    },
  });