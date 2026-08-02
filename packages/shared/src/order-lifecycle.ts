export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "assigned",
  "picked_up",
  "out_for_delivery",
  "completed",
  "rejected",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = "cash" | "mpesa" | "mkesh" | "emola" | "wallet";

export type OrderTotalsInput = {
  subtotal: number;
  discount?: number;
  deliveryFee: number;
  serviceFeeRate?: number;
};

export type OrderTotals = {
  subtotal: number;
  discount: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
};

const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "completed",
  "rejected",
  "cancelled",
]);

const NEXT_STATUSES: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending: ["accepted", "rejected", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["assigned", "cancelled"],
  assigned: ["picked_up", "ready", "cancelled"],
  picked_up: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: [],
  rejected: [],
  cancelled: [],
};

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateOrderTotals({
  subtotal,
  discount = 0,
  deliveryFee,
  serviceFeeRate = 0.08,
}: OrderTotalsInput): OrderTotals {
  if (subtotal < 0 || discount < 0 || deliveryFee < 0 || serviceFeeRate < 0) {
    throw new Error("Os valores do pedido não podem ser negativos.");
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const serviceFee = roundCurrency(discountedSubtotal * serviceFeeRate);
  return {
    subtotal: roundCurrency(subtotal),
    discount: roundCurrency(Math.min(discount, subtotal)),
    serviceFee,
    deliveryFee: roundCurrency(deliveryFee),
    total: roundCurrency(discountedSubtotal + serviceFee + deliveryFee),
  };
}

export function canTransitionOrder(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  return !TERMINAL_STATUSES.has(current) && NEXT_STATUSES[current].includes(next);
}

export function assertOrderTransition(
  current: OrderStatus,
  next: OrderStatus,
): void {
  if (!canTransitionOrder(current, next)) {
    throw new Error(`Não é possível alterar um pedido de ${current} para ${next}.`);
  }
}

export function isDigitalPayment(method: PaymentMethod): boolean {
  return method !== "cash";
}
