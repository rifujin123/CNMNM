import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";

const FALLBACK_IMAGE_URI =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const getPlaceImageUri = (item) => {
  const candidates = [
    item?.image,
    item?.image_url,
    item?.thumbnail,
    item?.thumbnail_url,
  ];
  return candidates.find((uri) => typeof uri === "string" && uri.trim());
};

function ItemCard({ item, onPress, isWishlist, onWishlistToggle, onRequireLogin }) {
  const imageUri = getPlaceImageUri(item) || FALLBACK_IMAGE_URI;

  const handleWishlistPress = (e) => {
    e?.stopPropagation?.();
    const tourId = item?.id;
    if (!tourId){
      return;
    }
    if (!onWishlistToggle) {
      onRequireLogin?.({
        type: "wishlist",
        tourId,
      });
      return;
    }
    onWishlistToggle(item);
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
      </Pressable>
      <Pressable onPress={onPress} style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.ratingLocationRow}>
          <Text style={styles.rating}>
            <FontAwesome name="star" size={16} color="#F59E0B" />
            {item.star_rating}
          </Text>
          <Text>
            <Entypo name="location-pin" size={12} color="black" />
            {item?.city?.name ?? "Unknown"}
          </Text>
        </View>

        <Text style={styles.price}>
          From <FontAwesome6 name="dong-sign" size={13} color="black" />
          {item.base_price}
        </Text>
      </Pressable>
      <Pressable
        onPress={handleWishlistPress}
        style={styles.wishlistButton}
        hitSlop={8}
      >
        <Entypo
          name={isWishlist ? "heart" : "heart-outlined"}
          size={20}
          color={isWishlist ? "#EF4444" : "#fff"}
        />
      </Pressable>
    </View>
  );
}

export default ItemCard;

const styles = StyleSheet.create({
  card: {
    width: 180,
    height: 190,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginRight: 12,
  },
  imageContainer: {
    position: "relative",
  },
  thumb: {
    width: "100%",
    height: 96,
    borderRadius: 12,
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  content: {
    flex: 1,
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