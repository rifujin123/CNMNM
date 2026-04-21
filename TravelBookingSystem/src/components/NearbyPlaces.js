import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import PlaceCard from "../components/PlaceCard";

export default function NearbyPlaces({ places, onSeeAllPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Nearby Places</Text>

        <Pressable onPress={onSeeAllPress} hitSlop={8}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  seeAll: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: "500",
    color: "#2563EB",
  },
  listContent: {
    marginTop: 10,
    paddingRight: 24,
  },
});
