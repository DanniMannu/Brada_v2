export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "assigned"
  | "picked_up"
  | "out_for_delivery"
  | "completed"
  | "rejected"
  | "cancelled";

export type PaymentMethod = "cash" | "mpesa" | "mkesh" | "emola" | "wallet";

export type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customer_id: string;
  total: number;
  status: OrderStatus;
  subtotal?: number;
  discount?: number;
  service_fee?: number;
  delivery_fee?: number;
  customer_notes?: string | null;
  payment_method?: PaymentMethod;
  delivery_pin_expires_at?: string | null;
  created_at?: string;

  customer?: {
    id: string;
    full_name: string;
    phone?: string | null;
  };

  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }[];
};
