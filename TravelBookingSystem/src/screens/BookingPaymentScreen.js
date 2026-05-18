import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCancelPayment, usePayment } from "../hooks/usePayments";

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

const ACTIVE_STATUSES = ["PENDING", "PROCESSING", "REVIEW"];
const FAILED_STATUSES = ["FAILED", "CANCELLED", "EXPIRED"];

const formatMoney = (value, currency = "VND") => {
  const number = Number(value || 0);
  return `${number.toLocaleString("vi-VN")} ${currency}`;
};

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getGatewayUrl = (payment) => {
  const links = payment?.metadata?.gateway_links || {};

  return (
    links.deeplink ||
    payment?.payment_url ||
    links.payUrl ||
    links.qrCodeUrl ||
    null
  );
};

const getMethodLabel = (method) => {
  if (method === "MOMO") return "MoMo";
  if (method === "VNPAY") return "VNPay";
  if (method === "STATIC_QR") return "Static QR";
  return method || "Payment";
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
      text: "Transfer with the content below. Provider or admin will confirm after checking the transaction.",
      color: COLORS.primary,
      backgroundColor: "#CCFBF1",
    };
  }

  return {
    icon: method === "VNPAY" ? "card-outline" : "wallet-outline",
    title: `${getMethodLabel(method)} Payment`,
    text: "Complete payment in the gateway. This screen will update automatically after confirmation.",
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

  const cancelPaymentMutation = useCancelPayment();

  const transferContent = useMemo(() => {
    return payment?.metadata?.transfer_content || payment?.transaction_id || "N/A";
  }, [payment]);

  const gatewayUrl = useMemo(() => getGatewayUrl(payment), [payment]);

  const status = payment?.payment_status || "PROCESSING";
  const method = payment?.payment_method || "STATIC_QR";
  const isStaticQr = method === "STATIC_QR";
  const isGatewayPayment = method === "MOMO" || method === "VNPAY";
  const isActive = ACTIVE_STATUSES.includes(status);
  const isFailed = FAILED_STATUSES.includes(status);
  const canOpenGateway = isGatewayPayment && gatewayUrl && ["PENDING", "PROCESSING"].includes(status);
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

  const openGateway = async () => {
    if (!gatewayUrl) {
      Alert.alert("Payment link unavailable", "Please refresh and try again.");
      return;
    }

    try {
      await Linking.openURL(gatewayUrl);
    } catch (err) {
      Alert.alert("Cannot open payment gateway", "Please try again later.");
    }
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
              await cancelPaymentMutation.mutateAsync({
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
              label="Gateway Transaction"
              value={payment.provider_transaction_id}
            />
          ) : null}

          <InfoRow label="Expires At" value={formatDateTime(payment?.expires_at)} />

          {canOpenGateway ? (
            <Pressable style={styles.inlineButton} onPress={openGateway}>
              <Ionicons name="open-outline" size={18} color={COLORS.white} />
              <Text style={styles.inlineButtonText}>Open Payment Gateway</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.noteText}>
            {isStaticQr
              ? "Static QR payments are confirmed by provider or admin only."
              : "MoMo and VNPay payments are confirmed automatically from gateway IPN."}
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

        {isActive ? (
          <Pressable style={styles.primaryButton} onPress={refetch}>
            <Text style={styles.primaryButtonText}>Refresh Status</Text>
          </Pressable>
        ) : null}

        {canCancelStaticQr ? (
          <Pressable
            style={[
              styles.dangerButton,
              cancelPaymentMutation.isPending && styles.disabledButton,
            ]}
            disabled={cancelPaymentMutation.isPending}
            onPress={handleCancelPayment}
          >
            <Text style={styles.dangerButtonText}>
              {cancelPaymentMutation.isPending ? "Cancelling..." : "Cancel Payment"}
            </Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.secondaryButton} onPress={goToTrips}>
          <Text style={styles.secondaryButtonText}>View My Trips</Text>
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
  inlineButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  inlineButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.white,
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
