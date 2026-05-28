import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import InfoRow from "../InfoRow";

export default function BookingCard({
  booking,
  isLoading,
  onPress,
  onRefund,
  formatMoney,
  formatDateTime,
  getServiceType,
}) {
  const canRefund =
    booking.payment_status === "paid" &&
    !["refunded", "completed", "cancelled", "expired"].includes(
      booking.booking_status
    );

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            #{booking.id} {booking.service?.name || "Untitled service"}
          </Text>
          <Text style={styles.meta}>
            {getServiceType(booking)} - {booking.user?.email || "No email"}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{booking.booking_status}</Text>
        </View>
      </View>

      <InfoRow label="Total" value={formatMoney(booking.total_price)} />
      <InfoRow label="Payment" value={booking.payment_status} />
      <InfoRow label="Created" value={formatDateTime(booking.created_date)} />

      {canRefund ? (
        <Pressable
          disabled={isLoading}
          style={[styles.refundButton, isLoading && styles.disabled]}
          onPress={onRefund}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Processing..." : "Refund"}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 14, padding: 14, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#0F172A" },
  meta: { marginTop: 4, fontSize: 13, color: "#64748B" },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "#DBEAFE" },
  badgeText: { fontSize: 11, fontWeight: "900", color: "#1D4ED8" },
  refundButton: { marginTop: 12, minHeight: 46, borderRadius: 10, backgroundColor: "#DC2626", alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.6 },
});
