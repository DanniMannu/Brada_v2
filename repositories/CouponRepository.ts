import { supabase } from "@/lib/supabase";

export interface Coupon {
  id: string;
  code: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  minimum_order: number;
  max_discount: number | null;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  used_count: number;
}

class CouponRepository {
  async validateCoupon(
  code: string,
  subtotal: number,
  customerId?: string
): Promise<{
  valid: boolean;
  message?: string;
  coupon?: Coupon;
  discount?: number;
}> {
    console.log("CUSTOMER ID:", customerId);

  const search = code.trim().toUpperCase();

  const { data: coupons, error } = await supabase
    .from("coupons")
    .select("*");

  if (error) {
    return {
      valid: false,
      message: error.message,
    };
  }

  if (!coupons || coupons.length === 0) {
    return {
      valid: false,
      message: "Não existem cupões.",
    };
  }

  const coupon = coupons.find(
    (c) => c.code.trim().toUpperCase() === search
  );

  console.log("Cupão encontrado:", coupon);

  if (!coupon) {
    return {
      valid: false,
      message: "Cupão inválido.",
    };
  }

  if (!coupon.active) {
    return {
      valid: false,
      message: "Cupão desativado.",
    };
  }
  if (customerId) {
    console.log("A verificar coupon_usage...");
  const { data: alreadyUsed, error } = await supabase
    
  .from("coupon_usage")
    .select("id")
    .eq("coupon_id", coupon.id)
    .eq("customer_id", customerId)

    .maybeSingle();

console.log("alreadyUsed:", alreadyUsed);
  if (error) {
    console.log(error);
  }

  if (alreadyUsed) {
    return {
      valid: false,
      message: "Já utilizou este cupão.",
    };
  }
}

  if (
  coupon.usage_limit !== null &&
  coupon.usage_limit !== undefined &&
  coupon.used_count >= coupon.usage_limit
) {
  return {
    valid: false,
    message: "Este cupão atingiu o limite de utilizações.",
  };
}

  const today = new Date();

  if (coupon.start_date) {
    const start = new Date(coupon.start_date);

    if (today < start) {
      return {
        valid: false,
        message: "Este cupão ainda não está ativo.",
      };
    }
  }

  if (coupon.end_date) {
    const end = new Date(coupon.end_date);

    if (today > end) {
      return {
        valid: false,
        message: "Este cupão expirou.",
      };
    }
  }

  if (
    coupon.minimum_order &&
    subtotal < coupon.minimum_order
  ) {
    return {
      valid: false,
      message: `Compra mínima de ${coupon.minimum_order} MT.`,
    };
  }

  /*if (customerId) {
  const { data: alreadyUsed } = await supabase
    .from("coupon_usage")
    .select("id")
    .eq("coupon_id", coupon.id)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (alreadyUsed) {
    return {
      valid: false,
      message: "Já utilizou este cupão.",
    };
  }
}*/

  let discount = 0;

  if (
    coupon.discount_type === "percentage" ||
    coupon.discount_type === "percent"
  ) {
    discount =
      (subtotal * coupon.discount_value) / 100;

    const max =
      coupon.maximum_discount ??
      coupon.max_discount;

    if (
      max !== null &&
      max !== undefined &&
      discount > max
    ) {
      discount = max;
    }
  } else {
    discount = coupon.discount_value;
  }

  if (discount > subtotal) {
    discount = subtotal;
  }

  return {
    valid: true,
    coupon: coupon,
    discount,
  };
}
  async increaseUsage(id: string) {
    const { data, error } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    await supabase
      .from("coupons")
      .update({
        used_count: (data?.used_count ?? 0) + 1,
      })
      .eq("id", id);
  }
}

export default new CouponRepository();