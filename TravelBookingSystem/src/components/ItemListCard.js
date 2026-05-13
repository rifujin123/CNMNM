import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale } from "react-native-size-matters";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

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

function ItemListCard({ item, onPress, isWishlist, onWishlistToggle, onRequireLogin }) {
  const imageUri = getImageUri(item) || FALLBACK_IMAGE_URI;
  const rating = item?.star_rating || "N/A";
  const location = item?.city?.name || "Unknown location";
  const price = item?.base_price_display || `From $${item?.base_price || "N/A"}`;
  const category = item?.category?.name || item?.category_name || "Tour";
  const reviewCount = item?.comment_count || item?.review_count || 0;

  const handleWishlistPress = (e) => {
    e?.stopPropagation?.();
    if (!onWishlistToggle) {
      onRequireLogin?.();
      return;
    }
    onWishlistToggle(item);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Thumbnail - Square with rounded corners */}
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        <Pressable
          onPress={handleWishlistPress}
          style={styles.wishlistButton}
          hitSlop={8}
        >
          <Ionicons
            name={isWishlist ? "heart" : "heart-outline"}
            size={20}
            color={isWishlist ? "#EF4444" : "#fff"}
          />
        </Pressable>
      </View>

      {/* Content Area - Right */}
      <View style={styles.content}>
        {/* Headline */}
        <Text style={styles.headline} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color="#78716C" />
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </View>

        {/* Social Proof - Below Location */}
        <View style={styles.socialProofRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
          <Text style={styles.reviewText}>
            {reviewCount > 0 ? `${reviewCount} reviews` : "No reviews"}
          </Text>
        </View>

        {/* Price */}
        <Text style={styles.price}>{price}</Text>
      </View>
    </Pressable>
  );
}

export default ItemListCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    padding: scale(10),
    gap: scale(10),
    alignItems: "center",
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  // Thumbnail Container - Small square
  thumbnailContainer: {
    width: scale(90),
    height: scale(90),
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    bottom: scale(4),
    left: scale(4),
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: scale(5),
    paddingVertical: scale(2),
    borderRadius: 4,
  },
  categoryText: {
    fontSize: scale(8),
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  wishlistButton: {
    position: "absolute",
    top: scale(4),
    right: scale(4),
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  // Content Area
  content: {
    flex: 1,
    gap: scale(4),
  },

  // Headline
  headline: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: scale(18),
  },

  // Location
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(2),
  },
  locationText: {
    fontSize: scale(11),
    color: "#78716C",
  },

  // Social Proof
  socialProofRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: 6,
    gap: scale(2),
  },
  ratingText: {
    fontSize: scale(11),
    fontWeight: "700",
    color: "#92400E",
  },
  reviewText: {
    fontSize: scale(10),
    color: "#78716C",
  },

  // Price
  price: {
    fontSize: scale(12),
    fontWeight: "700",
    color: "#0F172A",
    marginTop: scale(2),
  },
});