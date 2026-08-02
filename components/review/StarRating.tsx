import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  rating: number;
  onChange: (rating: number) => void;
}

export default function StarRating({
  rating,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      {[1,2,3,4,5].map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
        >
          <Text
            style={[
              styles.star,
              star <= rating && styles.active
            ]}
          >
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flexDirection:"row",
    justifyContent:"center",
    marginVertical:25,
  },

  star:{
    fontSize:42,
    color:"#D1D5DB",
    marginHorizontal:4,
  },

  active:{
    color:"#FBBF24",
  },
});