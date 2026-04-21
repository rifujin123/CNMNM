import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CategoryChips({ items, activeIndex = 0 }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Categories</Text>

      <View style={styles.row}>
        {items.map((item, idx) => {
          const active = idx === activeIndex;
          return (
            <View
              key={item}
              style={[styles.chip, active ? styles.active : styles.inactive]}
            >
              <Text
                style={[
                  styles.chipText,
                  active ? styles.activeText : styles.inactiveText,
                ]}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  row: { marginTop: 10, flexDirection: "row", gap: 10 },
  chip: {
    width: 84,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: "#0F172A" },
  inactive: { backgroundColor: "#E2E8F0" },
  chipText: { fontSize: 14, fontWeight: "500" },
  activeText: { color: "#FFF" },
  inactiveText: { color: "#475569" },
});
