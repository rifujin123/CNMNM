import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { scale } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TripChips from "../components/TripChips";
import TripTypeChips from "../components/TripTypeChip";

const tabs = ["upcoming", "completed", "cancelled"];

const typeTabs = [
    { label: "Tất cả", value: "all", icon: "checkmark" },
    { label: "Khách sạn", value: "hotel", icon: "business-outline" },
    { label: "Chuyến bay", value: "flight", icon: "airplane-outline" },
    { label: "Địa điểm", value: "place", icon: "location-outline" },
];

const TripDetailScreen = () => {
    const navigation = useNavigation();

    const [activeIndex, setActiveIndex] = useState(0);
    const [activeTypeIndex, setActiveTypeIndex] = useState(0);

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
});