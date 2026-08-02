import AlertModal from "@/components/ui/AlertModal";
import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCoupon } from "@/context/CouponContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text, TextInput, View
} from "react-native";

export default function CartScreen() {

  const { user } = useAuth();
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    totalItems,
  } = useCart();

  const {
  coupon,
  discount,
  applyCoupon,
  removeCoupon,
} = useCoupon();

const [couponCode, setCouponCode] =
  useState("");

const [alertVisible, setAlertVisible] =
  useState(false);

const [alertTitle, setAlertTitle] =
  useState("");

const [alertMessage, setAlertMessage] =
  useState("");  

const finalTotal =
  total - discount > 0
    ? total - discount
    : 0;

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          Carrinho vazio
        </Text>

        <InfoBox
          type="info"
          message="Ainda não adicionaste produtos ao carrinho."
        />

        <Button
          title="Explorar restaurantes"
          onPress={() =>
            router.push("/(Client)/tabs/home")
          }
          style={styles.exploreButton}
        />
      </View>
    );
  }

  const restaurantName =
    items[0]?.restaurantName ?? "";

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>
          Carrinho
        </Text>

        <InfoBox
          message={`${totalItems} item(ns) selecionado(s)`}
        />

        <View style={styles.restaurantCard}>
          <Text style={styles.restaurantLabel}>
            Restaurante
          </Text>

          <Text style={styles.restaurantName}>
            {restaurantName}
          </Text>
        </View>

        {items.map((item) => (
          <View
            key={item.id}
            style={styles.itemCard}
          >
            <Image
              source={{
                uri:
                  item.image ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.price}>
                {item.price.toFixed(2)} MT
              </Text>

              <View style={styles.controls}>
                <Pressable
                  style={styles.controlButton}
                  onPress={() =>
                    decreaseQuantity(item.id)
                  }
                >
                  <Text
                    style={styles.controlText}
                  >
                    -
                  </Text>
                </Pressable>

                <Text style={styles.quantity}>
                  {item.quantity}
                </Text>

                <Pressable
                  style={styles.controlButton}
                  onPress={() =>
                    increaseQuantity(item.id)
                  }
                >
                  <Text
                    style={styles.controlText}
                  >
                    +
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.itemTotal}>
              {(
                item.price *
                item.quantity
              ).toFixed(2)}{" "}
              MT
            </Text>
          </View>
        ))}

        <View style={styles.couponBox}>
          <Text style={styles.couponTitle}>
            Cupão de desconto
          </Text>

          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Ex: BRADA10"
            autoCapitalize="characters"
            style={styles.couponInput}
          />

          {!coupon ? (
            <Button
              title="Aplicar Cupão"
              onPress={async () => {
                const result = await applyCoupon(
                  couponCode,
                  total,
                  user?.id
                );

                setAlertTitle(
                  result.success
                    ? "Cupão aplicado"
                    : "Cupão"
                );

                setAlertMessage(result.message);

                setAlertVisible(true);

                if (!result.success) {
                  return;
                }
              }}
            />
          ) : (
            <>
              <Text style={styles.couponSuccess}>
                ✓ Cupão aplicado:
                {" "}
                {coupon.code}
              </Text>

              <Button
                title="Remover Cupão"
                variant="secondary"
                onPress={removeCoupon}
              />
            </>
          )}
          <AlertModal
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
              />
        </View>

        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={styles.label}>
              Subtotal
            </Text>

            <Text style={styles.value}>
              {subtotal.toFixed(2)} MT
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Taxa de entrega
            </Text>

            <Text style={styles.value}>
              {deliveryFee.toFixed(2)} MT
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Taxa de serviço
            </Text>

            <Text style={styles.value}>
              {serviceFee.toFixed(2)} MT
            </Text>
          </View>

          {discount > 0 && (
            <View style={styles.row}>
              <Text
                style={{
                  color: "#16A34A",
                  fontWeight: "700",
                }}
              >
                Desconto
              </Text>

              <Text
                style={{
                  color: "#16A34A",
                  fontWeight: "700",
                }}
              >
                -{discount.toFixed(2)} MT
              </Text>
            </View>
          )}

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              {finalTotal.toFixed(2)} MT
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Finalizar Pedido • ${finalTotal.toFixed(
            2
          )} MT`}
          onPress={() =>
            router.push("/checkout")
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    padding: 16,
    paddingBottom: 120,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 12,
  },

  restaurantCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },

  restaurantLabel: {
    color: "#777",
    fontSize: 12,
  },

  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },

  itemCard: {
    flexDirection: "row",
    marginBottom: 18,
    alignItems: "center",
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
  },

  price: {
    marginTop: 4,
    color: "#666",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  controlButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  controlText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  quantity: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: "700",
  },

  itemTotal: {
    fontWeight: "700",
    fontSize: 15,
  },

  summary: {
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  label: {
    color: "#666",
  },

  value: {
    fontWeight: "600",
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "800",
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  exploreButton: {
    marginTop: 20,
  },

  couponBox: {
  backgroundColor: "#F7F7F7",
  borderRadius: 16,
  padding: 18,
  marginTop: 20,
},

couponTitle: {
  fontSize: 17,
  fontWeight: "700",
  marginBottom: 10,
},

couponInput: {
  borderWidth: 1,
  borderColor: "#DDD",
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
  backgroundColor: "#FFF",
},

couponSuccess: {
  color: "#16A34A",
  fontWeight: "700",
  marginBottom: 12,
},
});