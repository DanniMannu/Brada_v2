/*import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";*/ //eu

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { mapOrder } from "@/mappers/OrderMapper";
import { OrderRepository } from "@/repositories/OrderRepository";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;

  restaurantId?: string;

  restaurantName: string;

  items: OrderItem[];

  subtotal: number;

  deliveryFee: number;

  serviceFee: number;

  total: number;

  paymentMethod: string;

  address: string;

  deliveryCode: string;

  status: OrderStatus;

  createdAt: string;

  establishmentId?: string;

  hasReview: boolean;

  reviewRating?: number;

  discount: number;

}

interface CreateOrderPayload {
  restaurantId?: string;

  restaurantName: string;

  items: OrderItem[];

  subtotal: number;

  deliveryFee: number;

  serviceFee: number;

  total: number;

  paymentMethod: string;

  address: string;

  deliveryCode: string;

discount?: number;

couponId?: string | null;

}

interface OrderContextType {
  orders: Order[];

  activeOrders: Order[];

  historyOrders: Order[];

  loading: boolean;

  createOrder: (
    payload: CreateOrderPayload
  ) => Promise<Order | null>;

  fetchOrders: () => Promise<void>;

  updateOrderStatus: (
    orderId: string,
    status: OrderStatus
  ) => Promise<void>;

  cancelOrder: (
  orderId: string
  ) => Promise<void>;

  getOrderById: (
    id: string
  ) => Order | undefined;
  
}

const OrderContext =
  createContext<OrderContextType>(
    {} as OrderContextType
  );

/* ===================================
   FLUXO DE ESTADOS (DEV)
=================================== */

const ORDER_STEPS: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "on_the_way",
  "delivered",
];

export function OrderProvider({
  children,
}: any) {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(false);

  const { user } = useAuth();  

    /* ===================================
   DEV ONLY
   SIMULAÇÃO DE STATUS

   REMOVER QUANDO O BACKEND
   ESTIVER IMPLEMENTADO
=================================== */

useEffect(() => {
  if (!user) return;

  fetchOrders();

  const channel = supabase
    .channel("customer-orders")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `customer_id=eq.${user.id}`,
      },
      () => {
        fetchOrders();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);
/*
======================================

BACKEND REAL (SUPABASE)

REMOVER O useEffect ACIMA.

O estado virá do backend.

Exemplo:

const channel =
  supabase
    .channel("orders")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        fetchOrders();
      }
    )
    .subscribe();

return () => {
  supabase.removeChannel(
    channel
  );
};

======================================
*/

  /* ======================
     FETCH ORDERS
  ====================== */
const fetchOrders = async (): Promise<void> => {
  try {
    if (!user) return;

    setLoading(true);

    const data =
      await OrderRepository.getCustomerOrders(user.id);

    const mapped = data.map(mapOrder);

    setOrders(mapped);
  } catch (error) {
  } finally {
    setLoading(false);
  }
};

  /* ======================
     CREATE ORDER
  ====================== */

const createOrder = async (payload: CreateOrderPayload): Promise<Order | null> => {
  try {
    if (!user) throw new Error("Utilizador não autenticado.");

    setLoading(true);

    console.log("couponId recebido:", payload.couponId);
    
    const order =
      await OrderRepository.createOrder({
    establishmentId: payload.restaurantId!,
    restaurantName: payload.restaurantName,
    customerId: user.id,
    address: payload.address,
    paymentMethod: payload.paymentMethod,
    notes: "",
    items: payload.items,

    subtotal: payload.subtotal,
    deliveryFee: payload.deliveryFee,
    serviceFee: payload.serviceFee,

    total: payload.total,

    discount: payload.discount ?? 0,
    couponId: payload.couponId ?? null,
});

    const newOrder: Order = {
      id: order.id,

      restaurantId:
        payload.restaurantId,

      restaurantName:
        payload.restaurantName,

      items: payload.items,

      subtotal:
        payload.subtotal,

      deliveryFee:
        payload.deliveryFee,

      serviceFee:
        payload.serviceFee,

      total: payload.total - (payload.discount ?? 0),
      
      paymentMethod:
        payload.paymentMethod,

      address:
        payload.address,

      deliveryCode:
        order.delivery_code,

      status: "pending",

      createdAt:
        order.created_at,

      hasReview: false,

      discount: payload.discount ?? 0,
    };

    setOrders((prev) => [newOrder, ...prev]);

    return newOrder;
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    setLoading(false);
  }
};
  /* ======================
     UPDATE STATUS
  ====================== */

  const updateOrderStatus = async (
      orderId: string,
      status: OrderStatus
    ) => {
      try {
        await OrderRepository.updateStatus(
          orderId,
          status
        );

        await fetchOrders();
      } catch (error) {
        console.log("Erro ao atualizar pedido",error);
      }
    };

const cancelOrder = async (
  orderId: string
) => {
  try {
    await OrderRepository.cancelOrder(orderId);
    await fetchOrders();
  } catch (error) {
    console.log(
      "Erro ao cancelar pedido",
      error
    );
  }
};
    
  /* ======================
     GET ORDER
  ====================== */

  const getOrderById = (
    id: string
  ) => {
    return orders.find(
      (order) => order.id === id
    );
  };

  /* ======================
     ACTIVE ORDERS
  ====================== */

  const activeOrders =
    useMemo(() => {
      return orders.filter(
        (order) =>
          order.status !== "delivered" &&
          order.status !== "cancelled"
      );
    }, [orders]);

  /* ======================
     HISTORY ORDERS
  ====================== */

  const historyOrders =
    useMemo(() => {
      return orders.filter(
        (order) =>
          order.status === "delivered" ||
          order.status === "cancelled"
      );
    }, [orders]);

  return (
    <OrderContext.Provider
      value={{
        orders,

        activeOrders,

        historyOrders,

        loading,

        createOrder,

        fetchOrders,

        updateOrderStatus,

        getOrderById,

        cancelOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () =>
  useContext(OrderContext);