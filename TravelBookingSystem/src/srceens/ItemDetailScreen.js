import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchPlaceDetail } from "../api/services";
import Entypo from "@expo/vector-icons/Entypo";
const { width } = Dimensions.get("window");
const IMG_HEIGHT = 300;
const FALLBACK_IMAGE_URI =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const ItemDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const placeId = route.params?.placeId;
  const [place, setPlace] = useState(null);
  const [isDescriptionModalVisible, setDescriptionModalVisible] =
    useState(false);

  const scrollRef = useAnimatedRef();
  const scrollOffset = useScrollViewOffset(scrollRef);

  useEffect(() => {
    if (!placeId) return;
    const loadPlaceDetail = async () => {
      try {
        const detail = await fetchPlaceDetail(placeId);
        setPlace(detail);
        console.log(detail);
      } catch (error) {
        console.error("Failed to load place detail:", error);
      }
    };

    loadPlaceDetail();
  }, [placeId]);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  const imageUri =
    place?.image ||
    place?.image_url ||
    place?.thumbnail ||
    place?.thumbnail_url ||
    FALLBACK_IMAGE_URI;
  const description = place?.description ?? "";
  const shouldShowSeeAll = description.length > 120;

  return (
    <View style={styles.container}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <View style={styles.imageContainer}>
          <Animated.Image
            style={[styles.image, imageAnimatedStyle]}
            source={{
              uri: imageUri,
            }}
          />
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{place?.name}</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.badgeContainer}>
              <Text style={styles.ratingText}>{place?.star_rating}/5</Text>
            </View>
            <Pressable>
              <Text style={styles.reviewLink}>
                {place?.comment_count} reviews
              </Text>
            </Pressable>
          </View>
          <View style={styles.locationContainer}>
            <Text>
              <Entypo name="location" size={14} color="black" />{" "}
            </Text>
            <Text>{place?.city?.name}</Text>
          </View>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText} numberOfLines={3}>
              {description || "No description available."}
            </Text>
            {shouldShowSeeAll && (
              <Pressable onPress={() => setDescriptionModalVisible(true)}>
                <Text style={styles.seeAllLink}>See all</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      <Modal
        visible={isDescriptionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDescriptionModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Description</Text>
            <Text style={styles.modalDescription}>{description}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setDescriptionModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ItemDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: width,
    height: IMG_HEIGHT,
  },
  imageContainer: {
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    paddingHorizontal: 16,
    height: 2000,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  rating: {
    fontWeight: "bold",
    color: "#F59E0B",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#CC66FF",
    alignSelf: "flex-start",
  },
  badgeContainer: {
    backgroundColor: "#FFCCFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reviewLink: {
    color: "#000",
    textDecorationLine: "underline",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  descriptionCard: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  seeAllLink: {
    marginTop: 8,
    color: "#2563EB",
    fontWeight: "600",
    textDecorationLine: "underline",
    alignSelf: "flex-start",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#334155",
  },
  closeButton: {
    marginTop: 16,
    alignSelf: "flex-end",
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
