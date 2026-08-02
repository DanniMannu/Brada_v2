import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { InfoBox } from "@/components/ui/InfoBox";
import { useOrders } from "@/context/OrderContext";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function TrackOrderScreen() {
  const { orderId } =
    useLocalSearchParams();

  const {
    getOrderById,
    cancelOrder,
  } = useOrders();

  const [showCancelModal, setShowCancelModal] =
  React.useState(false);

  const order =
    getOrderById(orderId as string);

  const canCancel =
    order?.status === "pending" ||
    order?.status === "accepted";

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>
          Pedido não encontrado.
        </Text>
      </View>
    );
  };
  const steps = [
  {
    key: "pending",
    label: "Pedido enviado",
  },
  {
    key: "accepted",
    label: "Pedido aceite",
  },
  {
    key: "preparing",
    label: "Em preparação",
  },
  {
    key: "ready",
    label: "Pronto",
  },
  {
    key: "on_the_way",
    label: "A caminho",
  },
  {
    key: "delivered",
    label: "Entregue",
  },
];

const currentIndex =
  steps.findIndex(
    (step) =>
      step.key === order.status
  );
const handleCancel = () => {
  setShowCancelModal(true);

}; 

const confirmCancel = async () => {
  try {

    await cancelOrder(order.id);

    setShowCancelModal(false);

    router.replace("/tabs/orders");

  } catch (error) {

    console.log(error);

  }
};

const closeCancel = () => {

  setShowCancelModal(false);

};

  return (
   <>  
  <ScrollView
    style={styles.safe}
    contentContainerStyle={styles.container}
  >
    <Text style={styles.title}>
      Acompanhar Pedido
    </Text>

    <InfoBox
      message={`Código de entrega: ${order.deliveryCode}`}
    />

    <View style={styles.card}>
      <Text style={styles.restaurant}>
        {order.restaurantName}
      </Text>

      <Text style={styles.orderId}>
        Pedido #{order.id}
      </Text>

      <Text style={styles.address}>
        {order.address}
      </Text>
    </View>

    <Text style={styles.section}>
      Estado do Pedido
    </Text>

    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const completed =
          index <= currentIndex;

        return (
          <View
            key={step.key}
            style={styles.timelineRow}
          >
            <View
              style={[
                styles.circle,
                completed &&
                  styles.circleActive,
              ]}
            />

            <Text
              style={[
                styles.timelineText,
                completed &&
                  styles.timelineTextActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>

    <Text style={styles.section}>
      Produtos
    </Text>

    <View style={styles.card}>
      {order.items.map((item) => (
        <View
          key={item.id}
          style={styles.itemRow}
        >
          <Text style={styles.itemName}>
            {item.quantity}x {item.name}
          </Text>

          <Text style={styles.itemPrice}>
            {(
              item.quantity *
              item.price
            ).toFixed(2)}{" "}
            MT
          </Text>
        </View>
      ))}
    </View>

    <Text style={styles.section}>
      Resumo
    </Text>

    <View style={styles.card}>
      <View style={styles.summaryRow}>
        <Text>Subtotal</Text>

        <Text>
          {order.subtotal.toFixed(2)} MT
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text>Entrega</Text>

        <Text>
          {order.deliveryFee.toFixed(2)} MT
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text>Serviço</Text>

        <Text>
          {order.serviceFee.toFixed(2)} MT
        </Text>
      </View>

        {order.discount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={{ color: "#16A34A", fontWeight: "700" }}>
            Desconto
          </Text>

          <Text style={{ color: "#16A34A", fontWeight: "700" }}>
            -{order.discount.toFixed(2)} MT
          </Text>
        </View>
      )}
      <View style={styles.separator} />

      <View style={styles.summaryRow}>
        <Text style={styles.total}>
          Total
        </Text>

        <Text style={styles.total}>
          {order.total.toFixed(2)} MT
        </Text>
      </View>
    </View>
    {canCancel && (
      <Button
        title="Cancelar Pedido"
        onPress={handleCancel}
        
        style={{
          marginTop: 24,
          backgroundColor: "#DC2626",
          
        }}
      />
    )}
    <Button
      title="Voltar aos pedidos"
      onPress={() =>
        router.back()
      }
      style={{
        marginTop: 30,
        marginBottom: 40,
      }}
    />
  </ScrollView>
  <ConfirmModal
      visible={showCancelModal}
      title="Cancelar pedido"
      message="Tem a certeza que pretende cancelar este pedido?"
      confirmText="Sim, cancelar"
      cancelText="Voltar"
      onConfirm={confirmCancel}
      onCancel={closeCancel}
    />
  </>
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
    marginBottom: 20,
  },

  section: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  restaurant: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  orderId: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 13,
  },

  address: {
    marginTop: 10,
    color: "#4B5563",
    lineHeight: 22,
  },

  timeline: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 16,
    backgroundColor: "#FFFFFF",
  },

  circleActive: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },

  timelineText: {
    fontSize: 16,
    color: "#9CA3AF",
  },

  timelineTextActive: {
    color: "#111827",
    fontWeight: "700",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  itemName: {
    color: "#111827",
    fontSize: 15,
  },

  itemPrice: {
    fontWeight: "700",
    color: "#111827",
  },

  summaryRow: {
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});