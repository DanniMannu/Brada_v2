export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "assigned"
  | "rejected";

export interface Order {
  id: string;
  establishment_id: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
}
