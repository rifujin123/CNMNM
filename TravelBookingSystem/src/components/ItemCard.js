import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
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

function ItemCard({ item, onPress }) {
  const imageUri = getPlaceImageUri(item) || FALLBACK_IMAGE_URI;

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.card}>
        <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
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
      </View>
    </TouchableWithoutFeedback>
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
