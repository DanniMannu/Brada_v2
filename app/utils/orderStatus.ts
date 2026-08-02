import { OrderStatus } from "@/context/OrderContext";

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  string
> = {
  pending: "Pedido enviado",

  accepted: "Pedido aceite",

  preparing: "Em preparação",

  ready: "Pronto para recolha",

  on_the_way: "A caminho",

  delivered: "Entregue",

  cancelled: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  string
> = {
  pending: "#2563EB",

  accepted: "#0EA5E9",

  preparing: "#F59E0B",

  ready: "#7C3AED",

  on_the_way: "#10B981",

  delivered: "#16A34A",

  cancelled: "#DC2626",
};