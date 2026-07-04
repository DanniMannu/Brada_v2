export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "assigned"
  | "rejected";

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
    phone: string | null;
  };

  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }[];
};
