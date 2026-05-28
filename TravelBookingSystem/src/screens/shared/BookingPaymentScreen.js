import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCancelPayment, usePayment } from "../../hooks/usePayments";
import { formatDateTime, formatMoney } from "../../utils/format";

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

const FAILED_STATUSES = ["FAILED", "CANCELLED", "EXPIRED"];

const getMethodLabel = (method) => {
  if (method === "STATIC_QR") return "Static QR";
  return "Static QR";
};

const getPaymentBadge = (status) => {
  if (status === "SUCCESS") {
    return {
      label: "Paid",
      backgroundColor: "#DCFCE7",
      color: COLORS.success,
    };
  }

  if (status === "REVIEW") {
    return {
      label: "Review",
      backgroundColor: "#FEF3C7",
      color: COLORS.warning,
    };
  }

  if (FAILED_STATUSES.includes(status)) {
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

const getStatusContent = (payment) => {
  const method = payment?.payment_method;
  const status = payment?.payment_status;

  if (status === "SUCCESS") {
    return {
      icon: "checkmark-circle-outline",
      title: "Payment successful",
      text: "Your booking has been paid and confirmed.",
      color: COLORS.success,
      backgroundColor: "#DCFCE7",
    };
  }

  if (status === "REVIEW") {
    return {
      icon: "alert-circle-outline",
      title: "Payment under review",
      text: "This payment needs admin review before your booking can be confirmed.",
      color: COLORS.warning,
      backgroundColor: "#FEF3C7",
    };
  }

  if (FAILED_STATUSES.includes(status)) {
    return {
      icon: "close-circle-outline",
      title: "Payment not completed",
      text: "This payment was not completed. Please create a new booking if you still want this service.",
      color: COLORS.danger,
      backgroundColor: "#FEE2E2",
    };
  }

  if (method === "STATIC_QR") {
    return {
      icon: "qr-code-outline",
      title: "Static QR Payment",
      text: "Transfer to the platform account with the content below. Admin will confirm after checking the transaction.",
      color: COLORS.primary,
      backgroundColor: "#CCFBF1",
    };
  }

  return {
    icon: "qr-code-outline",
    title: "Static QR Payment",
    text: "Transfer to the platform account with the content below. Admin will confirm after checking the transaction.",
    color: COLORS.primary,
    backgroundColor: "#CCFBF1",
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

  const resolvedPaymentId = paymentId || initialPayment?.id;

  const {
    data: payment,
    isLoading,
    isError,
    refetch,
  } = usePayment(resolvedPaymentId, {
    enabled: Boolean(resolvedPaymentId),
    initialData: initialPayment,
  });

  const cancelPaymentAction = useCancelPayment();

  const transferContent = useMemo(() => {
    return payment?.metadata?.transfer_content || payment?.transaction_id || "N/A";
  }, [payment]);

  const qrUrl = payment?.metadata?.qr_url || payment?.payment_url;
  const status = payment?.payment_status || "PROCESSING";
  const method = payment?.payment_method || "STATIC_QR";
  const isStaticQr = method === "STATIC_QR";
  const isFailed = FAILED_STATUSES.includes(status);
  const canCancelStaticQr = isStaticQr && ["PENDING", "PROCESSING"].includes(status);
  const badge = getPaymentBadge(status);
  const statusContent = getStatusContent(payment);

  const goToTrips = () => {
    const tabs = navigation.getParent();

    navigation.popToTop();

    tabs?.navigate("TripTab", {
      screen: "TripsHome",
      params: {
        bookingId,
        paymentId: resolvedPaymentId,
      },
    });
  };

  const goToTripDetail = () => {
    const tabs = navigation.getParent();

    navigation.popToTop();

    tabs?.navigate("TripTab", {
      screen: "TripDetail",
      params: {
        bookingId,
        paymentId: resolvedPaymentId,
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

  const handleCancelPayment = () => {
    Alert.alert(
      "Cancel payment",
      "This will cancel the current Static QR payment and release the booking inventory.",
      [
        { text: "Keep Payment", style: "cancel" },
        {
          text: "Cancel Payment",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelPaymentAction.execute({
                paymentId: resolvedPaymentId,
              });
              await refetch();
            } catch (err) {
              const detail = err?.response?.data?.detail || err?.message;
              Alert.alert("Cannot cancel payment", detail || "Please try again.");
            }
          },
        },
      ],
    );
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
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: statusContent.backgroundColor },
            ]}
          >
            <Ionicons
              name={statusContent.icon}
              size={34}
              color={statusContent.color}
            />
          </View>

          <Text style={styles.statusTitle}>{statusContent.title}</Text>
          <Text style={styles.statusText}>{statusContent.text}</Text>

          <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        {isStaticQr ? (
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>Scan to Pay</Text>

            {qrUrl ? (
              <Image
                source={{ uri: qrUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code-outline" size={52} color={COLORS.muted} />
                <Text style={styles.qrPlaceholderText}>
                  QR image is not available for this payment.
                </Text>
              </View>
            )}

            <Text style={styles.qrHint}>
              Open your banking app and scan this QR code.
            </Text>
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <InfoRow
            label="Amount"
            value={formatMoney(payment?.amount, payment?.currency)}
            strong
          />
          <InfoRow label="Payment Method" value={getMethodLabel(method)} />
          <InfoRow label="Payment Status" value={status} />
          <InfoRow label="Transaction ID" value={payment?.transaction_id || "N/A"} />

          {isStaticQr ? (
            <InfoRow label="Transfer Content" value={transferContent} strong />
          ) : null}

          {payment?.provider_transaction_id ? (
            <InfoRow
              label="Bank Transaction"
              value={payment.provider_transaction_id}
            />
          ) : null}

          <InfoRow label="Expires At" value={formatDateTime(payment?.expires_at)} />
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.noteText}>
            Static QR payments are received by the platform account and confirmed by admin only.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {status === "SUCCESS" ? (
          <Pressable style={styles.primaryButton} onPress={goToTripDetail}>
            <Text style={styles.primaryButtonText}>View Trip Detail</Text>
          </Pressable>
        ) : null}

        {isFailed ? (
          <Pressable style={styles.primaryButton} onPress={goHome}>
            <Text style={styles.primaryButtonText}>Book Again</Text>
          </Pressable>
        ) : null}

        {canCancelStaticQr ? (
          <Pressable
            style={[
              styles.dangerButton,
              cancelPaymentAction.isPending && styles.disabledButton,
            ]}
            disabled={cancelPaymentAction.isPending}
            onPress={handleCancelPayment}
          >
            <Text style={styles.dangerButtonText}>
              {cancelPaymentAction.isPending ? "Cancelling..." : "Cancel Payment"}
            </Text>
          </Pressable>
        ) : null}

        {status !== "SUCCESS" ? (
          <Pressable style={styles.secondaryButton} onPress={goToTrips}>
            <Text style={styles.secondaryButtonText}>View My Trips</Text>
          </Pressable>
        ) : null}
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
    paddingBottom: 190,
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.dark,
    textAlign: "center",
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
  qrCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: 12,
  },
  qrImage: {
    width: 240,
    height: 240,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  qrPlaceholder: {
    width: 240,
    height: 240,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  qrPlaceholderText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.muted,
    textAlign: "center",
  },
  qrHint: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.muted,
    textAlign: "center",
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
  dangerButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#B91C1C",
  },
  disabledButton: {
    opacity: 0.55,
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
