import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import PlaceSection from "../components/PlaceSection";
import CategoryChips from "../components/CategoryChips";
import HotelCard from "../components/HotelCard";
import TransportCard from "../components/TransportCard";

const categories = ["All", "Tour", "Hotel", "Transport"];

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

const hotels = [
  {
    id: "h1",
    name: "Sea Breeze Hotel",
    meta: "4.8 ★  •  Near beach",
    color: "#BAE6FD",
    price: "From $110 / night",
  },
  {
    id: "h2",
    name: "Mountain Lodge",
    meta: "4.6 ★  •  Breakfast included",
    color: "#CFFAFE",
    price: "From $92 / night",
  },
  {
    id: "h3",
    name: "City Boutique",
    meta: "4.7 ★  •  Central district",
    color: "#A5F3FC",
    price: "From $135 / night",
  },
];

const transports = [
  {
    id: "t1",
    name: "Airport Shuttle",
    meta: "Every 30 mins",
    color: "#BBF7D0",
    price: "From $8 / seat",
  },
  {
    id: "t2",
    name: "Private Car",
    meta: "With driver",
    color: "#DCFCE7",
    price: "From $25 / trip",
  },
  {
    id: "t3",
    name: "City Bus Pass",
    meta: "Unlimited rides",
    color: "#86EFAC",
    price: "From $5 / day",
  },
];
const ExploreScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Explore" />
        <SearchBar placeholder="Search cities, places, hotels" />
        <CategoryChips items={categories} />
        <PlaceSection title="Recommended For You" places={places} />
        <PlaceSection
          title="Hotels"
          places={hotels}
          renderCard={(hotel) => <HotelCard hotel={hotel} />}
        />
        <PlaceSection
          title="Transport"
          places={transports}
          renderCard={(transport) => <TransportCard transport={transport} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreScreen;

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
