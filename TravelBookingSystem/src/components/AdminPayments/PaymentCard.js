import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import InfoRow from "../InfoRow";

export default function PaymentCard({
  payment,
  isLoading,
  onConfirm,
  onFailed,
  formatMoney,
  formatDateTime,
}) {
  const canReview = ["PROCESSING", "REVIEW", "PENDING"].includes(
    payment.payment_status
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.amount}>
            {formatMoney(payment.amount, payment.currency)}
          </Text>
          <Text style={styles.meta}>Payment #{payment.id}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{payment.payment_status}</Text>
        </View>
      </View>

      <InfoRow label="Booking ID" value={String(payment.booking)} />
      <InfoRow label="Method" value={payment.payment_method} />
      <InfoRow label="Transaction ID" value={payment.transaction_id} />
      <InfoRow label="Created At" value={formatDateTime(payment.created_at)} />
      <InfoRow label="Expires At" value={formatDateTime(payment.expires_at)} />

      {canReview ? (
        <View style={styles.actions}>
          <Pressable
            disabled={isLoading}
            style={[styles.failedButton, isLoading && styles.disabled]}
            onPress={onFailed}
          >
            <Text style={styles.buttonText}>Mark Failed</Text>
          </Pressable>

          <Pressable
            disabled={isLoading}
            style={[styles.confirmButton, isLoading && styles.disabled]}
            onPress={onConfirm}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Processing..." : "Confirm Success"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  amount: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
  },
  meta: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#B45309",
  },
  actions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  failedButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#16A34A",
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
});
