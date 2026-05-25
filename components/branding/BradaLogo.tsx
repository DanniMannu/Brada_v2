import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type BradaLogoProps = {
  /** tamanho do logo */
  size?: "small" | "medium" | "large";
  /** centralizar logo horizontalmente */
  center?: boolean;
};

export default function BradaLogo({
  size = "large",
  center = true,
}: BradaLogoProps) {
  // =====================
  // LOGO ANIMATION
  // =====================
  const logoTranslateX = useSharedValue(-80);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoTranslateX.value = withTiming(0, { duration: 900 });
    logoOpacity.value = withTiming(1, { duration: 900 });
  }, [logoOpacity, logoTranslateX]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateX: logoTranslateX.value }],
  }));

  return (
    <Animated.Text
      style={[styles.logo, styles[size], center && styles.center, logoStyle]}
    >
      Brada.
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    color: "#782726",
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  /* tamanhos */
  small: {
    fontSize: 32,
  },
  medium: {
    fontSize: 42,
  },
  large: {
    fontSize: 50,
  },

  center: {
    textAlign: "center",
  },
});
