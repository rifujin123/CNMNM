import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";
function PlaceCard({ place, onPress }) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.card}>
        <View style={[styles.thumb, { backgroundColor: place.color }]} />
        <Text style={styles.name}>{place.name}</Text>
        <View style={styles.ratingLocationRow}>
          <Text style={styles.rating}>
            <FontAwesome name="star" size={16} color="#F59E0B" />
            {place.star_rating}
          </Text>
          <Text>
            <Entypo name="location-pin" size={12} color="black" />
            {place?.city?.name ?? "Unknown"}
          </Text>
        </View>

        <Text style={styles.price}>
          From <FontAwesome6 name="dong-sign" size={13} color="black" />
          {place.base_price}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default PlaceCard;

const styles = StyleSheet.create({
  card: {
    width: 180,
    height: 190,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginRight: 12,
  },
  thumb: {
    width: "100%",
    height: 96,
    borderRadius: 12,
  },
  name: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  rating: {
    color: "#F59E0B",
    fontWeight: "bold",
  },
  price: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "bold",
  },
  ratingLocationRow: {
    fontSize: 12,
    gap: 4,
    flexDirection: "row",
    alignItems: "center",
  },
});
