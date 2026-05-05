import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function CategoryChips({
  categories = [],
  items,
  onChipPress,
}) {
  const list =
    categories.length > 0 ? categories : Array.isArray(items) ? items : [];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Categories</Text>

      <View style={styles.row}>
        {list.map((category, idx) => {
          const key =
            category != null &&
            typeof category === "object" &&
            category.id != null
              ? String(category.id)
              : `chip-${idx}`;
          const label =
            category != null &&
            typeof category === "object" &&
            category.name != null
              ? String(category.name)
              : String(category ?? "—");
          return (
            <Pressable
              key={key}
              onPress={() => onChipPress?.(category, idx)}
              style={styles.chip}
              android_ripple={{ color: "rgba(15,23,42,0.08)" }}
            >
              <Text style={styles.chipText}>{label}</Text>
            </Pressable>
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
    backgroundColor: "#E2E8F0",
  },
  chipText: { fontSize: 14, fontWeight: "500", color: "#475569" },
});
