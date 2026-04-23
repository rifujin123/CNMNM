import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import PromoBanner from "../components/PromoBanner";
import CategoryChips from "../components/CategoryChips";
import PlaceSection from "../components/PlaceSection";

const places = [
  { id: "1", name: "Bali Beach", meta: "4.8 ★  •  2.3 km", color: "#93C5FD" },
  {
    id: "2",
    name: "Mountain View",
    meta: "4.7 ★  •  5.1 km",
    color: "#86EFAC",
  },
  { id: "3", name: "Bali Beach", meta: "4.8 ★  •  2.3 km", color: "#93C5FD" },
];

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Hello, Khoi" />
        <SearchBar placeholder="Search for a destination" />
        <PromoBanner />
        <PlaceSection title="Nearby Places" places={places} />
        <PlaceSection title="Recommended For You" places={places} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
