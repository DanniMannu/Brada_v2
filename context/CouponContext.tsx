import React, {
  createContext,
  useContext,
  useState,
} from "react";

import CouponRepository, {
  Coupon,
} from "@/repositories/CouponRepository";

interface CouponContextType {
  coupon: Coupon | null;

  discount: number;

  applyCoupon(
  code: string,
  subtotal: number,
  customerId?: string
): Promise<{
  success: boolean;
  message: string;
}>;

  removeCoupon: () => void;

  calculateTotal: (
    subtotal: number
  ) => number;
}

const CouponContext =
  createContext<CouponContextType>(
    {} as CouponContextType
  );

export function CouponProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [coupon, setCoupon] =
    useState<Coupon | null>(null);

  const [discount, setDiscount] =
    useState(0);

  async function applyCoupon(
    code: string,
    subtotal: number,
    customerId?: string

  ) {
    try {
      console.log("CUSTOMER ID:", customerId);

      const result =
        await CouponRepository.validateCoupon(
          code,
          subtotal,
          customerId
        );

      console.log("RESULTADO DO CUPÃO:", result);

      if (!result.valid || !result.coupon) {
        removeCoupon();

        return {
          success: false,
          message: result.message ?? "Cupão inválido.",
        };
      }

      setCoupon(result.coupon);

      setDiscount(result.discount ?? 0);

    return {
      success: true,
      message: "Cupão aplicado.",
    };
    } catch (error) {
      console.log(error);
      removeCoupon();
       return {
        success: false,
        message: "Erro ao validar o cupão.",
      };
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setDiscount(0);
  }

  function calculateTotal(
    subtotal: number
  ) {
    return Math.max(
      subtotal - discount,
      0
    );
  }

  return (
    <CouponContext.Provider
      value={{
        coupon,
        discount,
        applyCoupon,
        removeCoupon,
        calculateTotal,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupon() {
  return useContext(CouponContext);
}