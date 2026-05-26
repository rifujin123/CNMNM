import React, { useMemo, useState } from "react";
import {ActivityIndicator,FlatList,Pressable,StatusBar,StyleSheet,Text,View,} from "react-native";
import AppHeader from "../components/AppHeader";
import { scale } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import TripSumaryCard from "../components/TripSumaryCard";
import { useAuth } from "../../context/AuthContext";
import { useBookings } from "../hooks/useBookings";
import GuestHero from "../components/GuestHero";
import TripChips from "../components/TripChips";
import CategoryFilterChips from "../components/CategoryFilterChips";


const statusTabs = ["upcoming", "completed", "cancelled"];
const statusGroups = {
  upcoming: ["pending", "confirmed"],
  completed: ["completed"],
  cancelled: ["cancelled", "expired", "payment_failed", "refunded"],
};

const normalize = (value) => String(value || "").toLowerCase();

const getServiceType = (booking) =>
  normalize(booking?.service?.service_type || booking?.service_type || "tour");

const getTripGroupStatus = (bookingStatus) => {
  const status = normalize(bookingStatus);

  if (["pending", "confirmed"].includes(status)) return "upcoming";
  if (status === "completed") return "completed";

  return "cancelled";
};

const formatDate = (value) => {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatPrice = (value) => {
  const number = Number(value || 0);

  if (Number.isNaN(number)) {
    return String(value || "0");
  }

  return number.toLocaleString("vi-VN");
};

const mapBookingToTrip = (booking) => {
  const service = booking?.service ?? {};

  return {
    id: String(booking.id),
    title: service.name || "Untitled booking",
    date: formatDate(service.start_date || booking.created_date),
    price: formatPrice(booking.total_price),
    status: getTripGroupStatus(booking.booking_status),
    bookingStatus: booking.booking_status,
    paymentStatus: booking.payment_status,
    serviceType: getServiceType(booking),
  };
};

const TripsScreen = () => {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();
  const [activeStatusIndex, setActiveStatusIndex] = useState(0);
  const [activeType, setActiveType] = useState("all");

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useBookings();

  const filteredBookings = useMemo(() => {
    const activeStatus = statusTabs[activeStatusIndex] || "upcoming";
    const allowedStatuses = statusGroups[activeStatus] || [];

    return bookings.filter((booking) => {
      const statusMatches = allowedStatuses.includes(
        String(booking.booking_status || "").toLowerCase()
      );

      const serviceType = getServiceType(booking);

      const typeMatches = activeType === "all" || serviceType === activeType;

      return statusMatches && typeMatches;
    });
  }, [activeStatusIndex, activeType, bookings]);

  const tripSummaries = useMemo(
    () => filteredBookings.map(mapBookingToTrip),
    [filteredBookings],
  );

  const goToHome = () => {
    navigation.getParent()?.navigate("HomeFeed", {
      screen: "Home",
    });
  };

  const goToLogin = () => {
    navigation.navigate("Login");
  };

  const openBookingDetail = (bookingId) => {
    navigation.navigate("TripDetail", { bookingId });
  };

  if (!isLoggedIn) {
    return (
          <SafeAreaView style={styles.container}>
          <AppHeader title="Trip" />
          <View style={styles.guestWrapper}>
            <GuestHero onLoginPress={goToLogin} />
          </View>
          </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Trip" />

        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Trip" />

        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Cannot load bookings</Text>
          <Text style={styles.stateText}>
            Please check your connection and try again.
          </Text>

          <Pressable style={styles.primaryButton} onPress={refetch}>
            <Text style={styles.primaryButtonText}>
              {isRefetching ? "Retrying..." : "Try Again"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Trip" />

      <View style={styles.content}>
        <TripChips
          items={statusTabs}
          activeIndex={activeStatusIndex}
          onChange={setActiveStatusIndex}
        />

        <View style={styles.typeFilterWrapper}>
          <CategoryFilterChips
            activeFilter={activeType}
            onFilterChange={setActiveType}
          />
        </View>

        <FlatList
          data={tripSummaries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripSumaryCard
              trip={item}
              onPress={() => openBookingDetail(item.id)}
            />
          )}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            tripSummaries.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={
            <View style={styles.textNoTrip}>
              <Text style={styles.textNoTripTitle}>No Bookings, No Trips Yet!</Text>
              <Text style={styles.textNoTripContent}>
                When you create any booking, we will create a trip here so you can plan and manage your journey.
              </Text>

              <Pressable style={styles.primaryButton} onPress={goToHome}>
                <Text style={styles.primaryButtonText}>Explore Now</Text>
              </Pressable>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default TripsScreen;

const styles = StyleSheet.create({
container: {flex: 1,backgroundColor: "#F8FAFC",paddingHorizontal: scale(20),marginTop: StatusBar.currentHeight || 0,},
content: {flex: 1,},
guestWrapper: {flex: 1,justifyContent: "center",paddingHorizontal: scale(4),},
typeFilterWrapper: {marginTop: scale(10),marginBottom: scale(6),},
listContent: {paddingBottom: scale(24),},
emptyListContent: {flexGrow: 1,},
primaryButton: {marginTop: scale(8),minWidth: scale(140),height: scale(46),borderRadius: scale(14),backgroundColor: "#2563EB",alignItems: "center",justifyContent: "center",paddingHorizontal: scale(18),},
textNoTripContent: {fontSize: 14,lineHeight: 20,fontWeight: "400",color: "#64748B",textAlign: "center",},
centerState: {flex: 1,alignItems: "center",justifyContent: "center",gap: scale(12),paddingHorizontal: scale(16),},
stateTitle: {fontSize: 20,lineHeight: 24,fontWeight: "700",color: "#0F172A",textAlign: "center",},
stateText: {fontSize: 14,lineHeight: 20,color: "#64748B",textAlign: "center",},
primaryButtonText: {fontSize: 14,fontWeight: "800",color: "#FFFFFF",},
textNoTrip: {alignItems: "center",justifyContent: "center",gap: scale(8),marginTop: scale(100),paddingHorizontal: scale(10),},
textNoTripTitle: {fontSize: 20,lineHeight: 24,fontWeight: "700",color: "#0F172A",textAlign: "center",},
});
