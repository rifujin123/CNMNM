import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
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
const { width } = Dimensions.get("window");
const IMG_HEIGHT = 300;

const ItemDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const placeId = route.params?.placeId;
  const [place, setPlace] = useState(null);

  const scrollRef = useAnimatedRef();
  const scrollOffset = useScrollViewOffset(scrollRef);

  useEffect(() => {
    const loadPlaceDetail = async () => {
      try {
        const detail = await fetchPlaceDetail(placeId);
        setPlace(detail);
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

  return (
    <View style={styles.container}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <View style={styles.imageContainer}>
          <Animated.Image
            style={[styles.image, imageAnimatedStyle]}
            source={{
              uri: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
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
          <Text>{place?.name ?? "Loading..."}</Text>
          <Text>{place?.city?.name ?? ""}</Text>
          <Text>{place?.star_rating}</Text>
          <Text>{place?.description}</Text>
        </View>
      </Animated.ScrollView>
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
    height: 2000,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 16,
  },
});
