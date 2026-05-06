import React, { memo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";

const TripDetailCard = ({ trip, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
            <Image source={{ uri: trip.image }} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={1}>{trip.title}</Text>
                    <View style={[styles.badge, getBadgeStyle(trip.status)]}>
                        <Text style={styles.badgeText}>{getStatusLabel(trip.status)}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Entypo name="location-pin" size={scale(14)} color="#64748B" />
                    <Text style={styles.infoText} numberOfLines={1}>
                        {trip.location}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={scale(14)} color="#64748B" />
                    <Text style={styles.infoText}>{trip.date}</Text>
                </View>

                <View style={styles.bottomRow}>
                    <Text style={styles.price}>
                        <FontAwesome6 name="dong-sign" size={scale(12)} color="#0F172A" />
                        {" "}
                        {trip.price}
                    </Text>

                    <Ionicons name="chevron-forward" size={scale(18)} color="#94A3B8" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const getStatusLabel = (status) => {
    if (status === "upcoming") return "Sắp tới";
    if (status === "completed") return "Hoàn tất";
    if (status === "cancelled") return "Đã hủy";
    return status;
};

const getBadgeStyle = (status) => {
    if (status === "upcoming") {
        return { backgroundColor: "#DBEAFE" };
    }

    if (status === "completed") {
        return { backgroundColor: "#DCFCE7" };
    }

    if (status === "cancelled") {
        return { backgroundColor: "#FEE2E2" };
    }

    return { backgroundColor: "#E2E8F0" };
};

export default memo(TripDetailCard);

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: scale(18),
        padding: scale(12),
        marginBottom: verticalScale(14),
        shadowColor: "#0F172A",
        shadowOpacity: 0.08,
        shadowRadius: scale(8),
        shadowOffset: { width: 0, height: verticalScale(3) },
        elevation: 2,
    },
    image: {
        width: scale(92),
        height: scale(92),
        borderRadius: scale(14),
        backgroundColor: "#E2E8F0",
    },
    content: {
        flex: 1,
        marginLeft: scale(12),
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: scale(8),
    },
    title: {
        flex: 1,
        fontSize: moderateScale(15),
        fontWeight: "700",
        color: "#0F172A",
    },
    badge: {
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
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
        marginTop: verticalScale(6),
        gap: scale(4),
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(12),
        color: "#64748B",
    },
    bottomRow: {
        marginTop: verticalScale(8),
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