export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "rejected"
  | "cancelled";

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

  customer: {
    id: string;
    full_name: string;
  };

  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }[];
};
