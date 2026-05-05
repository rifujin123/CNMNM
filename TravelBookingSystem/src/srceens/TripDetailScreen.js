import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { scale } from "react-native-size-matters";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

const tabs = ["upcoming", "completed", "cancelled"]


const TripDetailScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={32} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Đơn đặt chỗ của tôi</Text>
            </View>
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