import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";

const FALLBACK_IMAGE_URI =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const getImageUri = (item) => {
  const candidates = [
    item?.image,
    item?.image_url,
    item?.thumbnail,
    item?.thumbnail_url,
  ];

  return candidates.find((uri) => typeof uri === "string" && uri.trim());
};

const getPriceText = (item) => {
  if (item?.base_price_display) return item.base_price_display;
  if (item?.base_price) return `From ${Number(item.base_price).toLocaleString("vi-VN")} VND`;
  return "Price unavailable";
};

function ItemCardSave({ item, onPress }) {
  const imageUri = getImageUri(item) || FALLBACK_IMAGE_URI;
  const title = item?.name || "Untitled tour";
  const location = item?.city?.name || "Unknown location";
  const rating = item?.star_rating || "N/A";
  const price = getPriceText(item);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>

        <View style={styles.rating}>
          <Ionicons name="star" size={scale(14)} color="#F59E0B" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>

        <Text style={styles.price} numberOfLines={1}>
          {price}
        </Text>
      </View>
    </Pressable>
  );
}

export default ItemCardSave;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    marginBottom: scale(20),
  },
  image: {
    width: scale(90),
    height: verticalScale(90),
    borderRadius: scale(12),
    backgroundColor: "#E2E8F0",
  },
  info: {
    marginLeft: scale(12),
    flex: 1,
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#0F172A",
  },
  location: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    marginTop: verticalScale(4),
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(6),
  },
  ratingText: {
    marginLeft: scale(4),
    fontSize: moderateScale(14),
    color: "#4B5563",
    fontWeight: "600",
  },
  price: {
    fontSize: moderateScale(15),
    marginTop: verticalScale(6),
    fontWeight: "700",
    color: "#0F172A",
  },
});