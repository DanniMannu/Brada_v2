import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { OrderProvider } from "@/context/OrderContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { ReviewProvider } from "@/context/ReviewContext";
import { Stack } from "expo-router";


import { CouponProvider } from "@/context/CouponContext";

/*antes
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}*/
//Depois

export default function RootLayout() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <FavoritesProvider>
          <ReviewProvider>
            <CouponProvider>
            <CartProvider>
              <OrderProvider>
                
                <Stack 
                  screenOptions={{
                      headerShown: false,
                  }}
                />
              </OrderProvider>
            </CartProvider>
            </CouponProvider>
            </ReviewProvider>
          </FavoritesProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}