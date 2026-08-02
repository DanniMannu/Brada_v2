import { supabase } from "@/lib/supabase";

export type DbOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface DbOrder {
  id: string;
  establishment_id: string;
  customer_id: string;
  total: number;
  status: DbOrderStatus;
  created_at: string;
  delivery_address: string;
  payment_method: string;
  delivery_code: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export const OrderRepository = {

  async createOrder({
  establishmentId,
  restaurantName,
  customerId,
  address,
  paymentMethod,
  notes,
  items,
  subtotal,
  deliveryFee,
  serviceFee,
  total,
  discount,
  couponId,
}: {
  establishmentId: string;
  restaurantName: string;
  customerId: string;
  address: string;
  paymentMethod: string;
  notes?: string;
  items: any[];

  subtotal: number;
  deliveryFee: number;
  serviceFee: number;

  total: number;

  discount?: number;
  couponId?: string | null;
}) {
    const deliveryCode = Math.floor(
      100000 + Math.random() * 900000
  ).toString();

//eu 
    const {
        data: { user },
      } = await supabase.auth.getUser();
     
//
const payload = {

  establishment_id: establishmentId,
  restaurant_name: restaurantName,
  customer_id: customerId,

  subtotal: subtotal,

  delivery_fee: deliveryFee,

  service_fee: serviceFee,

  discount: discount ?? 0,

  total: total - (discount ?? 0),

  status: "pending",

  delivery_address: address,

  payment_method: paymentMethod,

  delivery_code: deliveryCode,

  notes: notes ?? "",

  coupon_id: couponId ?? null,
};

console.log("PAYLOAD:", payload);

const { data: order, error } = await supabase
  .from("orders")
  .insert(payload)
  .select()
  .single();

  console.log("PAYLOAD");
  console.log(payload);

    if (error) throw error;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      restaurant_id: establishmentId,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemError) throw itemError;
    
    console.log("couponId recebido:", couponId);
     if (couponId) {
    await this.useCoupon(couponId,customerId);
} 

    return order;
  },

async getCustomerOrders(customerId: string) {
    
/*const { data, error } = await supabase
  .from("orders")
  .select(`
    *,
    order_items(*),
    reviews_id
  `)
  .eq("customer_id", customerId)
  .order("created_at", { ascending: false });*/
const { data, error } = await supabase
  .from("orders")
  .select(`
    *,
    order_items(*),
    reviews!reviews_order_id_fkey(
      id,
      order_id,
      rating
    )
  `)
  .eq("customer_id", customerId)
  .order("created_at", { ascending: false });


    if (error) throw error;

    /*console.log(
      "ORDERS:",
      JSON.stringify(data, null, 2)
    );*/ 
    
    return data ?? [];
  },

  async getOrder(id: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  async updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
  },

 async cancelOrder(id: string) {

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
    })
    .eq("id", id)
    .select();


  if (error) throw error;

  return data;
},

async useCoupon(id: string, customerId: string) {

  console.log("USE COUPON");
  console.log("coupon:", id);
  console.log("customer:", customerId);

  const { data, error } = await supabase
    .from("coupons")
    .select("used_count")
    .eq("id", id)
    .single();

  if (error || !data) return;

  const { error: updateError } = await supabase
    .from("coupons")
    .update({
      used_count: (data.used_count ?? 0) + 1,
    })
    .eq("id", id);

    await supabase
    .from("coupon_usage")
    .insert({
        coupon_id: id,
        customer_id: customerId,
    });
    

  console.log("INSERT coupon_usage:", error);  

  console.log("UPDATE ERROR:", updateError);
}

};
