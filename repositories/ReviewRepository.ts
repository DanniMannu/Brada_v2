import { supabase } from "@/lib/supabase";

export const ReviewRepository = {
  async createReview({
    orderId,
    establishmentId,
    customerId,
    rating,
    comment,
  }: {
    orderId: string;
    establishmentId: string;
    customerId: string;
    rating: number;
    comment: string;
  }) {
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        order_id: orderId,
        establishment_id: establishmentId,
        customer_id: customerId,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async alreadyReviewed(orderId: string) {
    const { data } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    return !!data;
  },
};