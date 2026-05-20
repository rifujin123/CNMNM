import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TripTypeChips({ items, activeIndex = 0, onChange }) {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {items.map((item, index) => {
                    const active = index === activeIndex;

                    return (
                        <TouchableOpacity
                            key={item.value}
                            style={[styles.chip, active && styles.activeChip]}
                            activeOpacity={0.8}
                            onPress={() => onChange(index)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={scale(18)}
                                color={active ? "#2563EB" : "#111827"}
                            />

                            <Text style={[styles.text, active && styles.activeText]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#EEF4FF",
    },
    container: {
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(14),
        gap: scale(10),
    },
    chip: {
        height: verticalScale(30),
        paddingHorizontal: scale(18),
        borderRadius: scale(23),
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        flexDirection: "row",
        alignItems: "center",
        gap: scale(8),
    },
    activeChip: {
        backgroundColor: "#DBEAFE",
        borderColor: "#2563EB",
        borderWidth: 2,
    },
    text: {
        fontSize: scale(10),
        fontWeight: "600",
        color: "#111827",
    },
    activeText: {
        color: "#2563EB",
    },
});