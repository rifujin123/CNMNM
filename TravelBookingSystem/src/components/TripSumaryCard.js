import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const normalizeStatus = (status) => String(status || "").toLowerCase();

const STATUS_LABELS = {
  upcoming: "Upcoming",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
  payment_failed: "Payment Failed",
  refunded: "Refunded",
};

const PAYMENT_LABELS = {
  unpaid: "Unpaid",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const getStatusLabel = (status) => {
  const key = normalizeStatus(status);
  return STATUS_LABELS[key] || status || "Unknown";
};

const getPaymentLabel = (status) => {
  const key = normalizeStatus(status);
  return PAYMENT_LABELS[key] || status || "Unknown";
};

const getBadgeStyle = (status) => {
  const key = normalizeStatus(status);

  if (key === "pending" || key === "upcoming") {
    return { backgroundColor: "#FEF3C7", color: "#B45309" };
  }

  if (key === "confirmed") {
    return { backgroundColor: "#DBEAFE", color: "#1D4ED8" };
  }

  if (key === "completed") {
    return { backgroundColor: "#DCFCE7", color: "#166534" };
  }

  if (
    key === "cancelled" ||
    key === "expired" ||
    key === "payment_failed" ||
    key === "refunded"
  ) {
    return { backgroundColor: "#FEE2E2", color: "#991B1B" };
  }

  return { backgroundColor: "#E5E7EB", color: "#374151" };
};

const getPaymentBadgeStyle = (status) => {
  const key = normalizeStatus(status);

  if (key === "paid") {
    return { backgroundColor: "#DCFCE7", color: "#166534" };
  }

  if (key === "unpaid") {
    return { backgroundColor: "#FEF3C7", color: "#B45309" };
  }

  if (key === "failed" || key === "refunded") {
    return { backgroundColor: "#FEE2E2", color: "#991B1B" };
  }

  return { backgroundColor: "#E5E7EB", color: "#374151" };
};

const TripSumaryCard = ({ trip, onPress }) => {
  const bookingBadge = getBadgeStyle(trip?.bookingStatus || trip?.status);
  const paymentBadge = getPaymentBadgeStyle(trip?.paymentStatus);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {trip?.title || "Untitled booking"}
          </Text>
          {trip?.serviceType ? (
            <Text style={styles.serviceType}>{trip.serviceType}</Text>
          ) : null}
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: bookingBadge.backgroundColor },
          ]}
        >
          <Text style={[styles.badgeText, { color: bookingBadge.color }]}>
            {getStatusLabel(trip?.bookingStatus || trip?.status)}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={scale(14)} color="#64748B" />
        <Text style={styles.infoText}>{trip?.date || "No date"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="card-outline" size={scale(14)} color="#64748B" />
        <View
          style={[
            styles.paymentBadge,
            { backgroundColor: paymentBadge.backgroundColor },
          ]}
        >
          <Text style={[styles.paymentBadgeText, { color: paymentBadge.color }]}>
            {getPaymentLabel(trip?.paymentStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.price}>
          <FontAwesome6 name="dong-sign" size={scale(12)} color="#0F172A" />{" "}
          {trip?.price || "0"}
        </Text>
        <Ionicons name="chevron-forward" size={scale(18)} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
};

export default memo(TripSumaryCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(18),
    padding: scale(14),
    marginBottom: verticalScale(14),
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    shadowOffset: { width: 0, height: verticalScale(3) },
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: scale(8),
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#0F172A",
  },
  serviceType: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(11),
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  badgeText: {
    fontSize: moderateScale(10),
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(8),
    gap: scale(5),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: "#64748B",
  },
  paymentBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(10),
  },
  paymentBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: "800",
  },
  bottomRow: {
    marginTop: verticalScale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#0F172A",
  },
});