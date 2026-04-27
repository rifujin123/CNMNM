import React, { memo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";

export default memo(function PlaceCard({ place }) {
    return (
        <View style={styles.card}>
            <Image source={{ uri: place.image }} style={styles.image} />

            <View style={styles.info}>
                <Text style={styles.title}>
                    {place.title}
                </Text>
                <Text style={styles.location}>
                    {place.location}
                </Text>

                <View style={styles.rating}>
                    <Ionicons name="star" size={scale(14)} color="#F59E0B" />
                    <Text style={styles.ratingText}>{place.rating}</Text>
                </View>

                <Text style={styles.price}>
                    Từ $ {place.price}
                </Text>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        marginBottom: scale(20)
    },
    title: {
        fontSize: moderateScale(16),
        fontWeight: "700"
    },
    image: {
        width: scale(90),
        height: verticalScale(90),
        borderRadius: scale(12)
    },
    info: {
        marginLeft: scale(12),
        flex: 1
    },
    price: {
        fontSize: moderateScale(15),
        marginTop: verticalScale(6)
    },
    location: {
        fontSize: moderateScale(14),
        color: "#6B7280",
        marginTop: verticalScale(4),
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: verticalScale(6),
    },
    ratingText: {
        marginLeft: scale(4),
        fontSize: moderateScale(14),
        color: "#4B5563",
        fontWeight: "600"
    }
});
