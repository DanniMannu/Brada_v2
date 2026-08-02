import { Order } from "@/context/OrderContext";

export function mapOrder(dbOrder: any): Order {
  console.log(
  dbOrder.id,
  dbOrder.reviews,
  !!dbOrder.reviews
);

console.log("DB ORDER:");
console.log(JSON.stringify(dbOrder, null, 2));

  return {
    id: dbOrder.id,

    establishmentId: dbOrder.establishment_id,


    restaurantId: dbOrder.establishment_id,

    // por enquanto ainda não temos o nome do restaurante
    restaurantName: dbOrder.restaurant_name ?? "Restaurante",

    items:
      dbOrder.order_items?.map((item: any) => ({
        id: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        price: Number(item.price),
      })) ?? [],

   subtotal: Number(dbOrder.subtotal ?? dbOrder.total),

deliveryFee: Number(dbOrder.delivery_fee ?? 0),

serviceFee: Number(dbOrder.service_fee ?? 0),

total: Number(dbOrder.total),

    paymentMethod: dbOrder.payment_method,

    address: dbOrder.delivery_address,

    deliveryCode: dbOrder.delivery_code,

    status: dbOrder.status,

    createdAt: dbOrder.created_at,

   // hasReview:
//dbOrder.hasReview ?? false,
hasReview: !!dbOrder.reviews,

reviewRating: dbOrder.reviews?.rating ?? 0,

discount: Number(dbOrder.discount ?? 0),

  };
}