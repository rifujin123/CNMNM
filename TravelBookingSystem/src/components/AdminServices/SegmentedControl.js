import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export default function SegmentedControl({ options, value, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.segmentScroll}
    >
      {options.map((option) => {
        const active = value === option.key;

        return (
          <Pressable
            key={option.key}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(option.key)}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  segmentScroll: {
    marginTop: 12,
  },
  segment: {
    marginRight: 8,
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },
  segmentActive: {
    backgroundColor: "#2563EB",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#334155",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
});
