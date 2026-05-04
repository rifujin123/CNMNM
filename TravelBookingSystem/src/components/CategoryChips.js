import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableNativeFeedback,
} from "react-native";

export default function CategoryChips({
  categories = [],
  activeIndex = 0,
  onSelect,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Categories</Text>

      <View style={styles.row}>
        {categories.map((category, idx) => {
          const active = idx === activeIndex;
          return (
            <Pressable
              key={category.id}
              onPress={() => onSelect?.(category, idx)}
              style={[styles.chip, active ? styles.active : styles.inactive]}
            >
              <Text
                style={[
                  styles.chipText,
                  active ? styles.activeText : styles.inactiveText,
                ]}
              >
                {category.name}
              </Text>
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
  },
  active: { backgroundColor: "#0F172A" },
  inactive: { backgroundColor: "#E2E8F0" },
  chipText: { fontSize: 14, fontWeight: "500" },
  activeText: { color: "#FFF" },
  inactiveText: { color: "#475569" },
});
