import Button from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import type {
  Order,
} from "@/context/OrderContext";
import { useOrders } from "@/context/OrderContext";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from "@/app/utils/orderStatus";

export default function OrdersScreen() {
  const {
    activeOrders = [],
    historyOrders = [],
  } = useOrders();

  const [tab, setTab] = useState<
    "active" | "history"
  >("active");

  const orders = useMemo(() => {
    return tab === "active"
      ? activeOrders
      : historyOrders;
  }, [tab, activeOrders, historyOrders]);

  const openOrder = (order: any) => {
    router.push({
      pathname: "/track-order",
      params: {
        orderId: order.id,
      },
    });
  };


  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        Meus Pedidos
      </Text>

      <InfoBox
        message="Acompanha os teus pedidos ativos e consulta o histórico."
      />

      {/* TABS */}

      <View style={styles.tabs}>
        <Pressable
          style={[
            styles.tabButton,
            tab === "active" &&
              styles.activeTabButton,
          ]}
          onPress={() =>
            setTab("active")
          }
        >
          <Text
            style={[
              styles.tabButtonText,
              tab === "active" &&
                styles.activeTabButtonText,
            ]}
          >
            Ativos
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            tab === "history" &&
              styles.activeTabButton,
          ]}
          onPress={() =>
            setTab("history")
          }
        >
          <Text
            style={[
              styles.tabButtonText,
              tab === "history" &&
                styles.activeTabButtonText,
            ]}
          >
            Histórico
          </Text>
        </Pressable>
      </View>

      {/* EMPTY */}

      {orders.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            Nenhum pedido encontrado
          </Text>

          <Text style={styles.emptyText}>
            Ainda não existem pedidos nesta secção.
          </Text>

          <Button
            title="Explorar Restaurantes"
            onPress={() =>
              router.push(
                "/tabs/home"
              )
            }
            style={{
              marginTop: 20,
              width: 220,
            }}
          />
        </View>
      )}

      {/* ORDERS */}
        {orders.map((order: Order) => {
          /*const canReview =
            order.status === "delivered" &&
            !order.reviewed;*/
            const canReview =
            order.status === "delivered" &&
            !order.hasReview;

        return (

          <Pressable
            key={order.id}
            style={styles.card}
            onPress={() => openOrder(order)}
          >
        
          <Text style={styles.restaurant}>
            {order.restaurantName}
          </Text>

          <Text style={styles.orderId}>
            Pedido #{order.id}
          </Text>

          <View
            style={styles.separator}
          />

          {order.items
            ?.slice(0, 3)
            .map((item: any) => (
              <View
                key={item.id}
                style={styles.itemRow}
              >
                <Text
                  style={styles.item}
                >
                  {item.quantity}x{" "}
                  {item.name}
                </Text>

                <Text
                  style={styles.item}
                >
                  {(
                    item.price *
                    item.quantity
                  ).toFixed(2)}{" "}
                  MT
                </Text>
              </View>
            ))}

          {(order.items?.length ||
            0) > 3 && (
            <Text
              style={styles.moreItems}
            >
              +
              {order.items.length -
                3}{" "}
              itens
            </Text>
          )}

          <View
            style={styles.separator}
          />

          <View style={styles.footer}>
            <View>
              <Text
                style={styles.statusLabel}
              >
                Estado
              </Text>

              <Text
                style={[
                  styles.status,
                  {
                    color:
                     ORDER_STATUS_COLORS[order.status],
                  },
                ]}
              >
                {
                  ORDER_STATUS_LABELS[order.status]
                }
              </Text>
            </View>

            <View>
              <Text
                style={styles.totalLabel}
              >
                Total
              </Text>

              <Text
                style={styles.total}
              >
                {Number(
                  order.total || 0
                ).toFixed(2)}{" "}
                MT
              </Text>
            </View>
          </View>

          {canReview ? (
            <Button
              title="Avaliar Pedido"
              onPress={() =>
                router.push({
                  pathname: "/review-order",
                  params: {
                    orderId: order.id,
                  },
                })
              }
              style={{
                marginTop: 18,
              }}
            />
          ) : order.hasReview ? (
           <Text
              style={{
                marginTop: 18,
                color: "#16A34A",
                fontWeight: "700",
                textAlign: "right",
                fontSize: 15,
              }}
            >
              {"★".repeat(order.reviewRating ?? 0)}
              {"☆".repeat(5 - (order.reviewRating ?? 0))}
              {" "}
              {order.reviewRating}/5 • Pedido Avaliado
            </Text>
          ) : null}


        </Pressable>
      );})}
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
    paddingBottom: 50,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1C1C1C",
    marginBottom: 20,
  },

  tabs: {
    flexDirection: "row",
    marginVertical: 20,
  },

  tabButton: {
    flex: 1,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    paddingVertical: 14,

    borderRadius: 14,

    alignItems: "center",

    marginRight: 10,
  },

  activeTabButton: {
    backgroundColor: "#782726",
    borderColor: "#782726",
  },

  tabButtonText: {
    color: "#6B7280",
    fontWeight: "700",
  },

  activeTabButtonText: {
    color: "#FFFFFF",
  },

  empty: {
    alignItems: "center",
    paddingVertical: 80,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1C",
  },

  emptyText: {
    marginTop: 8,
    color: "#6B7280",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 18,

    marginBottom: 18,

    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  restaurant: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1C1C1C",
  },

  orderId: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  item: {
    color: "#4B5563",
    fontSize: 14,
  },

  moreItems: {
    marginTop: 4,
    color: "#782726",
    fontWeight: "600",
  },

  separator: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 14,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statusLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 4,
  },

  status: {
    color: "#782726",
    fontWeight: "700",
  },

  totalLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 4,
    textAlign: "right",
  },

  total: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1C1C1C",
  },
});