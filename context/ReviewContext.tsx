import React, {
  createContext,
  useContext,
} from "react";

import { ReviewRepository } from "@/repositories/ReviewRepository";
import { useAuth } from "./AuthContext";

interface ReviewContextType {
  createReview: (
    orderId: string,
    establishmentId: string,
    rating: number,
    comment: string
  ) => Promise<boolean>;

  alreadyReviewed: (
    orderId: string
  ) => Promise<boolean>;
}

const ReviewContext =
  createContext({} as ReviewContextType);

export function ReviewProvider({
  children,
}: any) {
  const { user } = useAuth();

  const createReview = async (
    orderId: string,
    establishmentId: string,
    rating: number,
    comment: string
  ) => {
    if (!user) return false;

    try {
      await ReviewRepository.createReview({
        orderId,
        establishmentId,
        customerId: user.id,
        rating,
        comment,
      });

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const alreadyReviewed = async (
    orderId: string
  ) => {
    return ReviewRepository.alreadyReviewed(
      orderId
    );
  };

  return (
    <ReviewContext.Provider
      value={{
        createReview,
        alreadyReviewed,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export const useReviews = () =>
  useContext(ReviewContext);