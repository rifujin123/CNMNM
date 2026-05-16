import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePlaceDetail } from "../hooks/useTours";
import { useAuth } from "../../context/AuthContext";

const FALLBACK_IMAGE_URI =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

export default function ItemDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isLoggedIn } = useAuth();

  const itemId = route.params?.itemId ?? route.params?.ItemId;
  const initialPackageId = route.params?.selectedPackageId;

  const { data: place, isLoading, isError } = usePlaceDetail(itemId);
  const [selectedPackageId, setSelectedPackageId] = useState(
    initialPackageId ?? null
  );

  useEffect(() => {
    if (place?.tour_package?.length > 0 && !selectedPackageId) {
      setSelectedPackageId(place.tour_package[0].id);
    }
  }, [place?.tour_package, selectedPackageId]);

  const selectedPackage = place?.tour_package?.find(
    (pkg) => String(pkg.id) === String(selectedPackageId)
  );

  const imageUri =
    place?.image ||
    place?.image_url ||
    place?.thumbnail ||
    place?.thumbnail_url ||
    FALLBACK_IMAGE_URI;

  const handleBookNow = () => {
    if (!isLoggedIn) {
      navigation.getParent()?.getParent()?.navigate("Login");
      return;
    }

    if (!place || !selectedPackage) {
      Alert.alert("Choose a package", "Please choose a package before booking.");
      return;
    }

    navigation.navigate("BookingCheckout", {
      service: place,
      selectedPackage,
      quantity: 1,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.mutedText}>Loading tour...</Text>
      </View>
    );
  }

  if (isError || !place) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Cannot load tour detail</Text>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.title}>{place.name}</Text>
        <Text style={styles.location}>
          {place?.city?.name || "Unknown location"}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>
            {place?.star_rating || "N/A"} · {place?.comment_count || 0} reviews
          </Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {place?.description || "No description available."}
        </Text>

        <Text style={styles.sectionTitle}>Choose package</Text>

        {place?.tour_package?.length > 0 ? (
          place.tour_package.map((pkg) => {
            const isSelected = String(pkg.id) === String(selectedPackageId);

            return (
              <Pressable
                key={pkg.id}
                onPress={() => setSelectedPackageId(pkg.id)}
                style={[
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                ]}
              >
                <View style={styles.packageHeader}>
                  <View>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packageSubText}>
                      Package price: {pkg.price_display || pkg.price}
                    </Text>
                  </View>

                  <Ionicons
                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={isSelected ? "#0D9488" : "#94A3B8"}
                  />
                </View>

                <Text style={styles.packagePrice}>
                  Total: {pkg.total_price_display || pkg.price_display || "N/A"}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.mutedText}>No packages available.</Text>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Selected</Text>
          <Text style={styles.priceValue}>
            {selectedPackage?.total_price_display ||
              selectedPackage?.price_display ||
              place?.base_price_display ||
              "N/A"}
          </Text>
        </View>

        <Pressable
          disabled={!selectedPackage}
          onPress={handleBookNow}
          style={[
            styles.bookButton,
            !selectedPackage && styles.bookButtonDisabled,
          ]}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingBottom: 120 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  image: { width: "100%", height: 280, backgroundColor: "#E2E8F0" },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { 
    marginTop: 18, 
    paddingHorizontal: 16, 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#0F172A" 
  },
  location: { 
    marginTop: 6, 
    paddingHorizontal: 16, 
    fontSize: 14, 
    color: "#64748B" 
  },
  ratingRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    paddingHorizontal: 16, 
    marginTop: 10 
  },
  ratingText: { 
    fontSize: 14, 
    color: "#475569", 
    fontWeight: "600" 
  },
  sectionTitle: { 
    marginTop: 24, 
    paddingHorizontal: 16, 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#0F172A" 
  },
  description: { 
    marginTop: 8, 
    paddingHorizontal: 16, 
    fontSize: 14, 
    lineHeight: 21, 
    color: "#475569" 
  },
  packageCard: { 
    marginHorizontal: 16, 
    marginTop: 12, 
    padding: 14, 
    borderRadius: 14, 
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#E2E8F0" 
  },
  packageCardSelected: { 
    borderColor: "#0D9488", 
    backgroundColor: "#ECFDF5" 
  },
  packageHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: 12 
  },
  packageName: { 
    fontSize: 16, 
    fontWeight: "800", 
    color: "#0F172A" 
  },
  packageSubText: { 
    marginTop: 4, 
    fontSize: 13, 
    color: "#64748B" 
  },
  packagePrice: { 
    marginTop: 10, 
    fontSize: 15, 
    fontWeight: "800", 
    color: "#0D9488" 
  },
  mutedText: { 
    marginTop: 8, 
    paddingHorizontal: 16, 
    fontSize: 14, 
    color: "#64748B" 
  },
  bottomSpace: { 
    height: 24 
  },
  bottomBar: { 
    position: "absolute", 
    left: 0, right: 0, 
    bottom: 0, 
    padding: 16, 
    paddingBottom: 24, 
    backgroundColor: "#fff", 
    borderTopWidth: 1, 
    borderTopColor: "#E2E8F0", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: 12 },
  priceLabel: { fontSize: 12, color: "#64748B" },
  priceValue: { marginTop: 2, fontSize: 18, fontWeight: "900", color: "#0F172A" },
  bookButton: { height: 50, paddingHorizontal: 24, borderRadius: 14, backgroundColor: "#0D9488", alignItems: "center", justifyContent: "center" },
  bookButtonDisabled: { opacity: 0.5 },
  bookButtonText: { fontSize: 15, fontWeight: "900", color: "#fff" },
  secondaryButton: { marginTop: 16, height: 46, paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
});