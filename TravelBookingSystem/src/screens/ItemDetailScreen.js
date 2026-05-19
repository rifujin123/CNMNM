import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Modal,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
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
const { width, height } = Dimensions.get("window");
const IMG_HEIGHT = height * 0.45;
const FALLBACK_IMAGE_URI =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

// Luxury tropical travel aesthetic
const COLORS = {
  primary: "#0D9488", // Deep teal
  secondary: "#F59E0B", // Golden amber
  accent: "#F97316", // Vibrant orange
  dark: "#0F172A",
  light: "#FEF3C7",
  surface: "#FAFAF9",
  text: "#1C1917",
  muted: "#78716C",
  overlay: "rgba(15, 23, 42, 0.75)",
};

const ItemDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const ItemId = route.params?.ItemId;
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescriptionModalVisible, setDescriptionModalVisible] =
    useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const scrollRef = useAnimatedRef();
  const scrollOffset = useScrollViewOffset(scrollRef);

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPlaceDetail(ItemId);
        if (active) setPlace(data);
      } catch (err) {
        console.error("Fetch place detail error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (ItemId) loadDetail();

    return () => {
      active = false;
    };
  }, [ItemId]);

  useEffect(() => {
    if (place?.tour_package?.length > 0 && !selectedPackageId) {
      setSelectedPackageId(place.tour_package[0].id);
    }
  }, [place?.tour_package]);

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

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollOffset.value,
      [-IMG_HEIGHT, 0, IMG_HEIGHT],
      [40, 0, -20],
    );
    return { transform: [{ translateY }] };
  });

  const imageUri =
    place?.image ||
    place?.image_url ||
    place?.thumbnail ||
    place?.thumbnail_url ||
    FALLBACK_IMAGE_URI;
  const description = place?.description ?? "";
  const shouldShowSeeAll = description.length > 120;
  const selectedPackage = place?.tour_package?.find(
    (pkg) => pkg.id === selectedPackageId,
  );
  const packageCount = place?.tour_package?.length || 0;
  const rating = Number(place?.star_rating || 0).toFixed(1);
  const cityName = place?.city?.name || "Unknown location";
  const selectedPrice =
    selectedPackage?.total_price_display ||
    selectedPackage?.price_display ||
    place?.base_price_display ||
    "N/A";

  const formatPackageSubtitle = (pkg) => {
    const parts = [];
    if (pkg.duration) parts.push(pkg.duration);
    if (pkg.max_people) parts.push(`${pkg.max_people} guests`);
    return parts.join(" • ") || "Curated travel experience";
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Parallax Hero Image */}
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Animated.Image
            style={[styles.heroImage, imageAnimatedStyle]}
            source={{ uri: imageUri }}
          />
          <View style={styles.heroOverlay} />

          <TouchableOpacity
            style={styles.floatingBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.heroLocation}>
              <Entypo name="location-pin" size={14} color={COLORS.light} />
              {" "}{cityName}
            </Text>
            <Text style={styles.heroTitle}>{place?.name}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Text style={styles.ratingPillText}>{rating}</Text>
              </View>
              <View style={styles.reviewPill}>
                <Text style={styles.reviewPillText}>{place?.comment_count || 0} reviews</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
          {/* About Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>About This Journey</Text>
              {shouldShowSeeAll && (
                <Pressable onPress={() => setDescriptionModalVisible(true)}>
                  <Text style={styles.seeAllLink}>Read more</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>{description || "A curated travel experience awaits..."}</Text>
            </View>
          </View>

          {/* Tour Packages Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Choose Your Package</Text>
              <View style={styles.packageCountBadge}>
                <Text style={styles.packageCountText}>{packageCount} options</Text>
              </View>
            </View>
            {packageCount > 0 ? (
              place.tour_package.map((pkg, index) => (
                <Pressable
                  key={pkg.id}
                  style={({ pressed }) => [
                    styles.packageCard,
                    selectedPackageId === pkg.id && styles.packageCardSelected,
                    pressed && styles.packageCardPressed,
                  ]}
                  onPress={() => setSelectedPackageId(pkg.id)}
                >
                  <View style={styles.packageHeader}>
                    <View style={styles.packageRadio}>
                      <View
                        style={[
                          styles.radioOuter,
                          selectedPackageId === pkg.id && styles.radioOuterSelected,
                        ]}
                      >
                        {selectedPackageId === pkg.id && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </View>
                    <View style={styles.packageInfo}>
                      <View>
                        <Text style={styles.packageName}>{pkg.name}</Text>
                        <Text style={styles.packageSubtitle}>
                          {formatPackageSubtitle(pkg)}
                        </Text>
                      </View>
                      <View style={styles.packagePriceContainer}>
                        <Text style={[
                          styles.packagePrice,
                          selectedPackageId === pkg.id && styles.packagePriceSelected,
                        ]}>
                          {pkg.price_display}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Expandable details */}
                  {selectedPackageId === pkg.id && (
                    <View style={styles.packageDetails}>
                      <View style={styles.packageDetailRow}>
                        <Text style={styles.packageDetailLabel}>Type</Text>
                        <Text style={styles.packageDetailValue}>{pkg.type || "Standard"}</Text>
                      </View>
                      {pkg.inclusions && (
                        <View style={styles.packageInclusions}>
                          <Text style={styles.packageDetailLabel}>Inclusions</Text>
                          <Text style={styles.packageInclusionsText}>{pkg.inclusions}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Pressable>
              ))
            ) : (
              <View style={styles.noPackagesCard}>
                <Ionicons name="compass-outline" size={40} color={COLORS.muted} />
                <Text style={styles.noPackagesText}>Custom packages available</Text>
                <Text style={styles.noPackagesSubtext}>Contact us for personalized options</Text>
              </View>
            )}
          </View>

          {/* Spacer for bottom bar */}
          <View style={styles.bottomSpacer} />
        </Animated.View>
      </Animated.ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total from</Text>
            <Text style={styles.priceValue}>{selectedPrice}</Text>
            {selectedPackage && (
              <Text style={styles.priceNote}>per person</Text>
            )}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.purchaseButton,
              pressed && styles.purchaseButtonPressed,
            ]}
          >
            <Text style={styles.purchaseButtonText}>Book Now</Text>
          </Pressable>
        </View>
      </View>

      {/* Description Modal */}
      <Modal
        visible={isDescriptionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDescriptionModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropPress}
            onPress={() => setDescriptionModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About This Journey</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setDescriptionModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>{description}</Text>
            <Pressable
              style={styles.modalActionButton}
              onPress={() => setDescriptionModalVisible(false)}
            >
              <Text style={styles.modalActionText}>Got it</Text>
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
    backgroundColor: COLORS.surface,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },

  // Hero Section
  heroContainer: {
    position: "relative",
    height: IMG_HEIGHT,
  },
  heroImage: {
    width: width,
    height: IMG_HEIGHT + 50,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  floatingBackButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 30,
    elevation: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Hero Content
  heroContent: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  heroLocation: {
    fontSize: 14,
    color: COLORS.light,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroMeta: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  ratingPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.dark,
  },
  reviewPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reviewPillText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },

  // Main Content
  contentContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 16,
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E7E5E4",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // About Card
  aboutCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
  },

  // Amenities
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  amenityItem: {
    width: (width - 44) / 2,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  amenityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  amenityLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },

  // Package Section
  packageCountBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  packageCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  packageCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  packageCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  packageRadio: {
    marginRight: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D6D3D1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  packageInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  packageSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  packagePriceContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  packagePriceSelected: {
    color: COLORS.primary,
  },

  // Package Details
  packageDetails: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E7E5E4",
  },
  packageDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  packageDetailLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  packageDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  packageInclusions: {
    marginTop: 4,
  },
  packageInclusionsText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },

  // No Packages
  noPackagesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  noPackagesText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
  },
  noPackagesSubtext: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },

  // Bottom Bar
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E7E5E4",
    paddingBottom: 14,
  },
  bottomContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  priceNote: {
    fontSize: 11,
    color: COLORS.muted,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  purchaseButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  purchaseButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBackdropPress: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D6D3D1",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
  },
  modalActionButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
