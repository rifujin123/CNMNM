import { useState, useMemo } from "react";
import { ActivityIndicator, FlatList, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { scale } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TripChips from "../components/TripChips";
import TripTypeChips from "../components/TripTypeChip";

import { useBookings } from "../hooks/useBookings";
import TripSumaryCard from "../components/TripSumaryCard";

const tabs = ["upcoming", "completed", "cancelled"];

const typeTabs = [
    { label: "Tat ca", value: "all", icon: "checkmark" },
    { label: "Khach san", value: "hotel", icon: "business-outline" },
    { label: "Chuyen bay", value: "flight", icon: "airplane-outline" },
    { label: "dia diem", value: "place", icon: "location-outline" },
];

const TripDetailScreen = () => {
    const navigation = useNavigation();

    const [activeIndex, setActiveIndex] = useState(0);
    const [activeTypeIndex, setActiveTypeIndex] = useState(0);

    const route = useRoute();
    const bookingId = route.params?.bookingId;

    const { data: bookings = [], isLoading, refetch, isRefetching } = useBookings();

    const selectedBooking = useMemo(
    () => bookings.find((b) => String(b.id) === String(bookingId)),
    [bookings, bookingId]
    );

    const tripSummaries = useMemo(
    () =>
        bookings.map((booking) => ({
        id: String(booking.id),
        title: booking?.service?.name || "Untitled booking",
        date: booking?.service?.start_date || booking.created_date,
        price: Number(booking.total_price || 0).toLocaleString("vi-VN"),
        bookingStatus: booking.booking_status,
        paymentStatus: booking.payment_status,
        serviceType: booking?.service?.service_type,
        })),
    [bookings]
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>My Bookings</Text>
            </View>

            <TripChips
                items={tabs}
                activeIndex={activeIndex}
                onChange={(index) => setActiveIndex(index)}
            />

            <TripTypeChips
                items={typeTabs}
                activeIndex={activeTypeIndex}
                onChange={(index) => setActiveTypeIndex(index)}
            />

            {isLoading ? (
            <ActivityIndicator size="large" color="#0D9488" />
            ) : bookingId && selectedBooking ? (
            <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>{selectedBooking.service?.name}</Text>
                <Text>Package: {selectedBooking.tour_package?.name || "N/A"}</Text>
                <Text>Total: {Number(selectedBooking.total_price || 0).toLocaleString("vi-VN")} VND</Text>
                <Text>Status: {selectedBooking.booking_status}</Text>
                <Text>Payment: {selectedBooking.payment_status}</Text>
            </View>
            ) : (
            <FlatList
                data={tripSummaries}
                keyExtractor={(item) => item.id}
                refreshing={isRefetching}
                onRefresh={refetch}
                renderItem={({ item }) => (
                <TripSumaryCard
                    trip={item}
                    onPress={() => navigation.navigate("TripDetail", { bookingId: item.id })}
                />
                )}
            />
            )}
        </SafeAreaView>
    );
};

export default TripDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    header: {
        height: scale(70),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        paddingHorizontal: scale(20),
    },

    backButton: {
        position: "absolute",
        left: scale(20),
    },

    title: {
        fontSize: 20,
        fontWeight: "500",
        textAlign: "center",
    },
    detailCard: {
        margin: scale(16),
        padding: scale(16),
        borderRadius: scale(14),
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    detailTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: scale(8),
    },
});
