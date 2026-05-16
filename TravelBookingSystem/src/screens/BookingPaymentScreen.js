import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { usePayment } from "../hooks/usePayments";

const COLORS = {
  primary: "#0D9488",
  dark: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: "#F8FAFC",
  white: "#FFFFFF",
  warning: "#F59E0B",
  success: "#16A34A",
  danger: "#DC2626",
};

const formatMoney = (value, currency = "VND") => {
  const number = Number(value || 0);
  return `${number.toLocaleString("vi-VN")} ${currency}`;
};

const getPaymentBadge = (status) => {
  if (status === "SUCCESS") {
    return {
      label: "Paid",
      backgroundColor: "#DCFCE7",
      color: COLORS.success,
    };
  }

  if (status === "FAILED" || status === "CANCELLED" || status === "EXPIRED") {
    return {
      label: status,
      backgroundColor: "#FEE2E2",
      color: COLORS.danger,
    };
  }

  return {
    label: status || "PROCESSING",
    backgroundColor: "#FEF3C7",
    color: COLORS.warning,
  };
};

export default function BookingPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    bookingId,
    paymentId,
    payment: initialPayment,
  } = route.params ?? {};

  const shouldFetchPayment = !initialPayment && Boolean(paymentId);

  const {
    data: fetchedPayment,
    isLoading,
    isError,
    refetch,
  } = usePayment(paymentId, {
    enabled: shouldFetchPayment,
  });

  const payment = initialPayment || fetchedPayment;

  const transferContent = useMemo(() => {
    return (
      payment?.metadata?.transfer_content ||
      payment?.transaction_id ||
      "N/A"
    );
  }, [payment]);

  const badge = getPaymentBadge(payment?.payment_status);

  const goToTrips = () => {
    const tabs = navigation.getParent();

    navigation.popToTop();

    tabs?.navigate("TripTab", {
        screen: "TripsHome",
        params: {
        bookingId,
        paymentId,
        },
    });
};

  const goHome = () => {
    const tabs = navigation.getParent();

    navigation.popToTop();

    tabs?.navigate("HomeFeed", {
        screen: "Home",
    });
};

  if (isLoading && !payment) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.stateText}>Loading payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if ((isError || !payment) && !initialPayment) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
          </Pressable>
          <Text style={styles.headerTitle}>Payment</Text>
        </View>

        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Payment not found</Text>
          <Text style={styles.stateText}>
            We could not load this payment. Please try again or check your trips.
          </Text>

          <Pressable style={styles.primaryButton} onPress={refetch}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={goToTrips}>
            <Text style={styles.secondaryButtonText}>View My Trips</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons name="qr-code-outline" size={34} color={COLORS.primary} />
          </View>

          <Text style={styles.statusTitle}>Static QR Payment</Text>
          <Text style={styles.statusText}>
            Transfer with the content below. Your booking will be confirmed after the provider verifies the payment.
          </Text>

          <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow
            label="Amount"
            value={formatMoney(payment?.amount, payment?.currency)}
            strong
          />
          <InfoRow label="Currency" value={payment?.currency || "VND"} />
          <InfoRow label="Transaction ID" value={payment?.transaction_id || "N/A"} />
          <InfoRow label="Transfer Content" value={transferContent} strong />
          <InfoRow label="Payment Method" value={payment?.payment_method || "STATIC_QR"} />
          <InfoRow label="Payment Status" value={payment?.payment_status || "PROCESSING"} />
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.noteText}>
            Do not close your booking manually. Static QR payments are confirmed by provider or admin only.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.primaryButton} onPress={goToTrips}>
          <Text style={styles.primaryButtonText}>View My Trips</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={goHome}>
          <Text style={styles.secondaryButtonText}>Back Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, strong = false }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, strong && styles.infoValueStrong]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    height: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.dark,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 150,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.dark,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.muted,
    textAlign: "center",
  },
  badge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
  },
  infoValueStrong: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primary,
  },
  noteBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    flexDirection: "row",
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.dark,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.white,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.dark,
  },
  centerState: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.dark,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.muted,
    textAlign: "center",
  },
});