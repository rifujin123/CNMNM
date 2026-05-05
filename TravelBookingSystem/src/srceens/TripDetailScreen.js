import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { scale } from "react-native-size-matters";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TripChips from "../components/TripChips";

const tabs = ["upcoming", "completed", "cancelled"]


const TripDetailScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Đơn đặt chỗ của tôi</Text>
            </View>
            <TripChips items={tabs} activeIndex={0} />
        </SafeAreaView>
    );
}

export default TripDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: scale(20),
        marginTop: StatusBar.currentHeight || 0,
    },
    header: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: scale(16)
    },
    backButton: {
        position: "absolute",
        left: 0,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
    }
});