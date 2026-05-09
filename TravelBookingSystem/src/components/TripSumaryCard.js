import React, { memo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";

const getStatusLabel = (status) => {
    if (status === "upcomming") return "Sắp tới";
    if (status === "completed") return "Hoàn tất";
    if (status === "cancelled") return "Đã hủy";
    return status;
};

const getBadgeStyle = (status) => {
    if (status === "upcomming") return { backgroundColor: "#FFF9C4", color: "#E65100" };
    if (status === "completed") return { backgroundColor: "#C8E6C9", color: "#1B5E20" };
    if (status === "cancelled") return { backgroundColor: "#FFCDD2", color: "#B71C1C" };
    return { backgroundColor: "#E0E0E0", color: "#424242" };
};

const TripSumaryCard = ({ trip, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.title} numberOfLines={1}>{trip.title}</Text>

                </View>
                <View style={[styles.badge, getBadgeStyle(trip.status)]}>
                    <Text style={styles.badgeText}>{getStatusLabel(trip.status)}</Text>
                </View>
            </View>
            <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={scale(14)} color="#64748B" />
                <Text style={styles.infoText}>{trip.date}</Text>
            </View>
            <View style={styles.bottomRow}>
                <Text style={styles.price}>
                    <FontAwesome6 name="dong-sign" size={scale(12)} color="#0F172A" />{" "}
                    {trip.price}
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
        alignItems: "center",
        justifyContent: "space-between",
        gap: scale(8),
    },
    title: {
        flex: 1,
        fontSize: moderateScale(16),
        fontWeight: "700",
        color: "#0F172A",
    },
    badge: {
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(12),
    },
    badgeText: {
        fontSize: moderateScale(10),
        fontWeight: "700",
        color: "#0F172A",
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