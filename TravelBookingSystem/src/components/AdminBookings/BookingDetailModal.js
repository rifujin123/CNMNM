import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import InfoRow from "../InfoRow";

export default function BookingDetailModal({
  booking,
  onClose,
  onRefund,
  isLoading,
  formatMoney,
  formatDateTime,
  getServiceType,
}) {
  if (!booking) return null;

  const canRefund =
    booking.payment_status === "paid" &&
    !["refunded", "completed", "cancelled", "expired"].includes(
      booking.booking_status
    );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking #{booking.id}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </Pressable>
          </View>

          <ScrollView>
            <InfoRow label="Customer" value={booking.user?.email || "N/A"} />
            <InfoRow label="Username" value={booking.user?.username || "N/A"} />
            <InfoRow label="Service" value={booking.service?.name || "N/A"} />
            <InfoRow label="Service Type" value={getServiceType(booking)} />
            <InfoRow label="Provider ID" value={String(booking.service?.provider || "N/A")} />
            <InfoRow label="Quantity" value={String(booking.quantity || 1)} />
            <InfoRow label="Total" value={formatMoney(booking.total_price)} />
            <InfoRow label="Booking Status" value={booking.booking_status} />
            <InfoRow label="Payment Status" value={booking.payment_status} />
            <InfoRow label="Created" value={formatDateTime(booking.created_date)} />
            <InfoRow label="Expires" value={formatDateTime(booking.expires_at)} />

            {booking.latest_payment ? (
              <>
                <Text style={styles.sectionTitle}>Latest Payment</Text>
                <InfoRow label="Payment ID" value={String(booking.latest_payment.id)} />
                <InfoRow label="Method" value={booking.latest_payment.payment_method} />
                <InfoRow label="Status" value={booking.latest_payment.payment_status} />
                <InfoRow label="Transaction" value={booking.latest_payment.transaction_id} />
              </>
            ) : (
              <Text style={styles.muted}>No payment found.</Text>
            )}

            {canRefund ? (
              <Pressable
                disabled={isLoading}
                style={[styles.refundButton, isLoading && styles.disabled]}
                onPress={onRefund}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Processing..." : "Refund Booking"}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  muted: {
    fontSize: 13,
    color: "#64748B",
  },
  refundButton: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },
  modalBox: {
    maxHeight: "86%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
});
