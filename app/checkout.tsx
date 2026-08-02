import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCoupon } from "@/context/CouponContext";
import { useOrders } from "@/context/OrderContext";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function CheckoutScreen() {
  const { user } = useAuth();

  const {
    items,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    clearCart,
  } = useCart();

  const { createOrder } = useOrders();

  const {
  coupon,
  discount,
  calculateTotal,
  removeCoupon,
} = useCoupon();

const finalTotal =
  calculateTotal(total);

  const selectedAddress = useMemo(() => {
    if (!user?.addresses?.length) {
      return null;
    }

    return user?.addresses?.length
      ? user.addresses[0]
      : null;
    }, [user]);

  const paymentMethod =
    user?.selected_payment_method ??
    "Dinheiro";

  const generateDeliveryCode = () => {
    return Math.floor(
      100000 + Math.random() * 900000
    ).toString();
  };

  const handleConfirmOrder =
  async () => {
    if (!items.length) {
      Alert.alert(
        "Carrinho vazio",
        "Adiciona produtos antes de continuar."
      );
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        "Morada em falta",
        "Adiciona uma morada antes de continuar."
      );
      return;
    }

    const deliveryCode =
      generateDeliveryCode();
if (!items[0]?.restaurantId) {
  Alert.alert(
    "Erro",
    "Não foi possível identificar o restaurante."
  );

  return;
}
/*console.log(
  "FIRST ITEM:",
  JSON.stringify(items[0], null, 2)
);*/
const createdOrder = await createOrder({
    restaurantId: items[0].restaurantId,
    restaurantName: items[0].restaurantName ?? "Restaurante",
    items,
    subtotal,
    deliveryFee,
    serviceFee,
    total,

    discount,
    couponId: coupon?.id ?? null,
    paymentMethod,
    address: selectedAddress.address,
    deliveryCode,
  });

  if (!createdOrder) {
    Alert.alert(
      "Erro",
      "Não foi possível criar o pedido."
    );
    return;
  }

  clearCart();
  if (coupon) {
    removeCoupon();
  }

  router.replace({
    pathname: "/track-order",
    params: {
      orderId: createdOrder.id,
    },
  });
};

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.title}>
        Checkout
      </Text>

      <InfoBox
        message="Confirma a morada, método de pagamento e os detalhes do pedido antes de continuar."
      />

      <Text style={styles.sectionTitle}>
        Morada de entrega
      </Text>

      <View style={styles.card}>
        {selectedAddress ? (
          <>
            <Text
              style={styles.cardTitle}
            >
              {selectedAddress.label ||
                "Morada"}
            </Text>

            <Text
              style={styles.cardText}
            >
              {
                selectedAddress.address
              }
            </Text>
          </>
        ) : (
          <Text
            style={styles.cardText}
          >
            Nenhuma morada configurada
          </Text>
        )}

        <Button
          title="Alterar morada"
          onPress={() =>
            router.push(
              "/manage-addresses"
            )
          }
          style={{
            marginTop: 16,
          }}
        />
      </View>

      <Text style={styles.sectionTitle}>
        Método de pagamento
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {paymentMethod}
        </Text>

        <Text style={styles.cardText}>
          Método selecionado no perfil
        </Text>

        <Button
          title="Alterar método"
          onPress={() =>
            router.push(
              "/payment-methods"
            )
          }
          style={{
            marginTop: 16,
          }}
        />
      </View>

      <Text style={styles.sectionTitle}>
        Resumo do pedido
      </Text>

      <View style={styles.card}>
        {items.map((item) => (
          <View
            key={item.id}
            style={styles.itemRow}
          >
            <Text>
              {item.quantity}x{" "}
              {item.name}
            </Text>

            <Text>
              {(
                item.price *
                item.quantity
              ).toFixed(2)}{" "}
              MT
            </Text>
          </View>
        ))}

        <View
          style={styles.separator}
        />

        <View style={styles.itemRow}>
          <Text>Subtotal</Text>

          <Text>
            {subtotal.toFixed(2)} MT
          </Text>
        </View>

        <View style={styles.itemRow}>
          <Text>Entrega</Text>

          <Text>
            {deliveryFee.toFixed(2)} MT
          </Text>
        </View>

        <View style={styles.itemRow}>
          <Text>Serviço</Text>

          <Text>
            {serviceFee.toFixed(2)} MT
          </Text>
        </View>

        {coupon && (
          <>
            <View style={styles.itemRow}>
              <Text
                style={{
                  color: "#16A34A",
                  fontWeight: "700",
                }}
              >
                Cupão
              </Text>

              <Text
                style={{
                  color: "#16A34A",
                  fontWeight: "700",
                }}
              >
                {coupon.code}
              </Text>
            </View>

            <View style={styles.itemRow}>
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
          </>
        )}

        <View
          style={styles.separator}
        />

        <View style={styles.itemRow}>
          <Text style={styles.total}>
            Total
          </Text>

          <Text style={styles.total}>
            {finalTotal.toFixed(2)} MT
          </Text>
        </View>
      </View>

      <Button
        title="Confirmar Pedido"
        onPress={handleConfirmOrder}
        style={{
          marginTop: 24,
          marginBottom: 40,
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
    paddingBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  cardText: {
    marginTop: 6,
    color: "#6B7280",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  total: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
});
