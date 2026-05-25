import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#0D9488",
  secondary: "#F59E0B",
  text: "#1C1917",
  muted: "#78716C",
  surface: "#FFFFFF",
  border: "#E7E5E4",
  bg: "#F8FAFC",
  success: "#10B981",
  danger: "#EF4444",
};

const ServiceCard = ({
  item,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const getServiceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "hotel":
        return "office-building-outline";
      case "transport":
        return "bus-side";
      default:
        return "map-marker-path";
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Service",
      `Are you sure you want to delete "${item?.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await onDelete?.(item);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item?.image_url }} style={styles.image} />
        <View style={styles.typeBadge}>
          <MaterialCommunityIcons
            name={getServiceIcon(item?.type)}
            size={14}
            color="#FFF"
          />
          <Text style={styles.typeText}>{item?.type}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item?.name}
          </Text>
          <TouchableOpacity
            hitSlop={10}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            <Ionicons
              name={isDeleting ? "hourglass" : "trash-outline"}
              size={20}
              color={COLORS.danger}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={14} color={COLORS.secondary} />
            <Text style={styles.statText}>
              {Number(item?.rating).toFixed(1)}
            </Text>
          </View>
          <View style={styles.dot} />
          <Text style={styles.statText}>{item?.booking_count || 0} bookings</Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.priceValue}>{item?.base_price_display || "—"}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit?.(item)}
          >
            <Ionicons name="pencil-sharp" size={16} color={COLORS.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ServiceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 100,
    height: 110,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  typeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: "500",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}10`,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
